import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { Badge } from './ui/badge';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CheckSquare,
  FileText,
  DollarSign,
  TrendingUp,
  Settings,
  Bell,
  Lock,
  Crown,
  AlertTriangle
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  requiredModule: string;
  requiredPlan?: ('SIMPLE' | 'COMPOSITE' | 'MANAGERIAL')[];
  badge?: string;
  comingSoon?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    requiredModule: 'dashboard'
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Users,
    path: '/crm',
    requiredModule: 'clients'
  },
  {
    id: 'projects',
    label: 'Projetos',
    icon: FolderOpen,
    path: '/projects',
    requiredModule: 'projects',
    requiredPlan: ['COMPOSITE', 'MANAGERIAL']
  },
  {
    id: 'tasks',
    label: 'Tarefas',
    icon: CheckSquare,
    path: '/tasks',
    requiredModule: 'tasks',
    requiredPlan: ['COMPOSITE', 'MANAGERIAL']
  },
  {
    id: 'billing',
    label: 'Faturamento',
    icon: FileText,
    path: '/billing',
    requiredModule: 'billing',
    requiredPlan: ['MANAGERIAL']
  },
  {
    id: 'cashflow',
    label: 'Fluxo de Caixa',
    icon: DollarSign,
    path: '/cashflow',
    requiredModule: 'cash_flow',
    requiredPlan: ['MANAGERIAL']
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: TrendingUp,
    path: '/analytics',
    requiredModule: 'analytics',
    requiredPlan: ['MANAGERIAL'],
    badge: 'Pro',
    comingSoon: true
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    path: '/settings',
    requiredModule: 'dashboard'
  },
  {
    id: 'notifications',
    label: 'Notificações',
    icon: Bell,
    path: '/notifications',
    requiredModule: 'dashboard'
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user, canAccessModule, getPlanInfo, isAccountValid } = useAuth();
  
  const planInfo = getPlanInfo();
  const accountValid = isAccountValid();
  
  if (!user || !planInfo) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const canAccessItem = (item: MenuItem) => {
    // Verificar se o módulo está disponível no plano
    if (!canAccessModule(item.requiredModule)) {
      return false;
    }
    
    // Verificar se o plano específico é necessário
    if (item.requiredPlan && !item.requiredPlan.includes(user.tenant.planType)) {
      return false;
    }
    
    return true;
  };

  const getItemStatus = (item: MenuItem) => {
    if (item.comingSoon) {
      return 'coming-soon';
    }
    
    if (!canAccessItem(item)) {
      return 'restricted';
    }
    
    return 'available';
  };

  return (
    <div className={cn('flex flex-col h-full bg-white border-r border-gray-200', className)}>
      {/* Header da Sidebar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SJ</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {user.tenant.companyName}
            </h2>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  user.tenant.planType === 'SIMPLE' && 'border-blue-200 text-blue-700',
                  user.tenant.planType === 'COMPOSITE' && 'border-green-200 text-green-700',
                  user.tenant.planType === 'MANAGERIAL' && 'border-purple-200 text-purple-700'
                )}
              >
                {planInfo.name}
              </Badge>
              {!accountValid && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Expirado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const status = getItemStatus(item);
          const Icon = item.icon;
          
          if (status === 'available') {
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          }
          
          if (status === 'coming-soon') {
            return (
              <div
                key={item.id}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 rounded-lg cursor-not-allowed"
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{item.label}</span>
                <Badge variant="outline" className="text-xs ml-2">
                  Em breve
                </Badge>
              </div>
            );
          }
          
          if (status === 'restricted') {
            return (
              <div
                key={item.id}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 rounded-lg cursor-not-allowed relative group"
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{item.label}</span>
                <Lock className="w-4 h-4 ml-2" />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  Disponível no plano {item.requiredPlan?.join(' ou ')}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            );
          }
          
          return null;
        })}
      </nav>

      {/* Upgrade Section */}
      {user.tenant.planType !== 'MANAGERIAL' && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-semibold text-sm">Upgrade seu plano</span>
            </div>
            <p className="text-xs opacity-90 mb-3">
              Desbloqueie todas as funcionalidades do sistema
            </p>
            <button className="w-full bg-white text-purple-600 text-xs font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors">
              Fazer Upgrade
            </button>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              user.accountType === 'OWNER' && 'border-yellow-200 text-yellow-700',
              user.accountType === 'ADMIN' && 'border-blue-200 text-blue-700',
              user.accountType === 'USER' && 'border-gray-200 text-gray-700'
            )}
          >
            {user.accountType === 'OWNER' && 'Proprietário'}
            {user.accountType === 'ADMIN' && 'Admin'}
            {user.accountType === 'USER' && 'Usuário'}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;