import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser, LoginInput, authService, getStoredUser } from '@/services/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setLoading(true);
    const nextUser = await authService.login(input);
    setUser(nextUser);
    setLoading(false);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await authService.logout();
    setUser(null);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, logout }),
    [login, logout, loading, user]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
