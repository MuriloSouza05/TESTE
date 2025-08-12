import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Enhanced suppression of Recharts defaultProps warnings for React 18+
// These warnings come from the Recharts library itself and cannot be fixed from our application code
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress Recharts defaultProps warnings
    if (message.includes('defaultProps will be removed') &&
        (message.includes('XAxis') || message.includes('YAxis'))) {
      return;
    }
    // Also catch React development warnings about Recharts components
    if (message.includes('Warning: ') &&
        (message.includes('XAxis') || message.includes('YAxis')) &&
        message.includes('defaultProps')) {
      return;
    }
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress React error logs about defaultProps from Recharts
    if (message.includes('defaultProps') &&
        (message.includes('XAxis') || message.includes('YAxis'))) {
      return;
    }
  }
  originalError.apply(console, args);
};

// Mock data for charts
const monthlyFinancialData = [
  { month: 'Jan', receitas: 45000, despesas: 28000, saldo: 17000 },
  { month: 'Fev', receitas: 52000, despesas: 32000, saldo: 20000 },
  { month: 'Mar', receitas: 48000, despesas: 29000, saldo: 19000 },
  { month: 'Abr', receitas: 61000, despesas: 35000, saldo: 26000 },
  { month: 'Mai', receitas: 55000, despesas: 31000, saldo: 24000 },
  { month: 'Jun', receitas: 67000, despesas: 38000, saldo: 29000 },
];

const revenueByCategory = [
  { name: 'Honorários Advocatícios', value: 65, amount: 42250, color: '#10B981' },
  { name: 'Consultorias Jurídicas', value: 20, amount: 13000, color: '#3B82F6' },
  { name: 'Acordos e Mediações', value: 10, amount: 6500, color: '#8B5CF6' },
  { name: 'Custas Reembolsadas', value: 3, amount: 1950, color: '#F59E0B' },
  { name: 'Outros Serviços', value: 2, amount: 1300, color: '#6B7280' },
];

const expensesByCategory = [
  { name: 'Salários', value: 45, amount: 14400, color: '#EF4444' },
  { name: 'Aluguel', value: 25, amount: 8000, color: '#F97316' },
  { name: 'Contas Básicas', value: 10, amount: 3200, color: '#84CC16' },
  { name: 'Material Escritório', value: 8, amount: 2560, color: '#06B6D4' },
  { name: 'Marketing', value: 7, amount: 2240, color: '#EC4899' },
  { name: 'Outros', value: 5, amount: 1600, color: '#6B7280' },
];

const casesByStatus = [
  { status: 'Em Andamento', count: 15, color: '#10B981' },
  { status: 'Em Análise', count: 8, color: '#F59E0B' },
  { status: 'Aguardando', count: 5, color: '#F97316' },
  { status: 'Revisão', count: 3, color: '#8B5CF6' },
  { status: 'Concluído', count: 12, color: '#059669' },
];

const clientsGrowth = [
  { month: 'Jan', novos: 8, ativos: 120 },
  { month: 'Fev', novos: 12, ativos: 127 },
  { month: 'Mar', novos: 6, ativos: 131 },
  { month: 'Abr', novos: 15, ativos: 142 },
  { month: 'Mai', novos: 9, ativos: 148 },
  { month: 'Jun', novos: 11, ativos: 156 },
];

interface ChartsProps {
  className?: string;
}

export function DashboardCharts({ className }: ChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('Receitas') || entry.name.includes('Despesas') || entry.name.includes('Saldo')
                ? formatCurrency(entry.value)
                : `${entry.value} ${entry.name === 'Casos' ? 'casos' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
      {/* Financial Evolution Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Evolução Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyFinancialData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="category"
                dataKey="month"
                stroke="#6B7280"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
                interval={0}
                height={60}
                orientation="bottom"
                allowDecimals={false}
                allowDuplicatedCategory={false}
                scale="auto"
              />
              <YAxis
                type="number"
                stroke="#6B7280"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
                width={80}
                domain={['auto', 'auto']}
                orientation="left"
                allowDecimals={false}
                scale="auto"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                name="Receitas"
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                name="Despesas"
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                name="Saldo"
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [
                  `${value}% (${formatCurrency(revenueByCategory.find(item => item.name === name)?.amount || 0)})`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {revenueByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expenses by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [
                  `${value}% (${formatCurrency(expensesByCategory.find(item => item.name === name)?.amount || 0)})`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {expensesByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cases by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Casos por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={casesByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="category"
                dataKey="status"
                stroke="#6B7280"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
                orientation="bottom"
                allowDecimals={false}
                allowDuplicatedCategory={false}
                scale="auto"
              />
              <YAxis
                type="number"
                stroke="#6B7280"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
                width={60}
                domain={[0, 'auto']}
                orientation="left"
                allowDecimals={false}
                scale="auto"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Casos" radius={[4, 4, 0, 0]}>
                {casesByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Clients Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={clientsGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="category"
                dataKey="month"
                stroke="#6B7280"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
                interval={0}
                height={60}
                orientation="bottom"
                allowDecimals={false}
                allowDuplicatedCategory={false}
                scale="auto"
              />
              <YAxis
                type="number"
                stroke="#6B7280"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#6B7280' }}
                axisLine={{ stroke: '#6B7280' }}
                width={60}
                domain={[0, 'auto']}
                orientation="left"
                allowDecimals={false}
                scale="auto"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="ativos"
                name="Clientes Ativos"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="novos"
                name="Novos Clientes"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
