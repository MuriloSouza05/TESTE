import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AdminLoginCredentials {
  email: string;
  password: string;
  adminKey: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  });
  
  const navigate = useNavigate();

  // Configurar interceptor do axios para lidar com tokens expirados
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          logout();
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // Carregar dados de autenticação do localStorage na inicialização
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          
          // Verificar se o token não expirou
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenPayload.exp > currentTime) {
            setAuthState({
              user,
              token,
              isLoading: false,
              isAuthenticated: true
            });
            
            // Configurar header padrão do axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return;
          }
        }
        
        // Se chegou aqui, não há autenticação válida
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false
        });
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error);
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    };

    loadAuthData();
  }, []);

  // Função de login normal
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
      const { token, user } = response.data;
      
      // Salvar no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configurar header padrão do axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true
      });
      
      return { success: true, user, token };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Função de login administrativo
  const adminLogin = useCallback(async (credentials: AdminLoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await axios.post('http://localhost:3000/api/admin/auth/login', credentials);
      const { token, user } = response.data;
      
      // Salvar no localStorage com prefixo admin
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      
      // Configurar header padrão do axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['X-Admin-Key'] = credentials.adminKey;
      
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true
      });
      
      return { success: true, user, token };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login administrativo';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Função de logout
  const logout = useCallback(async () => {
    try {
      // Tentar fazer logout no servidor
      if (authState.token) {
        await axios.post('http://localhost:3000/api/auth/logout');
      }
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      // Limpar dados locais independentemente do resultado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      // Remover headers padrão do axios
      delete axios.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['X-Admin-Key'];
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  }, [authState.token]);

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user) return false;
    
    // Lógica de permissões baseada no tipo de conta
    switch (authState.user.accountType) {
      case 'OWNER':
        return true; // Owner tem todas as permissões
      case 'ADMIN':
        return !['DELETE_TENANT', 'MANAGE_BILLING'].includes(permission);
      case 'USER':
        return ['VIEW_DASHBOARD', 'VIEW_CLIENTS', 'CREATE_CLIENT', 'VIEW_PROJECTS'].includes(permission);
      default:
        return false;
    }
  }, [authState.user]);

  // Função para verificar se o plano permite acesso a um módulo
  const canAccessModule = useCallback((module: string): boolean => {
    if (!authState.user?.tenant) return false;
    
    const { planType } = authState.user.tenant;
    
    const planModules = {
      SIMPLE: ['dashboard', 'crm', 'clients', 'basic_reports'],
      COMPOSITE: [
        'dashboard', 'crm', 'clients', 'projects', 'tasks', 
        'basic_reports', 'project_reports', 'file_management'
      ],
      MANAGERIAL: [
        'dashboard', 'crm', 'clients', 'projects', 'tasks', 'billing',
        'invoices', 'cash_flow', 'transactions', 'advanced_reports',
        'analytics', 'file_management', 'audit_logs', 'user_management'
      ]
    };
    
    return planModules[planType]?.includes(module) || false;
  }, [authState.user]);

  // Função para verificar se a conta está ativa e não expirou
  const isAccountValid = useCallback((): boolean => {
    if (!authState.user?.tenant) return false;
    
    const { isActive, expiresAt } = authState.user.tenant;
    
    if (!isActive) return false;
    
    if (expiresAt && new Date() > new Date(expiresAt)) {
      return false;
    }
    
    return true;
  }, [authState.user]);

  // Função para obter informações do plano atual
  const getPlanInfo = useCallback(() => {
    if (!authState.user?.tenant) return null;
    
    const { planType } = authState.user.tenant;
    
    const planInfo = {
      SIMPLE: {
        name: 'Simples',
        maxUsers: 3,
        maxClients: 50,
        features: ['CRM Básico', 'Relatórios Simples']
      },
      COMPOSITE: {
        name: 'Composto',
        maxUsers: 10,
        maxClients: 200,
        features: ['CRM Avançado', 'Gestão de Projetos', 'Relatórios Avançados']
      },
      MANAGERIAL: {
        name: 'Gerencial',
        maxUsers: -1, // Ilimitado
        maxClients: -1, // Ilimitado
        features: ['Todas as funcionalidades', 'Faturamento', 'Fluxo de Caixa', 'Analytics']
      }
    };
    
    return planInfo[planType];
  }, [authState.user]);

  return {
    // Estado
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    
    // Ações
    login,
    adminLogin,
    logout,
    
    // Verificações
    hasPermission,
    canAccessModule,
    isAccountValid,
    getPlanInfo
  };
};

export default useAuth;