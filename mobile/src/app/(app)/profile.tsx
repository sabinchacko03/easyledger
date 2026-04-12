import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth, useFullUser } from '@/lib/auth-context';
import { AuthStorage } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { DraftStore } from '@/lib/db';
import { syncPendingDrafts } from '@/lib/sync';

interface DailyStat {
  date: string;
  receipt_count: number;
  credit_note_count: number;
  total_amount: string;
}

export default function ProfileScreen() {
  const { setAuthState } = useAuth();
  const user = useFullUser();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const { data: stats = [], isLoading } = useQuery<DailyStat[]>({
    queryKey: ['daily-stats'],
    queryFn: () => api.get<DailyStat[]>('/documents/daily-stats'),
    retry: 0,
    throwOnError: false,
  });

  const todayStat = stats?.find((s) => s.date === today);

  useEffect(() => {
    DraftStore.getPending().then((drafts) => setPendingCount(drafts.length));
  }, []);

  async function handleSync() {
    setSyncing(true);
    try {
      await syncPendingDrafts();
      const drafts = await DraftStore.getPending();
      setPendingCount(drafts.length);
      await queryClient.invalidateQueries({ queryKey: ['documents-list'] });
      await queryClient.invalidateQueries({ queryKey: ['documents-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['daily-stats'] });
      if (drafts.length === 0) {
        Alert.alert('Synced', 'All drafts have been synced.');
      } else {
        Alert.alert('Partial Sync', `${drafts.length} draft(s) could not be synced. Check your connection.`);
      }
    } catch {
      Alert.alert('Error', 'Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await AuthStorage.clearAuth();
          setAuthState(null);
        },
      },
    ]);
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Header */}
      <View className="bg-primary px-6 pb-8 items-center" style={{ paddingTop: insets.top + 16 }}>
        <View className="w-20 h-20 rounded-full bg-blue-300 items-center justify-center mb-3">
          <Text className="text-white text-3xl font-bold">{initials}</Text>
        </View>
        <Text className="text-white text-xl font-bold">{user?.name ?? '—'}</Text>
        <Text className="text-blue-100 text-sm mt-0.5">{user?.email ?? ''}</Text>
        <View className="mt-2 bg-blue-700 px-3 py-1 rounded-full">
          <Text className="text-blue-100 text-xs font-medium capitalize">{user?.role ?? ''}</Text>
        </View>
      </View>

      {/* Today's stats */}
      <View className="mx-4 -mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Today's Summary
        </Text>
        {isLoading ? (
          <ActivityIndicator color="#208AEF" />
        ) : (
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {todayStat?.receipt_count ?? 0}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">Receipts</Text>
            </View>
            <View className="w-px bg-gray-100" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {todayStat?.credit_note_count ?? 0}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">Credit Notes</Text>
            </View>
            <View className="w-px bg-gray-100" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-primary">
                {Number(todayStat?.total_amount ?? 0).toFixed(0)}
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">AED Total</Text>
            </View>
          </View>
        )}
      </View>

      {/* Sync status */}
      <View className="mx-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Offline Drafts
        </Text>
        <View className="flex-row items-center justify-between">
          <View>
            {pendingCount === null ? (
              <ActivityIndicator color="#208AEF" size="small" />
            ) : (
              <>
                <Text className="text-2xl font-bold text-gray-900">{pendingCount}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {pendingCount === 0 ? 'All synced' : 'Pending sync'}
                </Text>
              </>
            )}
          </View>
          <TouchableOpacity
            className={`flex-row items-center gap-2 px-4 py-2.5 rounded-xl border ${
              pendingCount === 0
                ? 'bg-gray-50 border-gray-200'
                : 'bg-primary border-primary'
            }`}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color={pendingCount === 0 ? '#9ca3af' : 'white'} size="small" />
            ) : (
              <Text
                className={`text-sm font-semibold ${
                  pendingCount === 0 ? 'text-gray-400' : 'text-white'
                }`}
              >
                Sync Now
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent daily history */}
      {stats.length > 1 && (
        <View className="mx-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent Days
          </Text>
          {stats.slice(0, 7).map((s) => (
            <View
              key={s.date}
              className="flex-row justify-between items-center py-2 border-b border-gray-50"
            >
              <Text className="text-sm text-gray-600">
                {new Date(s.date).toLocaleDateString('en-AE', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
              <View className="flex-row gap-4 items-center">
                <Text className="text-xs text-gray-400">{s.receipt_count} receipts</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  AED {Number(s.total_amount).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Logout */}
      <View className="mx-4">
        <TouchableOpacity
          className="bg-red-50 border border-red-200 rounded-2xl py-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-red-600 font-semibold text-base">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
