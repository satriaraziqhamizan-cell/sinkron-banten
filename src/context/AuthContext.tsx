import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types/sinkron';
import { api, setStoredToken, getStoredToken } from '../services/api';
import { useToast } from '../components/Toast';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  status: 'menunggu' | 'aktif' | 'ditangguhkan';
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isDemoData: boolean;
  isDemoMode: boolean;
  activePeriod: string;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: any) => Promise<string>;
  logout: () => Promise<void>;
  demoLogin: (role: string) => Promise<AuthUser | null>;
  isDemoModeAllowed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(
    import.meta.env.VITE_DEMO_MODE === 'true'
  );
  const [activePeriod, setActivePeriod] = useState<string>('2026/Ganjil');
  const { showToast } = useToast();

  const isDemoModeAllowed = isDemoMode || import.meta.env.VITE_DEMO_MODE === 'true';

  useEffect(() => {
    async function initAuth() {
      try {
        const bootstrap = await api.getBootstrap();
        setIsDemoData(bootstrap.isDemoData);
        setActivePeriod(bootstrap.activePeriod);
        if (bootstrap.isDemoMode !== undefined) {
          setIsDemoMode(bootstrap.isDemoMode);
        }
        if (bootstrap.currentUser) {
          setCurrentUser(bootstrap.currentUser);
        }
      } catch (err) {
        console.error('Bootstrap failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    setStoredToken(res.token);
    setCurrentUser(res.user);
    showToast('Masuk Berhasil', `Selamat datang kembali, ${res.user.name}`, 'success');
  };

  const demoLogin = async (role: string): Promise<AuthUser | null> => {
    const res = await api.demoLogin(role);
    setStoredToken(res.token);
    setCurrentUser(res.user);
    showToast('Mode Demo Aktif', res.message, 'success');
    return res.user;
  };

  const register = async (payload: any): Promise<string> => {
    const res = await api.register(payload);
    showToast('Pendaftaran Berhasil', res.message, 'success');
    return res.message;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    setStoredToken(null);
    setCurrentUser(null);
    showToast('Berhasil Keluar', 'Sesi Anda telah diakhiri dengan aman.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isDemoData,
        isDemoMode,
        activePeriod,
        login,
        register,
        logout,
        demoLogin,
        isDemoModeAllowed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
