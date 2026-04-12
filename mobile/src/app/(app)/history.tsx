import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/lib/api';

interface Document {
  id: number;
  doc_number: string;
  type: '380' | '381';
  amount: string;
  payment_mode: string | null;
  status: 'draft' | 'synced' | 'archived';
  created_at: string;
  customer_id: number;
  customer: { name: string };
  parent: { doc_number: string } | null;
}

interface PaginatedResponse {
  data: Document[];
  current_page: number;
  last_page: number;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery<PaginatedResponse>({
    queryKey: ['documents-list'],
    queryFn: ({ pageParam }) =>
      api.get<PaginatedResponse>(`/documents?page=${pageParam ?? 1}`),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.current_page < last.last_page ? last.current_page + 1 : undefined,
  });

  const documents = data?.pages.flatMap((p) => p.data) ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={documents}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#208AEF"
            colors={['#208AEF']}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="items-center justify-center py-24">
            <Text className="text-gray-400 text-base">No documents yet</Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color="#208AEF" style={{ paddingVertical: 16 }} />
          ) : null
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-0.5">
                  <Text className="text-xs text-gray-400">{item.doc_number}</Text>
                  {item.type === '381' && (
                    <View className="bg-purple-100 px-1.5 py-0.5 rounded">
                      <Text className="text-xs font-medium text-purple-700">Credit Note</Text>
                    </View>
                  )}
                </View>
                {item.type === '381' && item.parent?.doc_number ? (
                  <Text className="text-xs text-purple-500 mb-0.5">
                    Ref: {item.parent.doc_number}
                  </Text>
                ) : null}
                <Text className="text-base font-semibold text-gray-900">
                  {item.customer?.name ?? '—'}
                </Text>
                {item.payment_mode ? (
                  <Text className="text-xs text-gray-500 mt-0.5">{item.payment_mode}</Text>
                ) : null}
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-gray-900">
                  AED {Number(item.amount).toFixed(2)}
                </Text>
                <View
                  className={`mt-1 px-2 py-0.5 rounded-full ${
                    item.status === 'synced' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      item.status === 'synced' ? 'text-green-700' : 'text-yellow-700'
                    }`}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
            <Text className="text-xs text-gray-400 mt-2">
              {new Date(item.created_at).toLocaleDateString('en-AE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
