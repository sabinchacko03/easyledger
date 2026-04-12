import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EasyReceipt, EasyReceiptStore } from '@/lib/db';

export default function EasyHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [receipts, setReceipts] = useState<EasyReceipt[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const all = await EasyReceiptStore.getAll();
    setReceipts(all);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <FlatList
      className="flex-1 bg-gray-50"
      data={receipts}
      keyExtractor={(item) => item.uuid}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 8,
        paddingBottom: 32,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#208AEF" />
      }
      ListHeaderComponent={
        <Text className="text-lg font-bold text-gray-900 mb-4 mt-2">Receipt History</Text>
      }
      ListEmptyComponent={
        <View className="items-center justify-center py-24">
          <Text style={{ fontSize: 40 }}>🧾</Text>
          <Text className="text-gray-400 text-base mt-3">No receipts yet</Text>
          <Text className="text-gray-300 text-sm mt-1">Tap New Receipt to get started</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">{item.customer_name}</Text>
              {item.customer_phone ? (
                <Text className="text-xs text-gray-500 mt-0.5">{item.customer_phone}</Text>
              ) : null}
              {item.payment_mode ? (
                <Text className="text-xs text-gray-400 mt-1">{item.payment_mode}</Text>
              ) : null}
              {item.description ? (
                <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={2}>{item.description}</Text>
              ) : null}
            </View>
            <View className="items-end ml-4">
              <Text className="text-lg font-bold text-gray-900">
                AED {Number(item.amount).toFixed(2)}
              </Text>
              <View className={`mt-1 px-2 py-0.5 rounded-full ${item.synced ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Text className={`text-xs font-medium ${item.synced ? 'text-green-700' : 'text-yellow-700'}`}>
                  {item.synced ? 'synced' : 'local'}
                </Text>
              </View>
            </View>
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            {new Date(item.created_at_local).toLocaleDateString('en-AE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      )}
    />
  );
}
