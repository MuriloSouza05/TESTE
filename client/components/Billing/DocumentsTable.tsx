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
  Download,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Estimate, Invoice, DocumentStatus, PaymentStatus } from '@/types/billing';

type Document = Estimate | Invoice;

interface DocumentsTableProps {
  documents: Document[];
  selectedDocs: string[];
  onSelectDoc: (docId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onEditDoc: (document: Document) => void;
  onDeleteDoc: (docId: string) => void;
  onViewDoc: (document: Document) => void;
  onDownloadDoc: (document: Document) => void;
  onDuplicateDoc: (document: Document) => void;
}

export function DocumentsTable({
  documents,
  selectedDocs,
  onSelectDoc,
  onSelectAll,
  onEditDoc,
  onDeleteDoc,
  onViewDoc,
  onDownloadDoc,
  onDuplicateDoc,
}: DocumentsTableProps) {
  const formatCurrency = (value: number, currency: string) => {
    const formatters = {
      BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    };
    return formatters[currency as keyof typeof formatters]?.format(value) || `${currency} ${value}`;
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'SENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'VIEWED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'OVERDUE':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'PENDING':
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'DRAFT': return 'Rascunho';
      case 'SENT': return 'Enviado';
      case 'VIEWED': return 'Visualizado';
      case 'APPROVED': return 'Aprovado';
      case 'REJECTED': return 'Rejeitado';
      case 'PENDING': return 'Pendente';
      case 'PAID': return 'Pago';
      case 'OVERDUE': return 'Vencido';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'estimate': return 'Orçamento';
      case 'invoice': return 'Fatura';

      default: return type;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'estimate':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Orçamento</Badge>;
      case 'invoice':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Fatura</Badge>;

      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (document: Document) => {
    return null;
  };

  const isOverdue = (dueDate: string, status: DocumentStatus) => {
    return new Date(dueDate) < new Date() && status !== 'PAID' && status !== 'CANCELLED';
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedDocs.length === documents.length && documents.length > 0}
                onCheckedChange={onSelectAll}
                aria-label="Selecionar todos"
              />
            </TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data/Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="w-12">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Nenhum documento encontrado
              </TableCell>
            </TableRow>
          ) : (
            documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedDocs.includes(document.id)}
                    onCheckedChange={() => onSelectDoc(document.id)}
                    aria-label={`Selecionar ${document.number}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{document.number}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {document.title}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{document.receiverName}</div>
                    <div className="text-sm text-muted-foreground">
                      {document.receiverDetails.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      📅 {new Date(document.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className={`text-sm flex items-center ${
                      isOverdue(document.dueDate, document.status) 
                        ? 'text-red-600 font-medium' 
                        : 'text-muted-foreground'
                    }`}>
                      ⏰ {new Date(document.dueDate).toLocaleDateString('pt-BR')}
                      {isOverdue(document.dueDate, document.status) && (
                        <AlertCircle className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-green-600">
                    {formatCurrency(document.total, document.currency)}
                  </div>
                  {document.items.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {document.items.length} {document.items.length === 1 ? 'item' : 'itens'}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(document.status)}>
                    {getStatusIcon(document.status)}
                    {getStatusLabel(document.status)}
                  </Badge>
                  {document.type === 'invoice' && (document as Invoice).paymentStatus && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {(document as Invoice).paymentStatus}
                      </Badge>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getDocumentTypeBadge(document.type)}
                    {getPriorityBadge(document)}
                  </div>
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
                      <DropdownMenuItem onClick={() => onViewDoc(document)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditDoc(document)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicateDoc(document)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      {/* REMOVIDO: Opção "Enviar" para evitar erros undefined */}
                      {/* Em produção, implementar funcionalidade completa de envio */}
                      <DropdownMenuItem onClick={() => onDownloadDoc(document)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteDoc(document.id)}
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
