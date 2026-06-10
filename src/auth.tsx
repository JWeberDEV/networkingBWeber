import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, clearToken, getToken, setToken, userApi, type AuthPayload, type Role, type User } from './api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: AuthPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; role?: Role; city?: string; neighborhood?: string; bio?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On boot, restore session from a stored token.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((r) => setUser(r.user))
      .catch((err) => {
        // Only drop the session for an actually invalid token (401).
        // Transient network errors keep the token so a later load can retry.
        if ((err as { status?: number })?.status === 401) clearToken();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login({ email, password });
    setToken(token);
    setUser(user);
  };

  const register = async (payload: AuthPayload) => {
    const { token, user } = await authApi.register(payload);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; role?: Role; city?: string; neighborhood?: string; bio?: string }) => {
    const { user } = await userApi.updateMe(data);
    setUser(user);
  };

  const refreshUser = async () => {
    const { user } = await authApi.me();
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
