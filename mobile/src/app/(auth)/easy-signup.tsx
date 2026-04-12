import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/lib/auth-context';
import { AuthStorage, EasyProfile } from '@/lib/auth-store';

function validateTRN(raw: string): boolean {
  const digits = raw.replace(/-/g, '').replace(/\s/g, '');
  return /^\d{15}$/.test(digits);
}

function validateTIN(raw: string): boolean {
  return /^\d{10}$/.test(raw.trim());
}

function normalizeTRN(raw: string): string {
  return raw.replace(/-/g, '').replace(/\s/g, '');
}

export default function EasySignupScreen() {
  const router = useRouter();
  const { setAuthState } = useAuth();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [trn, setTrn] = useState('');
  const [tin, setTin] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Your name is required.';
    if (!companyName.trim()) e.companyName = 'Company name is required.';
    if (!companyAddress.trim()) e.companyAddress = 'Company address is required.';
    if (!validateTRN(trn)) e.trn = 'TRN must be exactly 15 digits (dashes ignored).';
    if (!validateTIN(tin)) e.tin = 'TIN must be exactly 10 digits.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const profile: EasyProfile = {
      name: name.trim(),
      company_name: companyName.trim(),
      company_address: companyAddress.trim(),
      trn: normalizeTRN(trn),
      tin: tin.trim(),
    };

    await AuthStorage.save({ mode: 'easy', profile });
    setAuthState({ mode: 'easy', profile });
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">R</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">Get Started</Text>
          <Text className="text-gray-500 text-sm text-center mt-1">
            Create receipts instantly — no account needed
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Field
            label="Your Name *"
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            error={errors.name}
          />

          <Field
            label="Company Name *"
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="e.g. Al Noor Trading LLC"
            error={errors.companyName}
          />

          <Field
            label="Company Address *"
            value={companyAddress}
            onChangeText={setCompanyAddress}
            placeholder="Street, City, Emirate"
            multiline
            error={errors.companyAddress}
          />

          <Field
            label="TRN (Tax Registration Number) *"
            value={trn}
            onChangeText={setTrn}
            placeholder="15 digits (dashes OK)"
            keyboardType="number-pad"
            hint="15 numeric digits — dashes are ignored"
            error={errors.trn}
          />

          <Field
            label="TIN (Tax Identification Number) *"
            value={tin}
            onChangeText={setTin}
            placeholder="10 digits"
            keyboardType="number-pad"
            hint="Exactly 10 numeric digits"
            error={errors.tin}
          />
        </View>

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center mt-6"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-base">Start Creating Receipts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center mt-5"
          onPress={() => router.back()}
        >
          <Text className="text-gray-400 text-sm">Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      <TextInput
        className={`border rounded-xl px-4 py-3 text-base bg-gray-50 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'number-pad' ? 'none' : 'words'}
        multiline={multiline}
        numberOfLines={multiline ? 2 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={multiline ? { minHeight: 64 } : undefined}
      />
      {hint && !error ? (
        <Text className="text-xs text-gray-400 mt-1">{hint}</Text>
      ) : null}
      {error ? (
        <Text className="text-xs text-red-500 mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
