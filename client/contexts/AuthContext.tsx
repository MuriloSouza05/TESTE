import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';

interface User {
  id: string;
  email: string;
  name?: string;
  accountType: 'OWNER' | 'ADMIN' | 'USER';
  tenantId: string;
  tenant: {
    id: string;
    companyName: string;
    planType: 'SIMPLE' | 'COMPOSITE' | 'MANAGERIAL';
    isActive: boolean;
    expiresAt?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, tenantId?: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string, adminKey: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  canAccessModule: (module: string) => boolean;
  isAccountValid: () => boolean;
  getPlanInfo: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authHook = useAuthHook();

  // Wrapper para manter compatibilidade com a interface antiga
  const login = async (email: string, password: string, tenantId?: string) => {
    return await authHook.login({ email, password });
  };

  const value: AuthContextType = {
    user: authHook.user,
    token: authHook.token,
    login,
    adminLogin: authHook.adminLogin,
    logout: authHook.logout,
    isLoading: authHook.isLoading,
    isAuthenticated: authHook.isAuthenticated,
    hasPermission: authHook.hasPermission,
    canAccessModule: authHook.canAccessModule,
    isAccountValid: authHook.isAccountValid,
    getPlanInfo: authHook.getPlanInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook para fazer requisições autenticadas
export function useAuthenticatedFetch() {
  const { token } = useAuth();
  
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    return fetch(url, {
      ...options,
      headers,
    });
  };
  
  return authenticatedFetch;
}