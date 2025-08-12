import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  User,
  FolderOpen
} from 'lucide-react';
import { Transaction, TransactionStatus, PaymentMethod } from '@/types/cashflow';

interface TransactionsTableProps {
  transactions: Transaction[];
  selectedTransactions: string[];
  onSelectTransaction: (transactionId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onViewTransaction: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onDuplicateTransaction: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  selectedTransactions,
  onSelectTransaction,
  onSelectAll,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onDuplicateTransaction,
}: TransactionsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: TransactionStatus) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentMethodLabel = (method?: PaymentMethod) => {
    if (!method) return '-';
    
    switch (method) {
      case 'pix': return 'PIX';
      case 'credit_card': return 'Cartão Crédito';
      case 'debit_card': return 'Cartão Débito';
      case 'bank_transfer': return 'Transferência';
      case 'boleto': return 'Boleto';
      case 'cash': return 'Dinheiro';
      case 'check': return 'Cheque';
      default: return method;
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const iconMap: { [key: string]: string } = {
      // Income categories
      'honorarios': '⚖️',
      'consultorias': '📋',
      'acordos': '🤝',
      'custas_reemb': '🏛️',
      'outros_servicos': '📄',
      // Expense categories
      'salarios': '👥',
      'aluguel': '🏢',
      'contas': '⚡',
      'material': '📎',
      'marketing': '📢',
      'custas_judiciais': '🏛️',
      'treinamentos': '📚',
      'transporte': '🚗',
      'manutencao': '🔧',
      'impostos': '📋',
      'oab': '🏛️',
      'seguro': '🛡️',
    };
    return iconMap[categoryId] || '📝';
  };

  const getCategoryName = (categoryId: string) => {
    const nameMap: { [key: string]: string } = {
      // Income categories
      'honorarios': 'Honorários advocatícios',
      'consultorias': 'Consultorias jurídicas',
      'acordos': 'Acordos e mediações',
      'custas_reemb': 'Custas judiciais reembolsadas',
      'outros_servicos': 'Outros serviços jurídicos',
      // Expense categories
      'salarios': 'Salários e encargos',
      'aluguel': 'Aluguel / condomínio',
      'contas': 'Contas (água, luz, internet)',
      'material': 'Material de escritório',
      'marketing': 'Marketing e publicidade',
      'custas_judiciais': 'Custas judiciais',
      'treinamentos': 'Treinamentos e cursos',
      'transporte': 'Transporte e viagens',
      'manutencao': 'Manutenção e equipamentos',
      'impostos': 'Impostos e taxas',
      'oab': 'Associações profissionais',
      'seguro': 'Seguro profissional',
    };
    return nameMap[categoryId] || categoryId;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                onCheckedChange={onSelectAll}
                aria-label="Selecionar todas"
              />
            </TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="w-12">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={() => onSelectTransaction(transaction.id)}
                    aria-label={`Selecionar transação ${transaction.description}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {transaction.projectTitle && (
                        <div className="flex items-center space-x-1">
                          <FolderOpen className="h-3 w-3" />
                          <span>{transaction.projectTitle}</span>
                        </div>
                      )}
                      {transaction.clientName && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{transaction.clientName}</span>
                        </div>
                      )}
                    </div>
                    {transaction.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transaction.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {transaction.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{transaction.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getCategoryIcon(transaction.categoryId)}
                    </span>
                    <span className="text-sm">
                      {getCategoryName(transaction.categoryId)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)}>
                    {getStatusLabel(transaction.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {getPaymentMethodLabel(transaction.paymentMethod)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewTransaction(transaction)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditTransaction(transaction)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicateTransaction(transaction)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
