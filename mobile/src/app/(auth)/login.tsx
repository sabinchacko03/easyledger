import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AuthStorage, type AuthUser } from '@/lib/auth-store';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.post<{ token: string; user: AuthUser }>('/login', {
        email,
        password,
      });
      await AuthStorage.saveAuth(res.token, res.user);
      setUser(res.user); // triggers root layout redirect
    } catch (e: any) {
      setError(e.message ?? t('login.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-8">
        {/* Logo / Title */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">R</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">{t('login.title')}</Text>
          <Text className="text-gray-500 mt-1">{t('login.subtitle')}</Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">{t('login.email')}</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@company.com"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">{t('login.password')}</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>

          {error ? (
            <Text className="text-danger text-sm text-center">{error}</Text>
          ) : null}

          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center mt-2"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">{t('login.submit')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
