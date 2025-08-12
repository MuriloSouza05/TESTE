import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Edit,
  Copy,
  User,
  Building,
  FileText,
  Tag,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { Transaction } from '@/types/cashflow';

interface TransactionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onEdit?: (transaction: Transaction) => void;
  onDuplicate?: (transaction: Transaction) => void;
}

export function TransactionViewDialog({ 
  open, 
  onOpenChange, 
  transaction, 
  onEdit,
  onDuplicate
}: TransactionViewDialogProps) {
  if (!transaction) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTypeLabel = (type: string) => {
    return type === 'income' ? 'Receita' : 'Despesa';
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap = {
      pix: 'PIX',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      bank_transfer: 'Transferência Bancária',
      boleto: 'Boleto',
      cash: 'Dinheiro',
      check: 'Cheque',
    };
    return methodMap[method as keyof typeof methodMap] || method;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {transaction.type === 'income' ? (
                <ArrowUpCircle className="h-8 w-8 text-green-600" />
              ) : (
                <ArrowDownCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <DialogTitle className="text-xl">
                  {getTypeLabel(transaction.type)} #{transaction.id}
                </DialogTitle>
                <DialogDescription>
                  {transaction.description}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(transaction.status)}>
                {getStatusLabel(transaction.status)}
              </Badge>
              <div className="flex space-x-1">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(transaction)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
                {onDuplicate && (
                  <Button variant="outline" size="sm" onClick={() => onDuplicate(transaction)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Valor Principal */}
          <div className="text-center py-6 bg-muted/50 rounded-lg">
            <div className={`text-4xl font-bold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
            <p className="text-muted-foreground mt-2">{transaction.category}</p>
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Informações Financeiras
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{getTypeLabel(transaction.type)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="font-medium">{transaction.category}</span>
                </div>
                {transaction.paymentMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Método de Pagamento:</span>
                    <span className="font-medium">
                      {getPaymentMethodLabel(transaction.paymentMethod)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(transaction.status)} variant="secondary">
                    {getStatusLabel(transaction.status)}
                  </Badge>
                </div>
                {transaction.isRecurring && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recorrente:</span>
                    <Badge variant="outline">Sim</Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Datas e Histórico
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data da Transação:</span>
                  <span className="font-medium">{formatDate(transaction.date)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{formatDateTime(transaction.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Atualizado em:</span>
                  <span>{formatDateTime(transaction.updatedAt)}</span>
                </div>
                {transaction.createdBy && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Criado por:</span>
                    <span>{transaction.createdBy}</span>
                  </div>
                )}
                {transaction.lastModifiedBy && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Modificado por:</span>
                    <span>{transaction.lastModifiedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações do Projeto/Cliente */}
          {(transaction.projectTitle || transaction.clientName) && (
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <User className="h-5 w-5 mr-2" />
                Projeto e Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.projectTitle && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Projeto</span>
                    </div>
                    <p className="text-sm">{transaction.projectTitle}</p>
                  </div>
                )}
                {transaction.clientName && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Cliente</span>
                    </div>
                    <p className="text-sm">{transaction.clientName}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {transaction.tags && transaction.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {transaction.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {transaction.notes && (
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <FileText className="h-5 w-5 mr-2" />
                Observações
              </h3>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">{transaction.notes}</p>
              </div>
            </div>
          )}

          {/* Anexos */}
          {transaction.attachments && transaction.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Anexos</h3>
              <div className="space-y-2">
                {transaction.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{attachment}</span>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
