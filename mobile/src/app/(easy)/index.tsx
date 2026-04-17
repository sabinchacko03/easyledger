import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEasyProfile } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { EasyReceiptStore } from '@/lib/db';

const DEFAULT_LIMIT = 50;

export default function EasyHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useEasyProfile();

  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    if (profile?.trn) EasyReceiptStore.count(profile.trn).then(setCount);

    api.get<{ max_free_receipts: number }>('/easy/config')
      .then((r) => setLimit(r.max_free_receipts))
      .catch(() => {}); // use default on network failure
  }, [profile?.trn]);

  const remaining = Math.max(0, limit - count);
  const limitReached = count >= limit;
  const progress = Math.min(count / limit, 1);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 96 }}
    >
      {/* Company greeting */}
      <Text className="text-2xl font-bold text-gray-900">
        Hello, {profile?.name?.split(' ')[0] ?? 'there'}
      </Text>
      <Text className="text-sm text-gray-400 mt-1 mb-2">
        {profile?.company_name}
      </Text>
      <Text className="text-xs text-gray-400 mb-6">
        {new Date().toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      {/* Usage card */}
      <View className="bg-primary rounded-2xl p-5 mb-6">
        <Text className="text-blue-100 text-sm font-medium">Receipts Created</Text>
        <Text className="text-white text-3xl font-bold mt-1">{count} / {limit}</Text>
        <Text className="text-blue-100 text-xs mt-1">
          {limitReached ? 'Upgrade to continue creating receipts' : `${remaining} remaining`}
        </Text>
        {/* Progress bar */}
        <View className="mt-3 h-2 bg-blue-300 rounded-full overflow-hidden">
          <View
            className={`h-full rounded-full ${limitReached ? 'bg-red-400' : 'bg-white'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      </View>

      {/* Upgrade banner */}
      {limitReached && (
        <TouchableOpacity
          className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5 flex-row items-center justify-between"
          onPress={() => router.push('/(easy)/upgrade')}
        >
          <View className="flex-1">
            <Text className="font-bold text-orange-800">Upgrade your account</Text>
            <Text className="text-xs text-orange-600 mt-0.5">
              Add your company email to unlock unlimited receipts
            </Text>
          </View>
          <Text className="text-orange-400 text-xl">›</Text>
        </TouchableOpacity>
      )}

      {/* Quick actions */}
      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Quick Actions
      </Text>
      <TouchableOpacity
        className={`rounded-2xl p-5 items-center justify-center mb-5 ${limitReached ? 'bg-gray-300' : 'bg-primary'}`}
        style={{ minHeight: 120 }}
        onPress={() => {
          if (limitReached) {
            router.push('/(easy)/upgrade');
          } else {
            router.push('/(easy)/new-receipt');
          }
        }}
        activeOpacity={0.85}
      >
        <Text style={{ fontSize: 38 }}>🧾</Text>
        <Text className={`font-bold text-base text-center mt-2 ${limitReached ? 'text-gray-500' : 'text-white'}`}>
          {limitReached ? 'Limit Reached' : 'New Receipt'}
        </Text>
        {limitReached && (
          <Text className="text-gray-400 text-xs text-center mt-1">Tap to upgrade</Text>
        )}
      </TouchableOpacity>

      {/* Secondary shortcuts */}
      <View className="gap-3">
        <TouchableOpacity
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row justify-between items-center"
          onPress={() => router.push('/(easy)/history')}
        >
          <View>
            <Text className="font-semibold text-gray-800">Receipt History</Text>
            <Text className="text-xs text-gray-400 mt-0.5">View all receipts created</Text>
          </View>
          <Text className="text-gray-300 text-xl font-light">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row justify-between items-center"
          onPress={() => router.push('/(easy)/upgrade')}
        >
          <View>
            <Text className="font-semibold text-gray-800">Upgrade Account</Text>
            <Text className="text-xs text-gray-400 mt-0.5">Add email to unlock full features</Text>
          </View>
          <Text className="text-gray-300 text-xl font-light">›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
