import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { AuthStorage } from '@/lib/auth-store';
import { DraftStore } from '@/lib/db';
import { syncPendingDrafts } from '@/lib/sync';
import NetInfo from '@react-native-community/netinfo';

const PAYMENT_MODES = ['Cash', 'Cheque', 'Bank Transfer'] as const;
type PaymentMode = (typeof PAYMENT_MODES)[number];

export default function CreditNoteScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { parentId, customerName, customerId } = useLocalSearchParams<{
    parentId: string;
    customerName: string;
    customerId: string;
  }>();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);

  async function takePicture() {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) return;
    }
    setShowCamera(true);
  }

  async function onCameraCapture() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) setPhotoUri(photo.uri);
    setShowCamera(false);
  }

  async function handleSave() {
    if (!amount) {
      Alert.alert('Missing fields', 'Please enter an amount.');
      return;
    }

    setSaving(true);
    try {
      let gpsLat: number | null = null;
      let gpsLong: number | null = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          gpsLat = loc.coords.latitude;
          gpsLong = loc.coords.longitude;
        }
      } catch {
        // GPS optional
      }

      const net = await NetInfo.fetch();

      if (net.isConnected) {
        const formData = new FormData();
        formData.append('customer_id', customerId);
        formData.append('type', '381');
        formData.append('parent_id', parentId);
        formData.append('amount', amount);
        formData.append('payment_mode', paymentMode);
        if (description) formData.append('description', description);
        if (gpsLat) formData.append('gps_lat', String(gpsLat));
        if (gpsLong) formData.append('gps_long', String(gpsLong));
        if (photoUri) {
          formData.append('evidence_image', {
            uri: photoUri,
            type: 'image/jpeg',
            name: 'evidence.jpg',
          } as any);
        }

        const token = await AuthStorage.getToken();
        const apiBase = typeof document !== 'undefined'
          ? (process.env.EXPO_PUBLIC_WEB_API_URL ?? 'http://localhost/api')
          : (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2/api');

        const res = await fetch(`${apiBase}/documents`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          Alert.alert('Error', err?.message ?? `Server error (${res.status})`);
          return;
        }

        Alert.alert('Saved', t('creditNote.savedOnline'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await DraftStore.insert({
          uuid: uuidv4(),
          customer_id: Number(customerId),
          type: '381',
          parent_id: Number(parentId),
          amount: parseFloat(amount),
          payment_mode: paymentMode,
          description: description || null,
          gps_lat: gpsLat,
          gps_long: gpsLong,
          created_at_local: new Date().toISOString(),
        });

        Alert.alert('Saved Offline', t('creditNote.savedOffline'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }

      syncPendingDrafts();
    } finally {
      setSaving(false);
    }
  }

  if (showCamera) {
    return (
      <View className="flex-1 bg-black">
        <CameraView ref={cameraRef} className="flex-1" facing="back" />
        <View className="absolute bottom-10 w-full items-center">
          <TouchableOpacity
            className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 items-center justify-center"
            onPress={onCameraCapture}
          />
        </View>
        <TouchableOpacity
          className="absolute top-12 left-6 bg-black/50 rounded-full px-4 py-2"
          onPress={() => setShowCamera(false)}
        >
          <Text className="text-white">✕ Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1" contentContainerClassName="px-4 pt-6 pb-20" keyboardShouldPersistTaps="handled">
        <Text className="text-xl font-bold text-gray-900 mb-1">{t('creditNote.title')}</Text>
        <Text className="text-sm text-gray-500 mb-6">{t('creditNote.for')}: {customerName}</Text>

        {/* Amount */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">{t('creditNote.amount')}</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">{t('creditNote.description')}</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholder="Reason for credit note..."
          />
        </View>

        {/* Payment mode */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">{t('creditNote.paymentMode')}</Text>
          <View className="flex-row gap-2">
            {PAYMENT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                className={`flex-1 py-2 rounded-xl border items-center ${
                  paymentMode === mode ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                }`}
                onPress={() => setPaymentMode(mode)}
              >
                <Text className={`text-xs font-medium ${paymentMode === mode ? 'text-white' : 'text-gray-600'}`}>
                  {t(`receipt.${mode === 'Bank Transfer' ? 'bankTransfer' : mode.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Evidence photo */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">{t('creditNote.photo')}</Text>
          {photoUri ? (
            <View className="relative">
              <Image source={{ uri: photoUri }} className="w-full h-48 rounded-xl" />
              <TouchableOpacity
                className="absolute top-2 right-2 bg-black/50 rounded-full px-3 py-1"
                onPress={() => setPhotoUri(null)}
              >
                <Text className="text-white text-xs">Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-xl h-32 items-center justify-center bg-white"
              onPress={takePicture}
            >
              <Text className="text-4xl mb-1">📷</Text>
              <Text className="text-gray-500 text-sm">{t('creditNote.takePhoto')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save button */}
        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${saving ? 'bg-gray-400' : 'bg-orange-500'}`}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">{t('creditNote.save')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
