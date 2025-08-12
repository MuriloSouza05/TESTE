import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// REMOVIDO: Imports de DropdownMenu não utilizados após remoção das ações
// REMOVIDO: Imports de Dialog não utilizados após remoção das funcionalidades de edição
// REMOVIDO: Imports de Select não utilizados após remoção dos dialogs
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Shield,
  Mail,
  Phone,
  Calendar
  // REMOVIDO: Ícones de ação não utilizados (MoreHorizontal, Edit, Trash2, UserCheck, UserX)
} from 'lucide-react';
import { User, UserRole } from '@/types/settings';

// SISTEMA DE 3 TIPOS DE CONTA IMPLEMENTADO
// Conforme solicitado: Conta Simples, Conta Composta, Conta Gerencial
const mockRoles: UserRole[] = [
  {
    id: '1',
    name: 'Conta Simples',
    description: 'Acesso apenas ao CRM e áreas básicas do sistema',
    permissions: [
      // CRM - Acesso total
      { module: 'crm', action: 'admin', granted: true },
      // Dashboard - SEM informações financeiras (receitas, despesas, saldo)
      { module: 'dashboard', action: 'read_basic', granted: true },
      { module: 'dashboard', action: 'read_financial', granted: false },
      // Projetos - Acesso total
      { module: 'projetos', action: 'admin', granted: true },
      // Tarefas - Acesso total
      { module: 'tarefas', action: 'admin', granted: true },
      // Cobrança - Acesso total
      { module: 'cobranca', action: 'admin', granted: true },
      // Fluxo de Caixa - SEM acesso
      { module: 'fluxo-caixa', action: 'read', granted: false },
      // Configurações - Apenas Notificações e Perfil
      { module: 'configuracoes', action: 'read_basic', granted: true },
      { module: 'configuracoes', action: 'admin', granted: false },
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Conta Composta',
    description: 'Acesso ao CRM + Fluxo de Caixa (Dashboard completo)',
    permissions: [
      // Dashboard - Acesso completo (incluindo informações financeiras)
      { module: 'dashboard', action: 'admin', granted: true },
      // CRM - Acesso total
      { module: 'crm', action: 'admin', granted: true },
      // Projetos - Acesso total
      { module: 'projetos', action: 'admin', granted: true },
      // Tarefas - Acesso total
      { module: 'tarefas', action: 'admin', granted: true },
      // Cobrança - Acesso total
      { module: 'cobranca', action: 'admin', granted: true },
      // Fluxo de Caixa - Acesso total
      { module: 'fluxo-caixa', action: 'admin', granted: true },
      // Configurações - Apenas Notificações e Perfil
      { module: 'configuracoes', action: 'read_basic', granted: true },
      { module: 'configuracoes', action: 'admin', granted: false },
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Conta Gerencial',
    description: 'Acesso completo + Controle de colaboradores + Sistema de auditoria',
    permissions: [
      // Todos os módulos - Acesso administrativo completo
      { module: 'dashboard', action: 'admin', granted: true },
      { module: 'crm', action: 'admin', granted: true },
      { module: 'projetos', action: 'admin', granted: true },
      { module: 'tarefas', action: 'admin', granted: true },
      { module: 'cobranca', action: 'admin', granted: true },
      { module: 'fluxo-caixa', action: 'admin', granted: true },
      { module: 'configuracoes', action: 'admin', granted: true },
      // Funcionalidades especiais de gerência
      { module: 'user-management', action: 'admin', granted: true },
      { module: 'audit-system', action: 'admin', granted: true },
      { module: 'plan-management', action: 'admin', granted: true },
      // IMPLEMENTAÇÃO FUTURA: Controle de planos
      // - Consegue ver todas as contas do sistema
      // - Sistema de auditoria de cada conta
      // - Pode alterar usuários de Simples para Composta (baseado no plano)
      // - Controle de senhas e usuários
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Silva (Gerente)',
    email: 'silva@escritorio.com.br',
    phone: '(11) 99999-1234',
    roleId: '3', // Conta Gerencial
    role: mockRoles[2],
    status: 'active',
    lastLogin: '2024-01-28T14:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-28T14:30:00Z',
    permissions: mockRoles[2].permissions,
    clientPortalAccess: false,
  },
  {
    id: '2',
    name: 'Dra. Costa (Financeiro)',
    email: 'costa@escritorio.com.br',
    phone: '(11) 88888-5678',
    roleId: '2', // Conta Composta
    role: mockRoles[1],
    status: 'active',
    lastLogin: '2024-01-28T10:15:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-28T10:15:00Z',
    permissions: mockRoles[1].permissions,
    clientPortalAccess: false,
  },
  {
    id: '3',
    name: 'Ana (Atendimento)',
    email: 'ana@escritorio.com.br',
    phone: '(11) 77777-9999',
    roleId: '1', // Conta Simples
    role: mockRoles[0],
    status: 'active',
    lastLogin: '2024-01-27T16:45:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-27T16:45:00Z',
    permissions: mockRoles[0].permissions,
    clientPortalAccess: true,
  },
  {
    id: '4',
    name: 'Carlos (Estagiário)',
    email: 'carlos@escritorio.com.br',
    roleId: '1', // Conta Simples
    role: mockRoles[0],
    status: 'pending',
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
    permissions: mockRoles[0].permissions,
    clientPortalAccess: false,
  },
];

/*
 * SISTEMA DE PLANOS E PAINEL ADMINISTRATIVO FUTURO
 * ================================================
 *
 * PLANOS IMPLEMENTADOS:
 *
 * 1. PLANO BÁSICO: 1 Conta Simples, 1 Conta Composta, 1 Conta Gerencial
 * 2. PLANO PREMIUM: 2 Contas Simples, 2 Contas Compostas, 1 Conta Gerencial
 * 3. PLANO EMPRESARIAL: Ilimitadas Contas Simples, Ilimitadas Compostas, 1 Gerencial
 *
 * IMPLEMENTAÇÃO FUTURA DO PAINEL ADMINISTRATIVO:
 * - Pasta separada: /admin/ com sistema de login próprio
 * - Acesso exclusivo do proprietário do SaaS (você)
 * - Funcionalidades do painel admin:
 *   * Ver todos os clientes do SaaS
 *   * Criar novos clientes/escritórios
 *   * Editar configurações de clientes existentes
 *   * Monitorar uso por cliente
 *   * Gerenciar planos e cobrança
 *   * Logs de auditoria globais
 *
 * CONTROLE DE CONTA GERENCIAL:
 * - Pode alterar Conta Simples -> Composta (se o plano permitir)
 * - Pode visualizar todas as contas do sistema dele
 * - Sistema de auditoria por conta
 * - Controle de usuários e senhas
 * - Limitado pelas regras do plano contratado
 */

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [roles, setRoles] = useState<UserRole[]>(mockRoles);
  // REMOVIDO: Estados de edição conforme solicitado
  // const [showUserDialog, setShowUserDialog] = useState(false);
  // const [showRoleDialog, setShowRoleDialog] = useState(false);
  // const [editingUser, setEditingUser] = useState<User | undefined>();
  // const [editingRole, setEditingRole] = useState<UserRole | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  // REMOVIDO: Funções de ação do usuário conforme solicitado
  // Apenas administrador pode ativar/desativar/excluir usuários
  // const toggleUserStatus = (userId: string) => { ... };
  // const deleteUser = (userId: string) => { ... };

  return (
    <div className="space-y-6">
      {/* Users Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Gerenciamento de Usuários
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie usuários, permissões e acesso ao sistema
              </p>
            </div>
            {/* COMENTÁRIO IMPLEMENTAÇÃO:
                Botão "Novo Usuário" removido para contas gerenciais.
                As contas gerenciais NÃO podem criar novos usuários.
                Os usuários são definidos e setados pelo administrador do SaaS.
                Apenas o painel administrativo principal pode criar usuários.
            */}
            {/* <Button onClick={() => setShowUserDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Portal Cliente</TableHead>
                  {/* REMOVIDO: Coluna "Ações" conforme solicitado */}
                  {/* Apenas administrador do sistema pode gerenciar usuários */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center w-fit">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusLabel(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <div className="text-sm flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          {new Date(user.lastLogin).toLocaleString('pt-BR')}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* IMPLEMENTAÇÃO PORTAL CLIENTE:
                          Esta funcionalidade controla se o usuário pode fazer login no sistema.
                          - SIM (Habilitado): O usuário pode acessar o sistema com suas credenciais
                          - NÃO (Desabilitado): O usuário não pode fazer login

                          BACKEND IMPLEMENTAÇÃO:
                          - Verificar este flag antes de permitir login
                          - Bloquear tentativas de login se clientPortalAccess = false
                          - Logs de auditoria quando acesso é negado
                          - API: PUT /users/{id}/portal-access { enabled: boolean }
                      */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.clientPortalAccess}
                          onCheckedChange={(checked) => {
                            setUsers(users.map(u =>
                              u.id === user.id
                                ? { ...u, clientPortalAccess: checked }
                                : u
                            ));
                          }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {user.clientPortalAccess ? 'Habilitado' : 'Desabilitado'}
                        </span>
                      </div>
                    </TableCell>
                    {/* REMOVIDO: Dropdown de ações (Editar, Excluir, Desativar) */}
                    {/* Conforme solicitado, apenas administrador pode gerenciar usuários */}
                    {/* O controle de portal permanece para o gerente */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Roles Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Funções e Permissões
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure níveis de acesso baseados no sistema de 3 tipos de conta
              </p>
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Sistema Implementado:</strong> Conta Simples (CRM básico),
                  Conta Composta (CRM + Financeiro), Conta Gerencial (Acesso total + Auditoria).
                  A quantidade de cada tipo é limitada pelo plano contratado.
                </p>
              </div>
            </div>
            {/* COMENTÁRIO IMPLEMENTAÇÃO:
                Botão "Nova Função" removido para contas gerenciais.
                As funções são predefinidas: Conta Simples, Conta Composta, Conta Gerencial.
                Estas funções são fixas e não podem ser alteradas pelos usuários.
                Apenas o administrador do SaaS pode definir as permissões.
            */}
            {/* <Button onClick={() => setShowRoleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Função
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    {/* REMOVIDO: Menu de ações das funções conforme solicitado */}
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  {role.isSystem && (
                    <Badge variant="secondary" className="w-fit">Sistema</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Permissões:</h4>
                    {role.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{permission.module}</span>
                        <Badge 
                          variant={permission.granted ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {permission.action}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      {users.filter(u => u.roleId === role.id).length} usuários
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* REMOVIDO: Dialogs de criação/edição de usuários e funções */}
      {/* Conforme solicitado, apenas administrador pode gerenciar usuários */}
      {/* Funcionalidades de edição foram removidas para contas gerenciais */}
    </div>
  );
}
