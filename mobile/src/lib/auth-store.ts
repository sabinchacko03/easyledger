import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'salesperson' | 'super_admin';
  tenant_id: number | null;
  is_super_admin?: boolean;
}

export interface EasyProfile {
  name: string;
  company_name: string;
  company_address: string;
  trn: string; // 15 digits
  tin: string; // 10 digits
  logo_uri?: string;
}

export type AppAuthState =
  | { mode: 'full'; token: string; user: AuthUser }
  | { mode: 'easy'; profile: EasyProfile }
  | null;

const STATE_KEY = 'app_auth_state';
const PENDING_SYNC_TRN_KEY = 'pending_sync_trn';

export const AuthStorage = {
  save: async (state: AppAuthState): Promise<void> => {
    if (state === null) {
      await AsyncStorage.removeItem(STATE_KEY);
    } else {
      await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
    }
  },

  load: async (): Promise<AppAuthState> => {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  getToken: async (): Promise<string | null> => {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const state: AppAuthState = JSON.parse(raw);
    return state?.mode === 'full' ? state.token : null;
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.removeItem(STATE_KEY);
  },

  // Convenience helpers for full-mode login
  saveAuth: async (token: string, user: AuthUser): Promise<void> => {
    await AuthStorage.save({ mode: 'full', token, user });
  },

  clearAuth: async (): Promise<void> => {
    await AuthStorage.clear();
  },

  // Stores the easy-mode TRN before clearing auth so syncEasyReceipts knows which receipts to send
  savePendingSyncTrn: async (trn: string): Promise<void> => {
    await AsyncStorage.setItem(PENDING_SYNC_TRN_KEY, trn);
  },

  getPendingSyncTrn: async (): Promise<string | null> => {
    return AsyncStorage.getItem(PENDING_SYNC_TRN_KEY);
  },

  clearPendingSyncTrn: async (): Promise<void> => {
    await AsyncStorage.removeItem(PENDING_SYNC_TRN_KEY);
  },

  // Legacy compat used internally by api.ts
  getUser: async (): Promise<AuthUser | null> => {
    const state = await AuthStorage.load();
    return state?.mode === 'full' ? state.user : null;
  },
};
