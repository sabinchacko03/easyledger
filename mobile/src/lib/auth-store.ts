import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'salesperson';
  tenant_id: number | null;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthStorage = {
  saveAuth: async (token: string, user: AuthUser) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)],
    ]);
  },

  getToken: () => AsyncStorage.getItem(TOKEN_KEY),

  getUser: async (): Promise<AuthUser | null> => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clearAuth: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
