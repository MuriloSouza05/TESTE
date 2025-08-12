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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  DollarSign,
  Calendar,
  Edit,
  Download,
  Send,
  Copy,
  User,
  Building,
  Mail,
  Phone,
} from 'lucide-react';
import { Estimate, Invoice } from '@/types/billing';

type Document = Estimate | Invoice;

interface DocumentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onEdit?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onSend?: (document: Document) => void;
  onDuplicate?: (document: Document) => void;
}

export function DocumentViewDialog({ 
  open, 
  onOpenChange, 
  document, 
  onEdit,
  onDownload,
  onSend,
  onDuplicate
}: DocumentViewDialogProps) {
  if (!document) return null;

  const formatCurrency = (value: number, currency: string) => {
    const formatters = {
      BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    };
    return formatters[currency as keyof typeof formatters]?.format(value) || `${currency} ${value}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTypeLabel = (type: string) => {
    const typeMap = {
      estimate: 'Orçamento',
      invoice: 'Fatura',

    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      DRAFT: 'Rascunho',
      SENT: 'Enviado',
      VIEWED: 'Visualizado',
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado',
      PENDING: 'Pendente',
      PAID: 'Pago',
      OVERDUE: 'Vencido',
      CANCELLED: 'Cancelado',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      VIEWED: 'bg-purple-100 text-purple-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateTotal = () => {
    if (!document?.items) return 0;
    const subtotal = document.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxTotal = document.items.reduce((sum, item) => sum + (item.quantity * item.rate * (item.tax || 0) / 100), 0);
    return subtotal + taxTotal;
  };

  const calculateSubtotal = () => {
    if (!document?.items) return 0;
    return document.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTaxTotal = () => {
    if (!document?.items) return 0;
    return document.items.reduce((sum, item) => sum + (item.quantity * item.rate * (item.tax || 0) / 100), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <DialogTitle className="text-xl">
                  {getTypeLabel(document.type)} #{document.number}
                </DialogTitle>
                <DialogDescription className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{document.clientName}</span>
                  {document.organization && (
                    <>
                      <span>•</span>
                      <Building className="h-4 w-4" />
                      <span>{document.organization}</span>
                    </>
                  )}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(document.status)}>
                {getStatusLabel(document.status)}
              </Badge>
              <div className="flex space-x-1">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(document)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
                {onDuplicate && (
                  <Button variant="outline" size="sm" onClick={() => onDuplicate(document)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </Button>
                )}
                {onSend && document.status === 'DRAFT' && (
                  <Button variant="outline" size="sm" onClick={() => onSend(document)}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                )}
                {onDownload && (
                  <Button variant="outline" size="sm" onClick={() => onDownload(document)}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações do Cliente
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong>Nome:</strong> {document.clientName}</div>
                {document.organization && (
                  <div><strong>Organização:</strong> {document.organization}</div>
                )}
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {document.clientEmail}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {document.clientPhone}
                </div>
                <div><strong>Endereço:</strong> {document.clientAddress}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Informações do Documento
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong>Data de Criação:</strong> {formatDate(document.issueDate)}</div>
                <div><strong>Data de Vencimento:</strong> {formatDate(document.dueDate)}</div>
                <div><strong>Criado em:</strong> {formatDate(document.createdAt)}</div>
                <div><strong>Atualizado em:</strong> {formatDate(document.updatedAt)}</div>
                {document.notes && (
                  <div>
                    <strong>Observações:</strong>
                    <p className="mt-1 text-muted-foreground">{document.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Itens do Documento */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Itens</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Valor Unit.</TableHead>
                  <TableHead className="text-center">Taxa (%)</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(document?.items || []).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.rate, document.currency)}
                    </TableCell>
                    <TableCell className="text-center">{item.tax}%</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        item.quantity * item.rate + (item.quantity * item.rate * item.tax / 100),
                        document.currency
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Totais */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal(), document.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Impostos:</span>
                <span>{formatCurrency(calculateTaxTotal(), document.currency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-lg">
                  {formatCurrency(calculateTotal(), document.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Informações de Pagamento (apenas para faturas) */}
          {document.type === 'invoice' && 'paymentStatus' in document && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Status de Pagamento</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> {getStatusLabel(document.paymentStatus)}
                </div>
                {document.paymentMethod && (
                  <div>
                    <strong>Método:</strong> {document.paymentMethod}
                  </div>
                )}
                {document.paidAt && (
                  <div>
                    <strong>Pago em:</strong> {formatDate(document.paidAt)}
                  </div>
                )}
                {document.paidAmount !== undefined && (
                  <div>
                    <strong>Valor Pago:</strong> {formatCurrency(document.paidAmount, document.currency)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
