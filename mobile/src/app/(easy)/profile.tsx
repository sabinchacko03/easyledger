import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth, useEasyProfile } from '@/lib/auth-context';
import { AuthStorage } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { EasyReceiptStore } from '@/lib/db';

const DEFAULT_LIMIT = 50;

export default function EasyProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setAuthState } = useAuth();
  const profile = useEasyProfile();

  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    if (profile?.trn) EasyReceiptStore.count(profile.trn).then(setCount);
    api.get<{ max_free_receipts: number }>('/easy/config')
      .then((r) => setLimit(r.max_free_receipts))
      .catch(() => {});
  }, [profile?.trn]);

  async function handlePickLogo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Gallery access is required to upload a logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const logo_uri = result.assets[0].uri;
    const updated = { ...profile!, logo_uri };
    await AuthStorage.save({ mode: 'easy', profile: updated });
    setAuthState({ mode: 'easy', profile: updated });
  }

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'This will clear easy mode. Your locally saved receipts will remain. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            if (profile?.trn) {
              await AuthStorage.savePendingSyncTrn(profile.trn);
            }
            await AuthStorage.clear();
            setAuthState(null);
          },
        },
      ]
    );
  }

  const progress = Math.min(count / limit, 1);
  const limitReached = count >= limit;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 40 }}
    >
      {/* Profile card */}
      <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-5">
        <TouchableOpacity onPress={handlePickLogo} className="mb-3 self-start">
          {profile?.logo_uri ? (
            <View>
              <Image
                source={{ uri: profile.logo_uri }}
                className="w-16 h-16 rounded-2xl"
                resizeMode="cover"
              />
              <Text className="text-xs text-primary mt-1">Change logo</Text>
            </View>
          ) : (
            <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center">
              <Text className="text-white text-2xl font-bold">
                {profile?.name?.charAt(0).toUpperCase() ?? '?'}
              </Text>
              <Text className="text-white text-xs mt-0.5">+ Logo</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">{profile?.name}</Text>
        <Text className="text-sm text-gray-500 mt-0.5">{profile?.company_name}</Text>
        <View className="mt-2 self-start bg-blue-100 px-2 py-0.5 rounded-full">
          <Text className="text-xs font-medium text-blue-700">Easy Mode</Text>
        </View>
      </View>

      {/* Company details */}
      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-hidden">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 pt-4 pb-2">
          Company Details
        </Text>
        <InfoRow label="Address" value={profile?.company_address ?? '—'} />
        <InfoRow label="TRN" value={profile?.trn ?? '—'} />
        <InfoRow label="TIN" value={profile?.tin ?? '—'} last />
      </View>

      {/* Receipt usage */}
      <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-5">
        <Text className="text-sm font-semibold text-gray-600 mb-2">Receipt Usage</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-2">{count} / {limit}</Text>
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <View
            className={`h-full rounded-full ${limitReached ? 'bg-red-400' : 'bg-primary'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </View>
        <Text className="text-xs text-gray-400">
          {limitReached ? 'Limit reached — upgrade to continue' : `${limit - count} receipts remaining`}
        </Text>
      </View>

      {/* Upgrade button */}
      <TouchableOpacity
        className="bg-primary rounded-xl py-4 items-center mb-3"
        onPress={() => router.push('/(easy)/upgrade')}
      >
        <Text className="text-white font-bold text-base">Upgrade Account</Text>
        <Text className="text-blue-100 text-xs mt-0.5">Add email to unlock unlimited receipts</Text>
      </TouchableOpacity>

      {/* Sign out */}
      <TouchableOpacity
        className="border border-gray-200 rounded-xl py-4 items-center"
        onPress={handleSignOut}
      >
        <Text className="text-gray-500 font-medium">Sign In with Existing Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={`px-5 py-3 flex-row justify-between ${last ? '' : 'border-b border-gray-100'}`}>
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900 flex-1 text-right ml-4">{value}</Text>
    </View>
  );
}
