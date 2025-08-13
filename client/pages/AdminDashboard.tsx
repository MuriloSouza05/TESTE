import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Activity, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Tenant {
  id: string;
  companyName: string;
  cnpj?: string;
  planType: 'SIMPLE' | 'COMPOSITE' | 'MANAGERIAL';
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  _count: {
    users: number;
    clients: number;
    projects: number;
  };
}

interface Metrics {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  monthlyRevenue: number;
  revenueGrowth: number;
}

const planColors = {
  SIMPLE: 'bg-blue-100 text-blue-800',
  COMPOSITE: 'bg-green-100 text-green-800',
  MANAGERIAL: 'bg-purple-100 text-purple-800'
};

const planNames = {
  SIMPLE: 'Simples',
  COMPOSITE: 'Composto',
  MANAGERIAL: 'Gerencial'
};

export function AdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTenant, setNewTenant] = useState({
    companyName: '',
    cnpj: '',
    planType: 'SIMPLE' as const,
    expiresAt: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const adminKey = 'your_admin_secret_key'; // Em produção, isso viria de uma variável de ambiente
      
      const [tenantsResponse, metricsResponse] = await Promise.all([
        fetch('http://localhost:3000/api/admin/auth/tenants', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Admin-Key': adminKey
          }
        }),
        fetch('http://localhost:3000/api/admin/auth/metrics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Admin-Key': adminKey
          }
        })
      ]);

      if (tenantsResponse.ok) {
        const tenantsData = await tenantsResponse.json();
        setTenants(tenantsData);
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('admin_token');
      const adminKey = 'your_admin_secret_key';
      
      const response = await fetch('http://localhost:3000/api/admin/auth/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Admin-Key': adminKey
        },
        body: JSON.stringify({
          ...newTenant,
          expiresAt: newTenant.expiresAt ? new Date(newTenant.expiresAt).toISOString() : undefined
        })
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Empresa criada com sucesso'
        });
        setShowCreateDialog(false);
        setNewTenant({ companyName: '', cnpj: '', planType: 'SIMPLE', expiresAt: '' });
        loadData();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar empresa',
        variant: 'destructive'
      });
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.cnpj?.includes(searchTerm);
    const matchesPlan = filterPlan === 'all' || tenant.planType === filterPlan;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && tenant.isActive) ||
                         (filterStatus === 'inactive' && !tenant.isActive);
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin/login';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">Gestão do SaaS Jurídico</p>
            </div>
            <Button onClick={logout} variant="outline">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalTenants || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.activeTenants || 0} ativas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Usuários ativos no sistema
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(metrics?.monthlyRevenue || 0).toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {metrics?.revenueGrowth && metrics.revenueGrowth > 0 ? (
                  <><TrendingUp className="h-3 w-3 mr-1 text-green-600" /> +{metrics.revenueGrowth}%</>
                ) : (
                  <><TrendingDown className="h-3 w-3 mr-1 text-red-600" /> {metrics?.revenueGrowth}%</>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Atividade</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.totalTenants ? Math.round((metrics.activeTenants / metrics.totalTenants) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Empresas ativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Empresas Cadastradas</CardTitle>
                <CardDescription>Gerencie todas as empresas do sistema</CardDescription>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Empresa</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova empresa ao sistema
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTenant} className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input
                        id="companyName"
                        value={newTenant.companyName}
                        onChange={(e) => setNewTenant({...newTenant, companyName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={newTenant.cnpj}
                        onChange={(e) => setNewTenant({...newTenant, cnpj: e.target.value})}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="planType">Tipo de Plano</Label>
                      <Select value={newTenant.planType} onValueChange={(value: any) => setNewTenant({...newTenant, planType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SIMPLE">Simples</SelectItem>
                          <SelectItem value="COMPOSITE">Composto</SelectItem>
                          <SelectItem value="MANAGERIAL">Gerencial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expiresAt">Data de Expiração</Label>
                      <Input
                        id="expiresAt"
                        type="date"
                        value={newTenant.expiresAt}
                        onChange={(e) => setNewTenant({...newTenant, expiresAt: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Criar Empresa
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  <SelectItem value="SIMPLE">Simples</SelectItem>
                  <SelectItem value="COMPOSITE">Composto</SelectItem>
                  <SelectItem value="MANAGERIAL">Gerencial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Empresas */}
            <div className="space-y-4">
              {filteredTenants.map((tenant) => (
                <div key={tenant.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{tenant.companyName}</h3>
                        <Badge className={planColors[tenant.planType]}>
                          {planNames[tenant.planType]}
                        </Badge>
                        {tenant.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ativa
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Inativa
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {tenant.cnpj && <p>CNPJ: {tenant.cnpj}</p>}
                        <p>Usuários: {tenant._count.users} | Clientes: {tenant._count.clients} | Projetos: {tenant._count.projects}</p>
                        <p>Criada em: {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}</p>
                        {tenant.expiresAt && (
                          <p className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Expira em: {new Date(tenant.expiresAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTenants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma empresa encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;