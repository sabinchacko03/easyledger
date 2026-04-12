import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';
import { AuthStorage } from '@/lib/auth-store';

function TabIcon({ emoji, active }: { emoji: string; active: boolean }) {
  return <Text style={{ fontSize: 18, opacity: active ? 1 : 0.45 }}>{emoji}</Text>;
}

export default function AppLayout() {
  const { setUser } = useAuth();
  const insets = useSafeAreaInsets();

  async function handleLogout() {
    await AuthStorage.clearAuth();
    setUser(null); // root layout effect handles redirect — no double navigation
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#208AEF',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarLabel: 'Customers',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👥" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" active={focused} />,
        }}
      />
      {/* Modal screens — hidden from tab bar */}
      <Tabs.Screen name="new-receipt" options={{ href: null }} />
      <Tabs.Screen name="credit-note" options={{ href: null }} />
    </Tabs>
  );
}
