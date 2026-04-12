import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth, useEasyProfile } from '@/lib/auth-context';
import { AuthStorage } from '@/lib/auth-store';
import { api } from '@/lib/api';

type StatusResult = { status: 'not_found' | 'pending' | 'ready' | 'expired' | 'registered'; email?: string };

export default function UpgradeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setAuthState } = useAuth();
  const profile = useEasyProfile();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startPolling() {
    pollRef.current = setInterval(checkStatus, 30000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopPolling();
  }, []);

  async function checkStatus() {
    if (!profile?.trn) return;
    try {
      const res = await api.get<StatusResult>(`/easy/status?trn=${profile.trn}`);
      if (res.status === 'ready') {
        setReady(true);
        setStatusMsg(`Your account is ready! Sign in with ${res.email ?? submittedEmail}.`);
        stopPolling();
      } else if (res.status === 'expired') {
        setStatusMsg('Your invitation has expired. Please submit again.');
        stopPolling();
      }
    } catch {
      // Silently retry
    }
  }

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!profile) return;

    setLoading(true);
    setError('');
    try {
      await api.post('/easy/invite', {
        email: trimmedEmail,
        name: profile.name,
        company_name: profile.company_name,
        company_address: profile.company_address,
        trn: profile.trn,
        tin: profile.tin,
      });
      setSubmitted(true);
      setSubmittedEmail(trimmedEmail);
      startPolling();
    } catch (e: any) {
      setError(e.message ?? 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    await AuthStorage.clear();
    setAuthState(null);
  }

  if (submitted) {
    return (
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: 40 }}
      >
        <View className="items-center mb-8">
          <Text style={{ fontSize: 56 }}>📨</Text>
          <Text className="text-2xl font-bold text-gray-900 text-center mt-4">Invitation sent!</Text>
          <Text className="text-gray-500 text-sm text-center mt-2">
            We've sent an activation link to{'\n'}
            <Text className="font-semibold text-gray-700">{submittedEmail}</Text>
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
          <Text className="font-semibold text-gray-800 mb-2">What happens next?</Text>
          <Step n="1" text="Open the activation email sent to your company inbox" />
          <Step n="2" text="Click the link and set your password" />
          <Step n="3" text="Come back here and sign in — all receipts sync automatically" />
        </View>

        {statusMsg ? (
          <View className={`rounded-xl p-4 mb-4 ${ready ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <Text className={`text-sm font-medium ${ready ? 'text-green-800' : 'text-blue-800'}`}>{statusMsg}</Text>
          </View>
        ) : null}

        {ready ? (
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center mb-3"
            onPress={handleSignIn}
          >
            <Text className="text-white font-bold text-base">Sign In Now</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-xl py-4 items-center mb-3"
            onPress={checkStatus}
          >
            <Text className="text-gray-700 font-medium">Check Status</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity className="items-center" onPress={() => router.back()}>
          <Text className="text-gray-400 text-sm">Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <Text style={{ fontSize: 48 }}>🚀</Text>
          <Text className="text-2xl font-bold text-gray-900 text-center mt-4">Upgrade your account</Text>
          <Text className="text-gray-500 text-sm text-center mt-2">
            Enter your company email to unlock unlimited receipts and activate your full account.
          </Text>
        </View>

        {/* Pre-filled company info */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Your Details (pre-filled)
          </Text>
          <Text className="text-sm text-gray-700 font-medium">{profile?.company_name}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">TRN: {profile?.trn}</Text>
          <Text className="text-xs text-gray-500">TIN: {profile?.tin}</Text>
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-1">Company Email *</Text>
        <TextInput
          className={`border rounded-xl px-4 py-3 text-base bg-gray-50 mb-2 ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
          value={email}
          onChangeText={setEmail}
          placeholder="admin@yourcompany.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {error ? <Text className="text-xs text-red-500 mb-4">{error}</Text> : <View className="mb-4" />}

        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${loading ? 'bg-blue-300' : 'bg-primary'}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Send Activation Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="items-center mt-5" onPress={() => router.back()}>
          <Text className="text-gray-400 text-sm">Maybe later</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <View className="flex-row items-start mb-3">
      <View className="w-6 h-6 rounded-full bg-primary items-center justify-center mr-3 mt-0.5">
        <Text className="text-white text-xs font-bold">{n}</Text>
      </View>
      <Text className="text-sm text-gray-600 flex-1">{text}</Text>
    </View>
  );
}
