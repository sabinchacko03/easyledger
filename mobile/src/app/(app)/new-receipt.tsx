import NetInfo from '@react-native-community/netinfo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { api } from '@/lib/api';
import { CustomerCache, DraftStore } from '@/lib/db';

interface Customer {
  id: number;
  name: string;
  trn?: string;
  phone?: string;
}

interface ChequeItem {
  chequeNo: string;
  amount: string;
}

const PAYMENT_MODES = ['Cash', 'Cheque', 'Bank Transfer'];

export default function NewReceiptScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'evidence' | 'transfer'>('evidence');
  const [submitting, setSubmitting] = useState(false);

  // Cheque state
  const [chequeCount, setChequeCount] = useState(1);
  const [cheques, setCheques] = useState<ChequeItem[]>([{ chequeNo: '', amount: '' }]);

  // Bank transfer screenshot
  const [transferPhotoUri, setTransferPhotoUri] = useState<string | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const { data: allCustomers = [] } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        const online = await api.get<Customer[]>('/customers');
        await CustomerCache.upsertMany(online as any[]);
        return online;
      } catch {
        return CustomerCache.getAll() as any;
      }
    },
  });

  const filteredCustomers =
    customerSearch.trim().length > 0
      ? allCustomers.filter((c) => {
          const q = customerSearch.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            (c.trn ?? '').toLowerCase().includes(q)
          );
        })
      : allCustomers.slice(0, 10);

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c);
    setCustomerSearch(c.name);
    setDropdownOpen(false);
  }

  function handlePaymentModeChange(mode: string) {
    setPaymentMode(mode);
    if (mode !== 'Cheque') {
      setChequeCount(1);
      setCheques([{ chequeNo: '', amount: '' }]);
    }
    if (mode !== 'Bank Transfer') {
      setTransferPhotoUri(null);
    }
  }

  function adjustChequeCount(delta: number) {
    const next = chequeCount + delta;
    if (next < 1 || next > 10) return;
    setChequeCount(next);
    if (delta > 0) {
      setCheques((prev) => [...prev, { chequeNo: '', amount: '' }]);
    } else {
      setCheques((prev) => prev.slice(0, -1));
    }
  }

  function updateCheque(idx: number, field: keyof ChequeItem, value: string) {
    setCheques((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  async function openCamera(mode: 'evidence' | 'transfer' = 'evidence') {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission needed', 'Camera access is required to take photos.');
        return;
      }
    }
    setCameraMode(mode);
    setCameraOpen(true);
  }

  async function takePhoto() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        if (cameraMode === 'evidence') {
          setPhotoUri(photo.uri);
        } else {
          setTransferPhotoUri(photo.uri);
        }
        setCameraOpen(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo.');
    }
  }

  async function pickTransferScreenshot() {
    Alert.alert(
      'Transfer Screenshot',
      'Choose how to add the screenshot',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera('transfer'),
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              setTransferPhotoUri(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  async function handleSubmit() {
    if (!selectedCustomer) {
      Alert.alert('Required', 'Please select a customer.');
      return;
    }

    let parsed: number;
    if (paymentMode === 'Cheque') {
      if (cheques.some((c) => !c.amount || isNaN(parseFloat(c.amount)) || parseFloat(c.amount) <= 0)) {
        Alert.alert('Required', 'Please enter a valid amount for each cheque.');
        return;
      }
      parsed = cheques.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    } else {
      parsed = parseFloat(amount);
      if (!amount || isNaN(parsed) || parsed <= 0) {
        Alert.alert('Required', 'Please enter a valid amount.');
        return;
      }
    }

    if (paymentMode === 'Bank Transfer' && !transferPhotoUri) {
      Alert.alert('Required', 'Please add a transfer screenshot for bank transfers.');
      return;
    }

    setSubmitting(true);
    try {
      let gps_lat: number | null = null;
      let gps_long: number | null = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          gps_lat = loc.coords.latitude;
          gps_long = loc.coords.longitude;
        }
      } catch {
        // GPS is optional
      }

      const chequeDetailsJson = paymentMode === 'Cheque' ? JSON.stringify(cheques) : null;
      const network = await NetInfo.fetch();

      if (network.isConnected) {
        const formData = new FormData();
        formData.append('customer_id', String(selectedCustomer.id));
        formData.append('type', '380');
        formData.append('amount', String(parsed));
        formData.append('payment_mode', paymentMode);
        if (chequeDetailsJson) formData.append('cheque_details', chequeDetailsJson);
        if (description) formData.append('description', description);
        if (gps_lat !== null) formData.append('gps_lat', String(gps_lat));
        if (gps_long !== null) formData.append('gps_long', String(gps_long));
        if (photoUri) {
          const filename = photoUri.split('/').pop() ?? 'photo.jpg';
          formData.append('evidence_image', {
            uri: photoUri,
            name: filename,
            type: 'image/jpeg',
          } as any);
        }
        if (transferPhotoUri) {
          const filename = transferPhotoUri.split('/').pop() ?? 'transfer.jpg';
          formData.append('transfer_screenshot', {
            uri: transferPhotoUri,
            name: filename,
            type: 'image/jpeg',
          } as any);
        }

        await api.postForm('/documents', formData);
        await queryClient.invalidateQueries({ queryKey: ['documents-list'] });
        await queryClient.invalidateQueries({ queryKey: ['documents-summary'] });
        await queryClient.invalidateQueries({ queryKey: ['daily-stats'] });
        Alert.alert('Success', 'Receipt created!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await DraftStore.insert({
          uuid: uuidv4(),
          customer_id: selectedCustomer.id,
          type: '380',
          amount: parsed,
          payment_mode: paymentMode,
          cheque_details: chequeDetailsJson,
          description: description || null,
          gps_lat,
          gps_long,
          created_at_local: new Date().toISOString(),
        });
        Alert.alert(
          'Saved Offline',
          'Receipt saved as draft and will sync when you are back online.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  const chequeTotal = cheques.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return (
    <>
      {/* Camera modal */}
      <Modal visible={cameraOpen} animationType="slide">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View className="flex-1 justify-end pb-12 items-center">
            <View className="flex-row gap-8 items-center">
              <TouchableOpacity
                className="bg-white/20 rounded-full px-6 py-3"
                onPress={() => setCameraOpen(false)}
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-18 h-18 rounded-full bg-white border-4 border-gray-300 items-center justify-center"
                style={{ width: 72, height: 72 }}
                onPress={takePhoto}
              >
                <View className="w-14 h-14 rounded-full bg-white" style={{ width: 56, height: 56 }} />
              </TouchableOpacity>
              <View style={{ width: 80 }} />
            </View>
          </View>
        </CameraView>
      </Modal>

      <KeyboardAvoidingView
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: insets.top + 16,
            paddingBottom: 48,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold text-gray-900 mb-6">New Receipt</Text>

          {/* Customer selector */}
          <Text className="text-sm font-semibold text-gray-600 mb-1">Customer *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white mb-1"
            value={customerSearch}
            onChangeText={(t) => {
              setCustomerSearch(t);
              setSelectedCustomer(null);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Search by name or TRN..."
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {dropdownOpen && filteredCustomers.length > 0 && (
            <View
              className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden"
              style={{ maxHeight: 220 }}
            >
              <FlatList
                data={filteredCustomers}
                keyExtractor={(c) => String(c.id)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-4 py-3 border-b border-gray-100"
                    onPress={() => selectCustomer(item)}
                  >
                    <Text className="text-sm font-medium text-gray-800">{item.name}</Text>
                    {item.trn ? (
                      <Text className="text-xs text-gray-400 mt-0.5">TRN: {item.trn}</Text>
                    ) : null}
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
          {!dropdownOpen && selectedCustomer && (
            <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mb-4 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-blue-800">{selectedCustomer.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCustomer(null);
                  setCustomerSearch('');
                }}
              >
                <Text className="text-xs text-blue-500 font-medium">Change</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Payment mode */}
          <Text className="text-sm font-semibold text-gray-600 mb-2">Payment Mode</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {PAYMENT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                className={`px-4 py-2 rounded-full border ${
                  paymentMode === mode
                    ? 'bg-primary border-primary'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => handlePaymentModeChange(mode)}
              >
                <Text
                  className={`text-sm font-medium ${
                    paymentMode === mode ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount — hidden when Cheque (amounts entered per cheque below) */}
          {paymentMode !== 'Cheque' && (
            <>
              <Text className="text-sm font-semibold text-gray-600 mb-1">Amount (AED) *</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white mb-4"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </>
          )}

          {/* Cheque details */}
          {paymentMode === 'Cheque' && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2">Number of Cheques</Text>
              <View className="flex-row items-center gap-4 mb-3">
                <TouchableOpacity
                  className="w-9 h-9 rounded-full bg-gray-100 border border-gray-300 items-center justify-center"
                  onPress={() => adjustChequeCount(-1)}
                >
                  <Text className="text-xl font-bold text-gray-700" style={{ lineHeight: 24 }}>−</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 w-6 text-center">{chequeCount}</Text>
                <TouchableOpacity
                  className="w-9 h-9 rounded-full bg-gray-100 border border-gray-300 items-center justify-center"
                  onPress={() => adjustChequeCount(1)}
                >
                  <Text className="text-xl font-bold text-gray-700" style={{ lineHeight: 24 }}>+</Text>
                </TouchableOpacity>
              </View>

              {cheques.map((cheque, idx) => (
                <View key={idx} className="bg-white border border-gray-200 rounded-xl p-3 mb-2">
                  <Text className="text-xs font-semibold text-gray-500 mb-2">
                    Cheque {chequeCount > 1 ? idx + 1 : ''}
                  </Text>
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 mb-1">Cheque No.</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
                        value={cheque.chequeNo}
                        onChangeText={(t) => updateCheque(idx, 'chequeNo', t)}
                        placeholder="e.g. 001234"
                        keyboardType="numeric"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 mb-1">Amount (AED) *</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
                        value={cheque.amount}
                        onChangeText={(t) => updateCheque(idx, 'amount', t)}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>
              ))}

              {chequeCount > 1 && (
                <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mt-1">
                  <Text className="text-sm font-semibold text-blue-700">
                    Total: AED {chequeTotal.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Bank transfer screenshot */}
          {paymentMode === 'Bank Transfer' && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Transfer Screenshot <Text className="text-red-500">*</Text>
              </Text>
              {transferPhotoUri ? (
                <View>
                  <Image
                    source={{ uri: transferPhotoUri }}
                    className="w-full rounded-xl"
                    style={{ height: 180 }}
                    resizeMode="cover"
                  />
                  <View className="flex-row gap-2 mt-2">
                    <TouchableOpacity
                      className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5"
                      onPress={pickTransferScreenshot}
                    >
                      <Text className="text-xs text-gray-600">Replace</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5"
                      onPress={() => setTransferPhotoUri(null)}
                    >
                      <Text className="text-xs text-gray-600">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  className="border-2 border-dashed border-red-300 rounded-xl items-center justify-center py-8 bg-red-50"
                  onPress={pickTransferScreenshot}
                >
                  <Text style={{ fontSize: 28 }}>🧾</Text>
                  <Text className="text-sm text-red-500 mt-2 font-medium">
                    Tap to add transfer screenshot
                  </Text>
                  <Text className="text-xs text-red-400 mt-0.5">Required for bank transfer</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Description */}
          <Text className="text-sm font-semibold text-gray-600 mb-1">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white mb-4"
            value={description}
            onChangeText={setDescription}
            placeholder="Optional note..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 80 }}
          />

          {/* Evidence photo */}
          <Text className="text-sm font-semibold text-gray-600 mb-2">Evidence Photo</Text>
          {photoUri ? (
            <View className="mb-4">
              <Image
                source={{ uri: photoUri }}
                className="w-full rounded-xl"
                style={{ height: 180 }}
                resizeMode="cover"
              />
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5"
                  onPress={() => openCamera('evidence')}
                >
                  <Text className="text-xs text-gray-600">Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5"
                  onPress={() => setPhotoUri(null)}
                >
                  <Text className="text-xs text-gray-600">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-xl items-center justify-center py-8 mb-4 bg-white"
              onPress={() => openCamera('evidence')}
            >
              <Text style={{ fontSize: 28 }}>📷</Text>
              <Text className="text-sm text-gray-400 mt-2">Tap to take a photo</Text>
            </TouchableOpacity>
          )}

          {/* Submit */}
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${submitting ? 'bg-blue-300' : 'bg-primary'}`}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Create Receipt</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
