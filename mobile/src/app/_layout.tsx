import '../global.css';
import '../lib/i18n';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthContext } from '@/lib/auth-context';
import { AppAuthState, AuthStorage } from '@/lib/auth-store';
import { initDb } from '@/lib/db';
import { startSyncListener, syncEasyReceipts } from '@/lib/sync';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({});
  const [authState, setAuthState] = useState<AppAuthState | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    (async () => {
      await initDb();
      const state = await AuthStorage.load();
      setAuthState(state);
      await SplashScreen.hideAsync();

      // If transitioning from easy mode to full mode, sync easy receipts
      if (state?.mode === 'full') {
        syncEasyReceipts();
      }
    })();

    const unsubscribe = startSyncListener();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authState === undefined) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inEasyGroup = segments[0] === '(easy)';
    const inAppGroup = segments[0] === '(app)';

    if (!authState && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (authState?.mode === 'easy' && !inEasyGroup) {
      router.replace('/(easy)');
    } else if (authState?.mode === 'full' && (inAuthGroup || inEasyGroup)) {
      router.replace('/(app)');
    }
  }, [authState, segments]);

  if (!loaded || authState === undefined) return null;

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(easy)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </QueryClientProvider>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
