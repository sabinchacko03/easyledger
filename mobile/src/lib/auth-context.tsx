import { createContext, useContext } from 'react';
import { AuthUser } from './auth-store';

interface AuthContextValue {
  user: AuthUser | null | undefined;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: undefined,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);
