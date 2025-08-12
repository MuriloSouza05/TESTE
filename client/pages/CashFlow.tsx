/**
 * SISTEMA DE GESTÃO JURÍDICA - MÓDULO FLUXO DE CAIXA
 * =====================================================
 *
 * Este arquivo implementa o módulo completo de Fluxo de Caixa para escritórios de advocacia.
 * Inclui funcionalidades de:
 * - Gestão de transações (receitas e despesas)
 * - Categorização específica para atividades jurídicas
 * - Transações recorrentes
 * - Relatórios financeiros
 * - Exportação de dados
 *
 * Autor: Sistema de Gestão Jurídica
 * Data: 2024
 * Versão: 2.0
 */

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Plus,
  Search,
  Filter,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calculator,
  Download,
  Calendar,
  Copy,
  Clock,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { TransactionForm } from '@/components/CashFlow/TransactionForm';
import { TransactionsTable } from '@/components/CashFlow/TransactionsTable';
import { TransactionViewDialog } from '@/components/CashFlow/TransactionViewDialog';
import { Transaction, CashFlowStats, TransactionStatus } from '@/types/cashflow';

/**
 * DADOS MOCK PARA DEMONSTRAÇÃO
 * ============================
 *
 * Em produção, estes dados seriam carregados de uma API REST.
 * Estrutura de transações incluindo:
 * - Informações básicas (tipo, valor, data)
 * - Categorização específica para advocacia
 * - Relacionamentos com projetos e clientes
 * - Metadados de auditoria
 * - Configurações de recorrência
 */
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 8500,
    category: 'Honorários advocatícios',
    categoryId: 'honorarios',
    description: 'Honorários - Ação Previdenciária João Santos',
    date: '2024-01-20T00:00:00Z',
    paymentMethod: 'pix',
    status: 'confirmed',
    tags: ['Previdenciário', 'Honorários'],
    attachments: [],
    projectId: '1',
    projectTitle: 'Ação Previdenciária - João Santos',
    clientId: '1',
    clientName: 'João Santos',
    isRecurring: false,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    createdBy: 'Dr. Silva',
    lastModifiedBy: 'Dr. Silva',
    notes: 'Pagamento confirmado via PIX',
  },
  {
    id: '2',
    type: 'expense',
    amount: 3200,
    category: 'Salários e encargos trabalhistas',
    categoryId: 'salarios',
    description: 'Salário secretária - Janeiro 2024',
    date: '2024-01-25T00:00:00Z',
    paymentMethod: 'bank_transfer',
    status: 'confirmed',
    tags: ['Folha de Pagamento'],
    attachments: [],
    isRecurring: true,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
    createdBy: 'Dr. Silva',
    lastModifiedBy: 'Dr. Silva',
  },
  {
    id: '3',
    type: 'expense',
    amount: 2500,
    category: 'Aluguel / condomínio',
    categoryId: 'aluguel',
    description: 'Aluguel escritório - Janeiro 2024',
    date: '2024-01-05T00:00:00Z',
    paymentMethod: 'boleto',
    status: 'confirmed',
    tags: ['Fixo Mensal'],
    attachments: [],
    isRecurring: true,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-05T08:00:00Z',
    createdBy: 'Dr. Silva',
    lastModifiedBy: 'Dr. Silva',
  },
  {
    id: '4',
    type: 'income',
    amount: 1500,
    category: 'Consultorias jurídicas',
    categoryId: 'consultorias',
    description: 'Consultoria empresarial - Tech LTDA',
    date: '2024-01-28T00:00:00Z',
    paymentMethod: 'credit_card',
    status: 'pending',
    tags: ['Consultoria', 'Empresarial'],
    attachments: [],
    projectId: '3',
    projectTitle: 'Recuperação Judicial - Tech LTDA',
    clientId: '3',
    clientName: 'Tech LTDA',
    isRecurring: false,
    createdAt: '2024-01-28T14:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z',
    createdBy: 'Dr. Silva',
    lastModifiedBy: 'Dr. Silva',
    notes: 'Aguardando confirmação do pagamento',
  },
  {
    id: '5',
    type: 'expense',
    amount: 450,
    category: 'Material de escritório',
    categoryId: 'material',
    description: 'Papel, canetas e material de expediente',
    date: '2024-01-15T00:00:00Z',
    paymentMethod: 'credit_card',
    status: 'confirmed',
    tags: ['Material'],
    attachments: [],
    isRecurring: false,
    createdAt: '2024-01-15T11:30:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    createdBy: 'Ana Paralegal',
    lastModifiedBy: 'Ana Paralegal',
  },
];

/**
 * COMPONENTE PRINCIPAL: CashFlow
 * =============================
 *
 * Componente responsável por toda a gestão financeira do escritório.
 * Implementa um sistema completo de fluxo de caixa com:
 *
 * FUNCIONALIDADES PRINCIPAIS:
 * - Criação e edição de transações
 * - Categorização específica para advocacia
 * - Filtros avançados e busca
 * - Relatórios e estatísticas
 * - Transações recorrentes
 * - Exportação de dados (CSV)
 *
 * ESTRUTURA DE ABAS:
 * - Transações: Lista principal com filtros
 * - Categorias: Visualização por categoria
 * - Relatórios: Análises e métricas
 * - Recorrentes: Gestão de automatizações
 */
export function CashFlow() {
  // Estados principais do componente
  const [activeTab, setActiveTab] = useState('transactions'); // Aba ativa do sistema
  const [error, setError] = useState<string | null>(null); // Controle de erros globais

  // Tratamento de erro
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Erro no Fluxo de Caixa</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => setError(null)}>Tentar Novamente</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransactionView, setShowTransactionView] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [forceRecurring, setForceRecurring] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('current_month');

  // Filter transactions based on all criteria
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.categoryId === categoryFilter);
    }

    // Filter by date range
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentYear = new Date(today.getFullYear(), 0, 1);

    if (dateRange === 'current_month') {
      filtered = filtered.filter(transaction =>
        new Date(transaction.date) >= currentMonth
      );
    } else if (dateRange === 'current_year') {
      filtered = filtered.filter(transaction =>
        new Date(transaction.date) >= currentYear
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, typeFilter, statusFilter, categoryFilter, dateRange]);

  // Calculate statistics
  const stats: CashFlowStats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income' && t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.status === 'confirmed')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const transactionCount = filteredTransactions.length;

    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income' && t.status === 'confirmed');
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense' && t.status === 'confirmed');

    const averageIncome = incomeTransactions.length > 0 ? income / incomeTransactions.length : 0;
    const averageExpense = expenseTransactions.length > 0 ? expenses / expenseTransactions.length : 0;

    const biggestIncome = incomeTransactions.reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null as Transaction | null);
    const biggestExpense = expenseTransactions.reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null as Transaction | null);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance,
      transactionCount,
      averageIncome,
      averageExpense,
      biggestIncome,
      biggestExpense,
      monthlyGrowth: 15, // Mock value
      categoryBreakdown: [], // Would calculate category breakdown
    };
  }, [filteredTransactions]);

  const handleSubmitTransaction = (data: any) => {
    try {
      if (editingTransaction) {
        setTransactions(transactions.map(transaction =>
          transaction.id === editingTransaction.id
            ? {
                ...transaction,
                ...data,
                date: data.date + 'T00:00:00Z',
                category: getCategoryName(data.categoryId),
                updatedAt: new Date().toISOString(),
                attachments: transaction.attachments,
              }
            : transaction
        ));
        setEditingTransaction(undefined);
      } else {
        const newTransaction: Transaction = {
          ...data,
          id: Date.now().toString(),
          date: data.date + 'T00:00:00Z',
          category: getCategoryName(data.categoryId),
          attachments: [],
          isRecurring: data.isRecurring || false,
          recurringFrequency: data.recurringFrequency,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Dr. Silva',
          lastModifiedBy: 'Dr. Silva',
        };
        setTransactions([...transactions, newTransaction]);
      }
      setShowTransactionForm(false);
      setForceRecurring(false);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      setError('Erro ao salvar transação. Tente novamente.');
    }
  };

  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev =>
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedTransactions(checked ? filteredTransactions.map(t => t.id) : []);
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransaction(transaction);
    setShowTransactionView(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleEditFromView = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionView(false);
    setShowTransactionForm(true);
  };

  const handleDuplicateFromView = (transaction: Transaction) => {
    handleDuplicateTransaction(transaction);
    setShowTransactionView(false);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(transactions.filter(t => t.id !== transactionId));
    setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId));
  };

  const handleDuplicateTransaction = (transaction: Transaction) => {
    const duplicated: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      description: `${transaction.description} (Cópia)`,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions([...transactions, duplicated]);
  };

  const getCategoryName = (categoryId: string) => {
    const nameMap: { [key: string]: string } = {
      'honorarios': 'Honorários advocatícios',
      'consultorias': 'Consultorias jurídicas',
      'acordos': 'Acordos e mediações',
      'custas_reemb': 'Custas judiciais reembolsadas',
      'outros_servicos': 'Outros serviços jurídicos',
      'salarios': 'Salários e encargos trabalhistas',
      'aluguel': 'Aluguel / condomínio',
      'contas': 'Contas (água, luz, internet)',
      'material': 'Material de escritório',
      'marketing': 'Marketing e publicidade',
      'custas_judiciais': 'Custas judiciais',
      'treinamentos': 'Treinamentos e cursos',
      'transporte': 'Transporte e viagens',
      'manutencao': 'Manutenção e equipamentos',
      'impostos': 'Impostos e taxas',
      'oab': 'Associações profissionais (OAB)',
      'seguro': 'Seguro profissional',
    };
    return nameMap[categoryId] || categoryId;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportToCSV = () => {
    try {
      const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Status', 'Método Pagamento', 'Cliente', 'Projeto'];
      const csvData = filteredTransactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString('pt-BR'),
        transaction.type === 'income' ? 'Receita' : 'Despesa',
        transaction.description,
        transaction.category,
        transaction.amount.toFixed(2).replace('.', ','),
        transaction.status === 'confirmed' ? 'Confirmado' : transaction.status === 'pending' ? 'Pendente' : 'Cancelado',
        transaction.paymentMethod || '-',
        transaction.clientName || '-',
        transaction.projectTitle || '-'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(';'))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `fluxo-caixa-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('✅ Arquivo CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('❌ Erro ao exportar CSV. Tente novamente.');
    }
  };

  const exportMonthlyReport = () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      });

      const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const monthlyBalance = monthlyIncome - monthlyExpense;

      const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'];
      const csvData = monthlyTransactions.map(transaction => [
        new Date(transaction.date).toLocaleDateString('pt-BR'),
        transaction.type === 'income' ? 'Receita' : 'Despesa',
        transaction.description,
        transaction.category,
        `R$ ${transaction.amount.toFixed(2).replace('.', ',')}`
      ]);

      csvData.push([]);
      csvData.push(['RESUMO MENSAL']);
      csvData.push(['Total Receitas', '', '', '', `R$ ${monthlyIncome.toFixed(2).replace('.', ',')}`]);
      csvData.push(['Total Despesas', '', '', '', `R$ ${monthlyExpense.toFixed(2).replace('.', ',')}`]);
      csvData.push(['Saldo do Mês', '', '', '', `R$ ${monthlyBalance.toFixed(2).replace('.', ',')}`]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field || ''}"`).join(';'))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-mensal-${currentMonth + 1}-${currentYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('✅ Relatório mensal exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório mensal:', error);
      alert('❌ Erro ao exportar relatório mensal. Tente novamente.');
    }
  };

  const exportCategoriesReport = () => {
    try {
      const categoryTotals = {};

      transactions.forEach(transaction => {
        const categoryName = transaction.category;
        const key = `${transaction.type}-${categoryName}`;
        if (!categoryTotals[key]) {
          categoryTotals[key] = { type: transaction.type, category: categoryName, total: 0, count: 0 };
        }
        categoryTotals[key].total += transaction.amount;
        categoryTotals[key].count += 1;
      });

      const headers = ['Tipo', 'Categoria', 'Quantidade de Transações', 'Valor Total', 'Valor Médio'];
      const csvData = Object.values(categoryTotals).map((category: any) => [
        category.type === 'income' ? 'Receita' : 'Despesa',
        category.category,
        category.count,
        `R$ ${category.total.toFixed(2).replace('.', ',')}`,
        `R$ ${(category.total / category.count).toFixed(2).replace('.', ',')}`
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(';'))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analise-categorias-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('✅ Relatório por categorias exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório por categorias:', error);
      alert('❌ Erro ao exportar relatório por categorias. Tente novamente.');
    }
  };

  const exportCashFlowReport = () => {
    try {
      const monthlyData = {};

      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expense: 0 };
        }

        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expense += transaction.amount;
        }
      });

      const headers = ['Mês/Ano', 'Total Receitas', 'Total Despesas', 'Saldo do Mês', 'Saldo Acumulado'];
      let accumulatedBalance = 0;

      const csvData = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]: [string, any]) => {
          const monthBalance = data.income - data.expense;
          accumulatedBalance += monthBalance;

          return [
            month,
            `R$ ${data.income.toFixed(2).replace('.', ',')}`,
            `R$ ${data.expense.toFixed(2).replace('.', ',')}`,
            `R$ ${monthBalance.toFixed(2).replace('.', ',')}`,
            `R$ ${accumulatedBalance.toFixed(2).replace('.', ',')}`
          ];
        });

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(';'))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `fluxo-caixa-mensal-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('✅ Relatório de fluxo de caixa exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório de fluxo de caixa:', error);
      alert('❌ Erro ao exportar relatório de fluxo de caixa. Tente novamente.');
    }
  };

  const deleteAllTransactions = () => {
    const confirmMessage = "Tem certeza que deseja apagar todas as transações? Essa ação não pode ser desfeita!";

    if (window.confirm(confirmMessage)) {
      setTransactions([]);
      alert('✅ Todas as transações foram apagadas com sucesso!');
    }
  };

  const copyLastTransaction = () => {
    if (transactions.length > 0) {
      const lastTransaction = transactions[transactions.length - 1];
      const copiedTransaction = {
        ...lastTransaction,
        id: '', // Clear ID so it creates a new transaction
        description: `${lastTransaction.description} (Cópia)`,
        date: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
      };
      setEditingTransaction(copiedTransaction);
      setShowTransactionForm(true);
    } else {
      alert('Nenhuma transação disponível para copiar');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Fluxo de Caixa</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-muted-foreground">
              Controle financeiro com categorias específicas para advocacia
            </p>
          </div>
          <div className="flex space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingTransaction(undefined);
                    setShowTransactionForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={copyLastTransaction}
                  disabled={transactions.length === 0}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Última Transação
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={deleteAllTransactions}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              disabled={transactions.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Apagar Todas
            </Button>
          </div>
        </div>

        {/* Quick Actions Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-blue-300 bg-blue-50/50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Plus className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900 mb-1">Nova Transação</h3>
              <p className="text-sm text-blue-700 mb-3">Adicionar receita ou despesa</p>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setEditingTransaction(undefined);
                  setShowTransactionForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-green-300 bg-green-50/50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Copy className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-green-900 mb-1">Copiar Última</h3>
              <p className="text-sm text-green-700 mb-3">Duplicar última transação</p>
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                onClick={copyLastTransaction}
                disabled={transactions.length === 0}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-purple-300 bg-purple-50/50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Clock className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-900 mb-1">Criar Recorrente</h3>
              <p className="text-sm text-purple-700 mb-3">Transação automática</p>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                onClick={() => {
                  setEditingTransaction(undefined);
                  setForceRecurring(true);
                  setShowTransactionForm(true);
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Criar
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-orange-300 bg-orange-50/50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Download className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-semibold text-orange-900 mb-1">Exportar CSV</h3>
              <p className="text-sm text-orange-700 mb-3">Baixar relatório</p>
              <Button
                size="sm"
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">💰 Receitas</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter(t => t.type === 'income' && t.status === 'confirmed').length} receitas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">📉 Despesas</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter(t => t.type === 'expense' && t.status === 'confirmed').length} despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">🏦 Saldo</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                stats.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(stats.balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">📊 Total Transações</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.transactionCount}</div>
              <p className="text-xs text-muted-foreground">
                No período selecionado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Period and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Procurar transações..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="current_month">Mês atual</SelectItem>
              <SelectItem value="current_year">Ano atual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Recent Transactions Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">💰 Últimas Receitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredTransactions
                .filter(t => t.type === 'income')
                .slice(0, 3)
                .map((transaction) => (
                  <div key={transaction.id} className="flex justify-between text-sm">
                    <span className="truncate">{transaction.description}</span>
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              {filteredTransactions.filter(t => t.type === 'income').length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma receita no período</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">📉 Últimas Despesas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredTransactions
                .filter(t => t.type === 'expense')
                .slice(0, 3)
                .map((transaction) => (
                  <div key={transaction.id} className="flex justify-between text-sm">
                    <span className="truncate">{transaction.description}</span>
                    <span className="text-red-600 font-medium">
                      -{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              {filteredTransactions.filter(t => t.type === 'expense').length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma despesa no período</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">📊 Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Maior receita:</span>
                <span className="text-green-600 font-medium">
                  {stats.biggestIncome ? formatCurrency(stats.biggestIncome.amount) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Maior despesa:</span>
                <span className="text-red-600 font-medium">
                  {stats.biggestExpense ? formatCurrency(stats.biggestExpense.amount) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Média receita:</span>
                <span className="font-medium">{formatCurrency(stats.averageIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span>Média despesa:</span>
                <span className="font-medium">{formatCurrency(stats.averageExpense)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="recurring">Recorrentes</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Transações ({filteredTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionsTable
                  transactions={filteredTransactions}
                  selectedTransactions={selectedTransactions}
                  onSelectTransaction={handleSelectTransaction}
                  onSelectAll={handleSelectAll}
                  onViewTransaction={handleViewTransaction}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onDuplicateTransaction={handleDuplicateTransaction}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Categorias de Receitas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ArrowUpCircle className="h-5 w-5 mr-2 text-green-600" />
                    Categorias de Receitas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">⚖️ Honorários advocatícios</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'honorarios').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">📋 Consultorias jurídicas</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'consultorias').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">🤝 Acordos e mediações</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'acordos').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">🏛️ Custas judiciais reembolsadas</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'custas_reemb').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-sm">📄 Outros serviços jurídicos</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'outros_servicos').length}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total de receitas:</span>
                      <span className="text-green-600 font-bold">
                        {formatCurrency(stats.totalIncome)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categorias de Despesas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ArrowDownCircle className="h-5 w-5 mr-2 text-red-600" />
                    Categorias de Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">👥 Salários e encargos trabalhistas</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'salarios').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">🏢 Aluguel / condomínio</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'aluguel').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
                        <span className="text-sm">⚡ Contas (água, luz, internet)</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'contas').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                        <span className="text-sm">📎 Material de escritório</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'material').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                        <span className="text-sm">📢 Marketing e publicidade</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'marketing').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">🏛️ Custas judiciais</span>
                      </div>
                      <Badge variant="outline">
                        {filteredTransactions.filter(t => t.categoryId === 'custas_judiciais').length}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total de despesas:</span>
                      <span className="text-red-600 font-bold">
                        {formatCurrency(stats.totalExpenses)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="space-y-6">
              {/* Relatórios de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Relatórios de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Últimos 30 dias</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Receitas:</span>
                          <span className="text-green-600 font-medium">
                            {formatCurrency(stats.totalIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Despesas:</span>
                          <span className="text-red-600 font-medium">
                            {formatCurrency(stats.totalExpenses)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="font-medium">Saldo:</span>
                          <span className={`font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(stats.balance)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Métricas</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total transações:</span>
                          <span className="font-medium">{stats.transactionCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Média receitas:</span>
                          <span className="font-medium">
                            {formatCurrency(stats.averageIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Média despesas:</span>
                          <span className="font-medium">
                            {formatCurrency(stats.averageExpense)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Categorias Top</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Honorários:</span>
                          <span className="font-medium">
                            {filteredTransactions.filter(t => t.categoryId === 'honorarios').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Salários:</span>
                          <span className="font-medium">
                            {filteredTransactions.filter(t => t.categoryId === 'salarios').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Aluguel:</span>
                          <span className="font-medium">
                            {filteredTransactions.filter(t => t.categoryId === 'aluguel').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Relatórios por Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Status das Transações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Confirmadas</span>
                        <Badge className="bg-green-100 text-green-800">
                          {filteredTransactions.filter(t => t.status === 'confirmed').length}
                        </Badge>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-green-600">
                        {formatCurrency(
                          filteredTransactions
                            .filter(t => t.status === 'confirmed')
                            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                        )}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pendentes</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {filteredTransactions.filter(t => t.status === 'pending').length}
                        </Badge>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-yellow-600">
                        {formatCurrency(
                          filteredTransactions
                            .filter(t => t.status === 'pending')
                            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                        )}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Canceladas</span>
                        <Badge className="bg-red-100 text-red-800">
                          {filteredTransactions.filter(t => t.status === 'cancelled').length}
                        </Badge>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-red-600">
                        {formatCurrency(
                          filteredTransactions
                            .filter(t => t.status === 'cancelled')
                            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações de Relatório */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Exportar Relatórios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-4">
                    <Button variant="outline" onClick={exportToCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV Completo
                    </Button>
                    <Button variant="outline" onClick={exportMonthlyReport}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Relatório Mensal
                    </Button>
                    <Button variant="outline" onClick={exportCategoriesReport}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Por Categorias
                    </Button>
                    <Button variant="outline" onClick={exportCashFlowReport}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Fluxo de Caixa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recurring" className="mt-6">
            <div className="space-y-6">
              {/* Transações Recorrentes Ativas */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Transações Recorrentes
                  </CardTitle>
                  <Button
                    onClick={() => {
                      setEditingTransaction(undefined);
                      setShowTransactionForm(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Recorrente
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredTransactions.filter(t => t.isRecurring).length > 0 ? (
                      filteredTransactions.filter(t => t.isRecurring).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center space-x-4">
                            {transaction.type === 'income' ? (
                              <ArrowUpCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowDownCircle className="h-5 w-5 text-red-600" />
                            )}
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {transaction.category} • Mensal
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className={`text-lg font-semibold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                            <Badge className={`${
                              transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status === 'confirmed' ? 'Ativo' :
                               transaction.status === 'pending' ? 'Pendente' : 'Inativo'}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => handleEditTransaction(transaction)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhuma transação recorrente</h3>
                        <p className="text-muted-foreground mb-4">
                          Configure transações que se repetem automaticamente todos os meses.
                        </p>
                        <Button
                          onClick={() => {
                            setEditingTransaction(undefined);
                            setForceRecurring(true);
                            setShowTransactionForm(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeira Recorrente
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumo de Recorrentes */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">💰 Receitas Recorrentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        filteredTransactions
                          .filter(t => t.isRecurring && t.type === 'income' && t.status === 'confirmed')
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {filteredTransactions.filter(t => t.isRecurring && t.type === 'income').length} receitas/mês
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">📉 Despesas Recorrentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(
                        filteredTransactions
                          .filter(t => t.isRecurring && t.type === 'expense' && t.status === 'confirmed')
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {filteredTransactions.filter(t => t.isRecurring && t.type === 'expense').length} despesas/mês
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">🏦 Saldo Recorrente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${
                      (filteredTransactions
                        .filter(t => t.isRecurring && t.type === 'income' && t.status === 'confirmed')
                        .reduce((sum, t) => sum + t.amount, 0) -
                       filteredTransactions
                        .filter(t => t.isRecurring && t.type === 'expense' && t.status === 'confirmed')
                        .reduce((sum, t) => sum + t.amount, 0)) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(
                        filteredTransactions
                          .filter(t => t.isRecurring && t.type === 'income' && t.status === 'confirmed')
                          .reduce((sum, t) => sum + t.amount, 0) -
                        filteredTransactions
                          .filter(t => t.isRecurring && t.type === 'expense' && t.status === 'confirmed')
                          .reduce((sum, t) => sum + t.amount, 0)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Resultado mensal
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Próximas Execuções */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Próximas Execuções
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredTransactions.filter(t => t.isRecurring).slice(0, 3).map((transaction) => {
                      const nextExecution = new Date();
                      nextExecution.setMonth(nextExecution.getMonth() + 1);
                      return (
                        <div key={`next-${transaction.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {transaction.type === 'income' ? (
                              <ArrowUpCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownCircle className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <div className="font-medium text-sm">{transaction.description}</div>
                              <div className="text-xs text-muted-foreground">{transaction.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {nextExecution.toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredTransactions.filter(t => t.isRecurring).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhuma transação recorrente configurada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Transaction Form Modal */}
        <TransactionForm
          open={showTransactionForm}
          onOpenChange={setShowTransactionForm}
          transaction={editingTransaction}
          onSubmit={handleSubmitTransaction}
          isEditing={!!editingTransaction}
          forceRecurring={forceRecurring}
        />

        {/* Transaction View Dialog */}
        <TransactionViewDialog
          open={showTransactionView}
          onOpenChange={setShowTransactionView}
          transaction={viewingTransaction}
          onEdit={handleEditFromView}
          onDuplicate={handleDuplicateFromView}
        />
      </div>
    </DashboardLayout>
  );
}
