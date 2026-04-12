import { createContext, useContext } from 'react';
import { AppAuthState, AuthUser, EasyProfile } from './auth-store';

interface AuthContextValue {
  authState: AppAuthState | undefined; // undefined = still loading
  setAuthState: (state: AppAuthState) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  authState: undefined,
  setAuthState: () => {},
});

export const useAuth = () => useContext(AuthContext);

/** True when the user is in easy (offline salesperson) mode. */
export const useIsEasyMode = (): boolean => {
  const { authState } = useAuth();
  return authState?.mode === 'easy';
};

/** Returns the full API-backed user, or null. */
export const useFullUser = (): AuthUser | null => {
  const { authState } = useAuth();
  return authState?.mode === 'full' ? authState.user : null;
};

/** Returns the easy-mode profile, or null. */
export const useEasyProfile = (): EasyProfile | null => {
  const { authState } = useAuth();
  return authState?.mode === 'easy' ? authState.profile : null;
};
