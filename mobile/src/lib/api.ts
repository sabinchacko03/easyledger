import { router } from 'expo-router';
import { AuthStorage } from './auth-store';

const BASE_URL =
  typeof document !== 'undefined'
    ? (process.env.EXPO_PUBLIC_WEB_API_URL ?? 'http://localhost/api')
    : (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2/api'); // 10.0.2.2 = host from Android emulator

async function request<T>(
  path: string,
  options: RequestInit & { isForm?: boolean } = {}
): Promise<T> {
  const token = await AuthStorage.getToken();
  const { isForm, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    Accept: 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers });

  if (res.status === 401) {
    await AuthStorage.clear();
    router.replace('/(auth)/login');
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  postForm: <T>(path: string, body: FormData) =>
    request<T>(path, { method: 'POST', body, isForm: true }),

  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
