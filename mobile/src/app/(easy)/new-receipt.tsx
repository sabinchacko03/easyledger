import NetInfo from '@react-native-community/netinfo';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

import { api } from '@/lib/api';
import { EasyReceiptStore } from '@/lib/db';

const PAYMENT_MODES = ['Cash', 'Cheque', 'Bank Transfer', 'Credit'];
const DEFAULT_LIMIT = 50;

export default function EasyNewReceiptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    api.get<{ max_free_receipts: number }>('/easy/config')
      .then((r) => setLimit(r.max_free_receipts))
      .catch(() => {});
  }, []);

  async function openCamera() {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission needed', 'Camera access is required to take evidence photos.');
        return;
      }
    }
    setCameraOpen(true);
  }

  async function takePhoto() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setCameraOpen(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo.');
    }
  }

  async function handleSubmit() {
    if (!customerName.trim()) {
      Alert.alert('Required', 'Please enter the customer name.');
      return;
    }
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Required', 'Please enter a valid amount.');
      return;
    }

    // Check limit
    const currentCount = await EasyReceiptStore.count();
    if (currentCount >= limit) {
      Alert.alert(
        'Limit Reached',
        'You have reached the maximum number of free receipts. Please upgrade your account.',
        [
          { text: 'Upgrade', onPress: () => router.push('/(easy)/upgrade') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
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
        // GPS optional
      }

      await EasyReceiptStore.insert({
        uuid: uuidv4(),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        amount: parsed,
        payment_mode: paymentMode,
        description: description.trim() || null,
        photo_uri: photoUri,
        gps_lat,
        gps_long,
        created_at_local: new Date().toISOString(),
      });

      const newCount = await EasyReceiptStore.count();

      if (newCount >= limit) {
        Alert.alert(
          'Receipt Saved',
          "You've reached your receipt limit. Upgrade your account to continue creating receipts.",
          [
            { text: 'Upgrade Now', onPress: () => router.replace('/(easy)/upgrade') },
            { text: 'Later', onPress: () => router.back() },
          ]
        );
      } else {
        Alert.alert('Saved', 'Receipt saved successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
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
                style={{ width: 72, height: 72 }}
                className="rounded-full bg-white border-4 border-gray-300 items-center justify-center"
                onPress={takePhoto}
              >
                <View style={{ width: 56, height: 56 }} className="rounded-full bg-white" />
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold text-gray-900 mb-6">New Receipt</Text>

          {/* Customer name */}
          <Text className="text-sm font-semibold text-gray-600 mb-1">Customer Name *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white mb-4"
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="e.g. Ahmed Al Rashid"
            autoCapitalize="words"
          />

          {/* Customer phone */}
          <Text className="text-sm font-semibold text-gray-600 mb-1">Customer Phone</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white mb-4"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="+971 50 000 0000"
            keyboardType="phone-pad"
          />

          {/* Amount */}
          <Text className="text-sm font-semibold text-gray-600 mb-1">Amount (AED) *</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white mb-4"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          {/* Payment mode */}
          <Text className="text-sm font-semibold text-gray-600 mb-2">Payment Mode</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {PAYMENT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                className={`px-4 py-2 rounded-full border ${
                  paymentMode === mode ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                }`}
                onPress={() => setPaymentMode(mode)}
              >
                <Text className={`text-sm font-medium ${paymentMode === mode ? 'text-white' : 'text-gray-600'}`}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
                  onPress={openCamera}
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
              onPress={openCamera}
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
              <Text className="text-white font-bold text-base">Save Receipt</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
