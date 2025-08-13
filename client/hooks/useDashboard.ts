import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/contexts/AuthContext';

interface DashboardData {
  activeProjects: number;
  pendingTasks: number;
  totalReceivables: number;
  monthlyBalance: number;
}

interface DashboardMetrics {
  revenue: number;
  expenses: number;
  balance: number;
  clients: number;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authenticatedFetch = useAuthenticatedFetch();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Buscar dados do dashboard
        const dashboardResponse = await authenticatedFetch('http://localhost:3000/api/tenant/dashboard');
        
        if (!dashboardResponse.ok) {
          throw new Error('Erro ao carregar dados do dashboard');
        }

        const dashboardData = await dashboardResponse.json();

        // Buscar transações para calcular métricas financeiras
        const transactionsResponse = await authenticatedFetch('http://localhost:3000/api/tenant/transactions');
        const transactions = transactionsResponse.ok ? await transactionsResponse.json() : [];

        // Buscar clientes
        const clientsResponse = await authenticatedFetch('http://localhost:3000/api/tenant/clients');
        const clients = clientsResponse.ok ? await clientsResponse.json() : [];

        // Calcular métricas financeiras
        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        
        const monthlyTransactions = Array.isArray(transactions) ? transactions.filter((t: any) => 
          new Date(t.date) >= startOfMonth
        ) : [];

        const revenue = monthlyTransactions
          .filter((t: any) => t.type === 'INCOME')
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const expenses = monthlyTransactions
          .filter((t: any) => t.type === 'EXPENSE')
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        setData(dashboardData);
        setMetrics({
          revenue,
          expenses,
          balance: revenue - expenses,
          clients: Array.isArray(clients) ? clients.length : 0
        });
      } catch (err: any) {
        console.error('Erro ao carregar dashboard:', err);
        setError(err.message || 'Erro ao carregar dados');
        
        // Dados de fallback em caso de erro
        setData({
          activeProjects: 0,
          pendingTasks: 0,
          totalReceivables: 0,
          monthlyBalance: 0
        });
        setMetrics({
          revenue: 0,
          expenses: 0,
          balance: 0,
          clients: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [authenticatedFetch]);

  return {
    data,
    metrics,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      // Re-executar o useEffect
      const fetchDashboardData = async () => {
        try {
          setError(null);

          const dashboardResponse = await authenticatedFetch('http://localhost:3000/api/tenant/dashboard');
          
          if (!dashboardResponse.ok) {
            throw new Error('Erro ao carregar dados do dashboard');
          }

          const dashboardData = await dashboardResponse.json();

          const transactionsResponse = await authenticatedFetch('http://localhost:3000/api/tenant/transactions');
          const transactions = transactionsResponse.ok ? await transactionsResponse.json() : [];

          const clientsResponse = await authenticatedFetch('http://localhost:3000/api/tenant/clients');
          const clients = clientsResponse.ok ? await clientsResponse.json() : [];

          const currentMonth = new Date();
          const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          
          const monthlyTransactions = Array.isArray(transactions) ? transactions.filter((t: any) => 
            new Date(t.date) >= startOfMonth
          ) : [];

          const revenue = monthlyTransactions
            .filter((t: any) => t.type === 'INCOME')
            .reduce((sum: number, t: any) => sum + t.amount, 0);

          const expenses = monthlyTransactions
            .filter((t: any) => t.type === 'EXPENSE')
            .reduce((sum: number, t: any) => sum + t.amount, 0);

          setData(dashboardData);
          setMetrics({
            revenue,
            expenses,
            balance: revenue - expenses,
            clients: Array.isArray(clients) ? clients.length : 0
          });
        } catch (err: any) {
          console.error('Erro ao carregar dashboard:', err);
          setError(err.message || 'Erro ao carregar dados');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDashboardData();
    }
  };
}