import '../global.css';
import '../lib/i18n';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthContext } from '@/lib/auth-context';
import { AuthStorage, type AuthUser } from '@/lib/auth-store';
import { initDb } from '@/lib/db';
import { startSyncListener } from '@/lib/sync';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({});
  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    (async () => {
      await initDb();
      const user = await AuthStorage.getUser();
      setAuthUser(user);
      await SplashScreen.hideAsync();
    })();

    const unsubscribe = startSyncListener();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authUser === undefined) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!authUser && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (authUser && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [authUser, segments]);

  if (!loaded || authUser === undefined) return null;

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ user: authUser, setUser: setAuthUser }}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </QueryClientProvider>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
