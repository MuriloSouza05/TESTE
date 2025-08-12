import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  X, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  FileText,
  Users,
  ExternalLink
} from 'lucide-react';

/**
 * Interface para notificações do sistema
 * Define a estrutura de dados para cada notificação
 */
interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
  // IMPLEMENTAÇÃO: Dados do cadastrante e detalhes
  createdBy?: string; // Nome do colaborador que fez a ação
  createdAt?: string; // Timestamp da ação
  details?: string; // Informações adicionais
  /** Dados adicionais para redirecionamento */
  actionData?: {
    type: 'invoice' | 'project' | 'client' | 'task' | 'document';
    id: string;
    page: string;
  };
}

/**
 * Dados mock das notificações
 * Em produção, estes dados viriam de uma API
 */
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Fatura Vencendo',
    message: 'Fatura INV-001 vence em 2 dias - Maria Silva',
    time: '2 horas atrás',
    read: false,
    actionable: true,
    actionData: {
      type: 'invoice',
      id: 'INV-001',
      page: '/cobranca'
    }
  },
  {
    id: '2',
    type: 'info',
    title: 'Novo Cliente',
    message: 'João Santos foi adicionado ao CRM',
    time: '4 horas atrás',
    read: false,
    actionable: true,
    createdBy: 'Junior Santos', // Colaborador que cadastrou
    createdAt: '2024-01-28T10:00:00Z',
    details: 'Cliente cadastrado com sucesso. Email: joao@email.com, Telefone: (11) 99999-8888',
    actionData: {
      type: 'client',
      id: '2',
      page: '/crm'
    }
  },
  {
    id: '3',
    type: 'warning',
    title: 'Projeto Atrasado',
    message: 'Ação Trabalhista passou do prazo',
    time: '6 horas atrás',
    read: true,
    actionable: true,
    actionData: {
      type: 'project',
      id: '3',
      page: '/projetos'
    }
  },
  {
    id: '4',
    type: 'success',
    title: 'Pagamento Recebido',
    message: 'Fatura INV-002 foi paga - R$ 2.500,00',
    time: '1 dia atrás',
    read: true,
    actionable: true,
    actionData: {
      type: 'invoice',
      id: 'INV-002',
      page: '/cobranca'
    }
  },
  {
    id: '5',
    type: 'info',
    title: 'Tarefa Concluída',
    message: 'Ana finalizou "Revisar contrato"',
    time: '1 dia atrás',
    read: true,
    actionable: true,
    actionData: {
      type: 'task',
      id: '5',
      page: '/tarefas'
    }
  },
  {
    id: '6',
    type: 'warning',
    title: 'Prazo Processual',
    message: 'Recurso deve ser protocolado até amanhã',
    time: '3 horas atrás',
    read: false,
    actionable: true,
    actionData: {
      type: 'document',
      id: 'DOC-123',
      page: '/projetos'
    }
  },
];

/**
 * Componente NotificationsPanel
 * Painel de notificações com funcionalidades completas de navegação e gerenciamento
 */
export function NotificationsPanel() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  /**
   * Marca uma notificação como lida
   * @param id - ID da notificação
   */
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  /**
   * Marca todas as notificações como lidas
   */
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  /**
   * Remove uma notificação da lista
   * @param id - ID da notificação a ser removida
   */
  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  /**
   * Retorna ícone baseado no tipo de notificação
   * @param type - Tipo da notificação
   */
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  /**
   * Retorna ícone específico baseado no conteúdo da notificação
   * @param notification - Objeto da notificação
   */
  const getTypeIcon = (notification: Notification) => {
    if (notification.title.includes('Fatura') || notification.title.includes('Pagamento')) {
      return <DollarSign className="h-4 w-4 text-green-500" />;
    }
    if (notification.title.includes('Cliente')) {
      return <Users className="h-4 w-4 text-blue-500" />;
    }
    if (notification.title.includes('Projeto') || notification.title.includes('Prazo')) {
      return <FileText className="h-4 w-4 text-purple-500" />;
    }
    if (notification.title.includes('Tarefa')) {
      return <Calendar className="h-4 w-4 text-orange-500" />;
    }
    return getIcon(notification.type);
  };

  /**
   * Função para navegar aos detalhes da notificação
   * Redireciona para a página apropriada baseada no tipo de notificação
   * @param notification - Notificação clicada
   */
  const handleViewDetails = (notification: Notification) => {
    try {
      console.log('Navegando para detalhes da notificação:', notification);

      // Marcar como lida ao acessar detalhes
      markAsRead(notification.id);

      // Determinar rota baseada no tipo de ação
      if (notification.actionData) {
        const { type, id, page } = notification.actionData;
        
        // Navegar para a página específica
        navigate(page);
        
        // Mostrar feedback visual da navegação
        const feedbackNotification = document.createElement('div');
        feedbackNotification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          z-index: 9999;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        let feedbackMessage = '';
        let feedbackIcon = '';
        
        switch (type) {
          case 'invoice':
            feedbackMessage = `Abrindo fatura ${id}`;
            feedbackIcon = '💰';
            break;
          case 'project':
            feedbackMessage = `Abrindo projeto`;
            feedbackIcon = '📁';
            break;
          case 'client':
            feedbackMessage = `Abrindo perfil do cliente`;
            feedbackIcon = '👤';
            break;
          case 'task':
            feedbackMessage = `Abrindo tarefa`;
            feedbackIcon = '✅';
            break;
          case 'document':
            feedbackMessage = `Abrindo documento`;
            feedbackIcon = '📄';
            break;
          default:
            feedbackMessage = 'Navegando...';
            feedbackIcon = '🔗';
        }
        
        feedbackNotification.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 20px;">${feedbackIcon}</div>
            <div>
              <div style="font-weight: 600; margin-bottom: 2px;">${feedbackMessage}</div>
              <div style="opacity: 0.9; font-size: 12px;">Redirecionando...</div>
            </div>
          </div>
        `;
        
        document.body.appendChild(feedbackNotification);
        
        setTimeout(() => {
          feedbackNotification.style.transform = 'translateX(0)';
        }, 50);
        
        setTimeout(() => {
          feedbackNotification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (document.body.contains(feedbackNotification)) {
              document.body.removeChild(feedbackNotification);
            }
          }, 300);
        }, 2000);
        
      } else {
        // Fallback para notificações sem dados de ação específicos
        console.log('Notificação sem dados de redirecionamento específicos');
        
        // Tentar determinar página baseada no título
        if (notification.title.includes('Fatura') || notification.title.includes('Pagamento')) {
          navigate('/cobranca');
        } else if (notification.title.includes('Cliente')) {
          navigate('/crm');
        } else if (notification.title.includes('Projeto')) {
          navigate('/projetos');
        } else if (notification.title.includes('Tarefa')) {
          navigate('/tarefas');
        } else {
          navigate('/');
        }
      }
      
    } catch (error) {
      console.error('Erro ao navegar para detalhes da notificação:', error);
      
      // Mostrar erro ao usuário
      const errorNotification = document.createElement('div');
      errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        z-index: 9999;
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;
      errorNotification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 20px;">❌</div>
          <div>
            <div style="font-weight: 600;">Erro na navegação</div>
            <div style="opacity: 0.9; font-size: 12px;">Tente novamente</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(errorNotification);
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
      }, 4000);
    }
  };

  /**
   * Navega para página de todas as notificações
   */
  const handleViewAllNotifications = () => {
    try {
      console.log('Navegando para todas as notificações');

      // IMPLEMENTAÇÃO: Navegar para página dedicada de notificações
      // Esta página mostrará todas as notificações com detalhes completos
      navigate('/notificacoes');

      // Mostrar feedback de navegação
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        max-width: 320px;
      `;
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 20px;">🔔</div>
          <div>
            <div style="font-weight: 600; margin-bottom: 2px;">Central de Notificações</div>
            <div style="opacity: 0.9; font-size: 12px;">Redirecionando...</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 50);
      
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao navegar para todas as notificações:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer border-l-2 transition-all duration-200 ${
                    notification.read 
                      ? 'border-transparent opacity-70' 
                      : 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {getTypeIcon(notification)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-auto p-1 opacity-50 hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                        {notification.actionable && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(notification);
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver Detalhes
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                onClick={handleViewAllNotifications}
              >
                <Bell className="h-4 w-4 mr-2" />
                Ver Todas as Notificações
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
