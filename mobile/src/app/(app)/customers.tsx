import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/lib/api';
import { CustomerCache } from '@/lib/db';

interface Customer {
  id: number;
  name: string;
  trn?: string;
  phone?: string;
  email?: string;
  current_balance: number;
}

export default function CustomersScreen() {
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();

  const { data: customers = [], isLoading, isRefetching, refetch } = useQuery<Customer[]>({
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

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.trn ?? '').toLowerCase().includes(q);
  });

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pb-2" style={{ paddingTop: insets.top + 8 }}>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or TRN..."
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={refetch}
            tintColor="#208AEF"
            colors={['#208AEF']}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-24">
            <Text className="text-gray-400 text-base">
              {search ? 'No customers match your search' : 'No customers yet'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
            {item.trn ? (
              <Text className="text-xs text-gray-400 mt-0.5">TRN: {item.trn}</Text>
            ) : null}
            {item.phone ? (
              <Text className="text-sm text-gray-500 mt-1">{item.phone}</Text>
            ) : null}
            <View className="mt-2 flex-row justify-between items-center">
              <Text className="text-xs text-gray-400">Balance</Text>
              <Text
                className={`text-sm font-bold ${
                  Number(item.current_balance) < 0 ? 'text-red-500' : 'text-green-600'
                }`}
              >
                AED {Number(item.current_balance).toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
