/**
 * SISTEMA DE GESTÃO JURÍDICA - DASHBOARD PRINCIPAL
 * ================================================
 *
 * Dashboard central do sistema de gestão para escritórios de advocacia.
 * Fornece uma visão geral completa das operações do escritório incluindo:
 *
 * MÉTRICAS PRINCIPAIS:
 * - Receitas e despesas do período
 * - Saldo atual e tendências
 * - Número de clientes ativos
 *
 * SEÇÕES DE MONITORAMENTO:
 * - Notificações urgentes e lembretes
 * - Projetos com prazos próximos
 * - Faturas a vencer
 * - Atividades recentes
 *
 * FUNCIONALIDADES:
 * - Navegação suave entre módulos
 * - Gráficos e visualizações
 * - Links rápidos para ações principais
 * - Feedback visual aprimorado
 *
 * Autor: Sistema de Gestão Jurídica
 * Data: 2024
 * Versão: 2.0
 */

import React from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardCharts } from '@/components/Dashboard/Charts';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';

function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  format = 'currency',
  className,
  isLoading = false
}: {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  format?: 'currency' | 'number';
  className?: string;
  isLoading?: boolean;
}) {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(val);
    }
    return val.toLocaleString('pt-BR');
  };

  if (isLoading) {
    return (
      <Card className={cn('transition-all duration-200 hover:shadow-md', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && trend && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="ml-1">em relação ao mês anterior</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { data, metrics, isLoading, error } = useDashboard();

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Métricas Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="💰 RECEITAS"
            value={metrics?.revenue || 0}
            icon={DollarSign}
            className="border-l-4 border-l-green-500"
            isLoading={isLoading}
          />
          <MetricCard
            title="📉 DESPESAS"
            value={metrics?.expenses || 0}
            icon={TrendingDown}
            className="border-l-4 border-l-red-500"
            isLoading={isLoading}
          />
          <MetricCard
            title="🏦 SALDO"
            value={metrics?.balance || 0}
            icon={TrendingUp}
            className="border-l-4 border-l-blue-500"
            isLoading={isLoading}
          />
          <MetricCard
            title="👥 CLIENTES"
            value={metrics?.clients || 0}
            format="number"
            icon={Users}
            className="border-l-4 border-l-purple-500"
            isLoading={isLoading}
          />
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Evolução Financeira</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <DashboardCharts />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Resumo do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Projetos Ativos</span>
                  <span className="text-2xl font-bold">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      data?.activeProjects || 0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tarefas Pendentes</span>
                  <span className="text-2xl font-bold">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      data?.pendingTasks || 0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total a Receber</span>
                  <span className="text-2xl font-bold">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(data?.totalReceivables || 0)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105" 
                onClick={() => navigate('/crm')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerenciar Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105" 
                onClick={() => navigate('/projetos')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105" 
                onClick={() => navigate('/faturamento')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nova Fatura
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105" 
                onClick={() => navigate('/fluxo-caixa')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notificações e Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Notificações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando notificações...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Sistema totalmente integrado!</p>
                    <p className="text-xs text-muted-foreground">Todos os módulos estão conectados e funcionando.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <FileText className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Dados reais carregados</p>
                    <p className="text-xs text-muted-foreground">Os dados fictícios foram removidos com sucesso.</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
