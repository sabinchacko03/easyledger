import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({ emoji, active }: { emoji: string; active: boolean }) {
  return <Text style={{ fontSize: 18, opacity: active ? 1 : 0.45 }}>{emoji}</Text>;
}

export default function EasyLayout() {
  const insets = useSafeAreaInsets();

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
        name="history"
        options={{
          title: 'Receipts',
          tabBarLabel: 'Receipts',
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
      {/* Hidden modal screens */}
      <Tabs.Screen name="new-receipt" options={{ href: null }} />
      <Tabs.Screen name="upgrade" options={{ href: null }} />
    </Tabs>
  );
}
