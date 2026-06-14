'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
  modalState: 'closed' | 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<'closed' | 'login' | 'register'>('closed');

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      // Use microtask to avoid synchronous setState in effect body
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.data.user))
      .catch(() => {
        localStorage.removeItem('user_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error?.message || '登录失败' };
      }

      localStorage.setItem('user_token', data.data.token);
      setUser(data.data.user);
      setModalState('closed');
      return { success: true };
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error?.message || '注册失败' };
      }

      localStorage.setItem('user_token', data.data.token);
      setUser(data.data.user);
      setModalState('closed');
      return { success: true };
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user_token');
    setUser(null);
  }, []);

  const openLogin = useCallback(() => setModalState('login'), []);
  const openRegister = useCallback(() => setModalState('register'), []);
  const closeModal = useCallback(() => setModalState('closed'), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        openLogin,
        openRegister,
        closeModal,
        modalState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
