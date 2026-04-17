import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/lib/api';
import { useFullUser } from '@/lib/auth-context';
import { consumeSyncBanner } from '@/lib/sync';

export default function HomeScreen() {
  const user = useFullUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  useEffect(() => {
    consumeSyncBanner().then((n) => { if (n) setSyncedCount(n); });
  }, []);

  const { data, isLoading } = useQuery<{ data: Array<{ id: number; amount: string; type: string; created_at: string }> }>({
    queryKey: ['documents-summary'],
    queryFn: () => api.get('/documents?page=1'),
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayReceipts = (data?.data ?? []).filter(
    (d) => d.type === '380' && d.created_at.slice(0, 10) === today
  );
  const todayTotal = todayReceipts.reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 96 }}
    >
      {/* Easy-mode sync banner — shown once after first login */}
      {syncedCount !== null && (
        <TouchableOpacity
          className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 flex-row items-center justify-between"
          onPress={() => setSyncedCount(null)}
          activeOpacity={0.8}
        >
          <View className="flex-1">
            <Text className="font-semibold text-green-800">Receipts synced</Text>
            <Text className="text-xs text-green-600 mt-0.5">
              {syncedCount} receipt{syncedCount !== 1 ? 's' : ''} from easy mode have been added to your account.
            </Text>
          </View>
          <Text className="text-green-400 text-lg ml-3">✓</Text>
        </TouchableOpacity>
      )}

      {/* Greeting */}
      <Text className="text-2xl font-bold text-gray-900">
        Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋
      </Text>
      <Text className="text-sm text-gray-400 mt-1 mb-6">
        {new Date().toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      {/* Today's summary card */}
      <View className="bg-primary rounded-2xl p-5 mb-6">
        <Text className="text-blue-100 text-sm font-medium">Today's Collection</Text>
        {isLoading ? (
          <ActivityIndicator color="white" style={{ marginTop: 8 }} />
        ) : (
          <Text className="text-white text-3xl font-bold mt-1">
            AED {todayTotal.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </Text>
        )}
        <Text className="text-blue-100 text-xs mt-1">
          {todayReceipts.length} receipt{todayReceipts.length !== 1 ? 's' : ''} today
        </Text>
      </View>

      {/* Quick actions */}
      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Quick Actions
      </Text>
      <TouchableOpacity
        className="bg-primary rounded-2xl p-5 items-center justify-center mb-5"
        style={{ minHeight: 120 }}
        onPress={() => router.push('/(app)/new-receipt')}
        activeOpacity={0.85}
      >
        <Text style={{ fontSize: 38 }}>🧾</Text>
        <Text className="text-white font-bold text-base text-center mt-2">New Receipt</Text>
      </TouchableOpacity>

      {/* Secondary shortcuts */}
      <View className="gap-3">
        <TouchableOpacity
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row justify-between items-center"
          onPress={() => router.push('/(app)/history')}
        >
          <View>
            <Text className="font-semibold text-gray-800">History</Text>
            <Text className="text-xs text-gray-400 mt-0.5">All receipts</Text>
          </View>
          <Text className="text-gray-300 text-xl font-light">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row justify-between items-center"
          onPress={() => router.push('/(app)/customers')}
        >
          <View>
            <Text className="font-semibold text-gray-800">Customers</Text>
            <Text className="text-xs text-gray-400 mt-0.5">Browse & search customers</Text>
          </View>
          <Text className="text-gray-300 text-xl font-light">›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
