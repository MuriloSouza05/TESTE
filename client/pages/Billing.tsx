import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  FileText,
  Plus,
  Search,
  Filter,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Receipt,
  CreditCard,
  Calculator,
  Mail
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
} from '@/components/ui/dropdown-menu';
import { DocumentForm } from '@/components/Billing/DocumentForm';
import { DocumentsTable } from '@/components/Billing/DocumentsTable';
import { DocumentViewDialog } from '@/components/Billing/DocumentViewDialog';
import { EmailSendModal } from '@/components/Billing/EmailSendModal';
import {
  Estimate,
  Invoice,
  BillingStats,
  DocumentStatus,
  CompanyDetails,
  BillingItem
} from '@/types/billing';

// Mock data
const mockCompanyDetails: CompanyDetails = {
  name: 'Escritório Silva & Associados',
  document: '12.345.678/0001-90',
  email: 'contato@silva.adv.br',
  phone: '(11) 3333-4444',
  address: 'Av. Paulista, 1000, Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01310-100',
  country: 'Brasil',
};

const mockClientDetails: CompanyDetails = {
  name: 'Maria Silva Santos',
  document: '123.456.789-00',
  email: 'maria@email.com',
  phone: '(11) 99999-1234',
  address: 'Rua Augusta, 123, Cerqueira César',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01305-000',
  country: 'Brasil',
};

const mockItems: BillingItem[] = [
  {
    id: '1',
    description: 'Consulta jurídica especializada',
    quantity: 2,
    rate: 500,
    amount: 1000,
    tax: 0,
  },
  {
    id: '2',
    description: 'Elaboração de contrato',
    quantity: 1,
    rate: 1500,
    amount: 1500,
    tax: 0,
  },
];

const mockEstimates: Estimate[] = [
  {
    id: '1',
    type: 'estimate',
    number: 'EST-001',
    date: '2024-01-15T00:00:00Z',
    dueDate: '2024-02-15T00:00:00Z',
    validUntil: '2024-02-15T00:00:00Z',
    senderId: '1',
    senderName: 'Escritório Silva & Associados',
    senderDetails: mockCompanyDetails,
    receiverId: '1',
    receiverName: 'Maria Silva Santos',
    receiverDetails: mockClientDetails,
    title: 'Orçamento para Serviços Jurídicos',
    description: 'Serviços de consultoria e elaboração de contrato',
    items: mockItems,
    subtotal: 2500,
    discount: 100,
    discountType: 'fixed',
    fee: 0,
    feeType: 'fixed',
    tax: 250,
    taxType: 'fixed',
    total: 2650,
    currency: 'BRL',
    status: 'SENT',
    convertedToInvoice: false,
    attachments: [],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    createdBy: 'Dr. Silva',
    lastModifiedBy: 'Dr. Silva',
  },
];

const mockInvoices: Invoice[] = [
  {
    id: '2',
    type: 'invoice',
    number: 'INV-001',
    date: '2024-01-20T00:00:00Z',
    dueDate: '2024-02-20T00:00:00Z',
    senderId: '1',
    senderName: 'Escritório Silva & Associados',
    senderDetails: mockCompanyDetails,
    receiverId: '1',
    receiverName: 'Maria Silva Santos',
    receiverDetails: mockClientDetails,
    title: 'Fatura de Serviços Jurídicos',
    description: 'Serviços prestados em Janeiro 2024',
    items: mockItems,
    subtotal: 2500,
    discount: 0,
    discountType: 'fixed',
    fee: 0,
    feeType: 'fixed',
    tax: 250,
    taxType: 'fixed',
    total: 2750,
    currency: 'BRL',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    emailSent: true,
    emailSentAt: '2024-01-20T10:00:00Z',
    remindersSent: 1,
    lastReminderAt: '2024-02-10T09:00:00Z',
    attachments: [],
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z',
    createdBy: 'Dr. Silva',
    lastModifiedBy: 'Dr. Silva',
  },
];



export function Billing() {
  const [activeTab, setActiveTab] = useState('all');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showDocumentView, setShowDocumentView] = useState(false);
  const [documentType, setDocumentType] = useState<'estimate' | 'invoice'>('estimate');
  const [editingDocument, setEditingDocument] = useState<any>(undefined);
  const [viewingDocument, setViewingDocument] = useState<any>(null);

  const [estimates, setEstimates] = useState<Estimate[]>(mockEstimates);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);


  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Combine all documents
  const allDocuments = [...estimates, ...invoices];

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = allDocuments;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(doc => doc.type === activeTab);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allDocuments, activeTab, searchTerm, statusFilter]);

  // Calculate statistics
  const stats: BillingStats = useMemo(() => {
    const totalEstimates = estimates.length;
    const totalInvoices = invoices.length;

    const pendingAmount = allDocuments
      .filter(doc => ['PENDING', 'SENT', 'VIEWED'].includes(doc.status))
      .reduce((sum, doc) => sum + doc.total, 0);

    const paidAmount = allDocuments
      .filter(doc => doc.status === 'PAID')
      .reduce((sum, doc) => sum + doc.total, 0);

    const overdueAmount = allDocuments
      .filter(doc => doc.status === 'OVERDUE' ||
        (new Date(doc.dueDate) < new Date() && !['PAID', 'CANCELLED'].includes(doc.status)))
      .reduce((sum, doc) => sum + doc.total, 0);

    const thisMonth = new Date();
    const thisMonthRevenue = allDocuments
      .filter(doc => {
        const docDate = new Date(doc.date);
        return docDate.getMonth() === thisMonth.getMonth() &&
               docDate.getFullYear() === thisMonth.getFullYear() &&
               doc.status === 'PAID';
      })
      .reduce((sum, doc) => sum + doc.total, 0);

    return {
      totalEstimates,
      totalInvoices,
      pendingAmount,
      paidAmount,
      overdueAmount,
      thisMonthRevenue,
      averagePaymentTime: 15, // Mock value
    };
  }, [estimates, invoices, allDocuments]);

  const handleCreateDocument = (type: 'estimate' | 'invoice') => {
    setDocumentType(type);
    setEditingDocument(undefined);
    setShowDocumentForm(true);
  };

  const handleSubmitDocument = (data: any) => {
    // CORREÇÃO: Verificar se está editando documento existente ou criando novo
    const isEditing = !!editingDocument;

    const baseDoc = {
      ...data,
      id: isEditing ? editingDocument.id : Date.now().toString(),
      date: data.date + 'T00:00:00Z',
      dueDate: data.dueDate + 'T00:00:00Z',
      senderName: 'Escritório Silva & Associados',
      senderDetails: mockCompanyDetails,
      receiverName: 'Cliente Selecionado',
      receiverDetails: mockClientDetails,
      subtotal: data.items.reduce((sum: number, item: BillingItem) => sum + (item.amount || 0), 0),
      total: (() => {
        const subtotal = data.items.reduce((sum: number, item: BillingItem) => sum + (item.amount || 0), 0);
        const discount = data.discount || 0;
        const fee = data.fee || 0;
        const tax = data.tax || 0;
        return subtotal - discount + fee + tax;
      })(),
      status: isEditing ? editingDocument.status : 'DRAFT' as DocumentStatus,
      attachments: isEditing ? editingDocument.attachments : [],
      createdAt: isEditing ? editingDocument.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: isEditing ? editingDocument.createdBy : 'Dr. Silva',
      lastModifiedBy: 'Dr. Silva',
    };

    if (documentType === 'estimate') {
      const estimate: Estimate = {
        ...baseDoc,
        type: 'estimate',
        number: isEditing ? editingDocument.number : `EST-${(estimates.length + 1).toString().padStart(3, '0')}`,
        validUntil: data.dueDate + 'T00:00:00Z',
        convertedToInvoice: isEditing ? editingDocument.convertedToInvoice : false,
      };

      if (isEditing) {
        // CORREÇÃO: Atualizar documento existente ao invés de criar novo
        setEstimates(estimates.map(est => est.id === estimate.id ? estimate : est));
      } else {
        setEstimates([...estimates, estimate]);

        // NOVIDADE: Enviar notificação apenas quando novo orçamento for criado
        console.log("📢 NOTIFICAÇÃO ENVIADA: Novo orçamento criado", {
          type: 'info',
          title: 'Novo Orçamento Criado',
          message: `Orçamento ${estimate.number} foi criado para ${estimate.receiverName}`,
          category: 'billing',
          createdBy: 'Usuário Atual',
          documentData: {
            id: estimate.id,
            number: estimate.number,
            type: 'estimate',
            client: estimate.receiverName,
            amount: estimate.total
          }
        });
      }
    } else if (documentType === 'invoice') {
      const invoice: Invoice = {
        ...baseDoc,
        type: 'invoice',
        number: isEditing ? editingDocument.number : `INV-${(invoices.length + 1).toString().padStart(3, '0')}`,
        paymentStatus: isEditing ? editingDocument.paymentStatus : 'PENDING',
        emailSent: isEditing ? editingDocument.emailSent : false,
        remindersSent: isEditing ? editingDocument.remindersSent : 0,
      };

      if (isEditing) {
        // CORREÇÃO: Atualizar documento existente ao invés de criar novo
        setInvoices(invoices.map(inv => inv.id === invoice.id ? invoice : inv));
      } else {
        setInvoices([...invoices, invoice]);

        // NOVIDADE: Enviar notificação apenas quando nova fatura for criada
        console.log("📢 NOTIFICAÇÃO ENVIADA: Nova fatura criada", {
          type: 'warning',
          title: 'Nova Fatura Criada',
          message: `Fatura ${invoice.number} foi criada para ${invoice.receiverName} - Valor: R$ ${invoice.total.toFixed(2)}`,
          category: 'billing',
          createdBy: 'Usuário Atual',
          documentData: {
            id: invoice.id,
            number: invoice.number,
            type: 'invoice',
            client: invoice.receiverName,
            amount: invoice.total,
            dueDate: invoice.dueDate
          }
        });
      }
    }

    // CORREÇÃO: Limpar estado de edição após salvar
    setEditingDocument(undefined);
    setShowDocumentForm(false);
  };

  const handleSelectDoc = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedDocs(checked ? filteredDocuments.map(doc => doc.id) : []);
  };

  const handleEditDoc = (document: any) => {
    setDocumentType(document.type);
    setEditingDocument(document);
    setShowDocumentForm(true);
  };

  const handleDeleteDoc = (docId: string) => {
    setEstimates(estimates.filter(doc => doc.id !== docId));
    setInvoices(invoices.filter(doc => doc.id !== docId));
    setSelectedDocs(selectedDocs.filter(id => id !== docId));
  };

  const handleViewDoc = (document: any) => {
    setViewingDocument(document);
    setShowDocumentView(true);
  };

  const handleEditFromView = (document: any) => {
    setDocumentType(document.type);
    setEditingDocument(document);
    setShowDocumentView(false);
    setShowDocumentForm(true);
  };

  const handleSendDoc = (document: any) => {
    // Update document status to SENT
    const updateDocumentStatus = (docs: any[], docId: string, newStatus: DocumentStatus) => {
      return docs.map(doc =>
        doc.id === docId
          ? { ...doc, status: newStatus, sentAt: new Date().toISOString() }
          : doc
      );
    };

    if (document.type === 'estimate') {
      setEstimates(prev => updateDocumentStatus(prev, document.id, 'SENT'));
    } else if (document.type === 'invoice') {
      setInvoices(prev => updateDocumentStatus(prev, document.id, 'SENT'));
    }

    alert(`✅ ${document.type === 'estimate' ? 'Orçamento' : 'Fatura'} enviado com sucesso para ${document.clientEmail}!`);
  };

  /**
   * Função para download de PDF dos documentos de cobrança
   * Gera um documento HTML estilizado e faz o download
   *
   * @param document - Documento completo com dados para o PDF
   */
  const handleDownloadDoc = (document: any) => {
    try {
      console.log('Iniciando download de PDF:', document);

      const filename = `${document.type}_${document.number}.pdf`;
      const total = document.items.reduce((sum: number, item: any) =>
        sum + (item.quantity * item.rate * (1 + item.tax / 100)), 0);

      // Criar conteúdo HTML completo para o documento
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${document.type === 'estimate' ? 'Orçamento' : 'Fatura'} - ${document.number}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 40px;
              color: #1f2937;
              line-height: 1.6;
              background: #ffffff;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 30px;
              margin-bottom: 40px;
            }
            .company {
              font-size: 28px;
              font-weight: 700;
              color: #3b82f6;
              margin-bottom: 15px;
            }
            .company-details {
              color: #6b7280;
              font-size: 14px;
              line-height: 1.5;
            }
            .document-title {
              font-size: 24px;
              margin: 30px 0;
              color: #1f2937;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 25px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              ${document.status === 'PAID' ? 'background: #d1fae5; color: #065f46;' :
                document.status === 'OVERDUE' ? 'background: #fee2e2; color: #991b1b;' :
                document.status === 'SENT' ? 'background: #dbeafe; color: #1e40af;' :
                'background: #fef3c7; color: #92400e;'}
            }
            .details-container {
              display: flex;
              justify-content: space-between;
              margin: 30px 0;
              gap: 40px;
            }
            .client-info, .document-info {
              flex: 1;
              background: #f9fafb;
              padding: 25px;
              border-radius: 12px;
              border-left: 4px solid #3b82f6;
            }
            .section-title {
              font-weight: 700;
              color: #374151;
              margin-bottom: 15px;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-row {
              margin-bottom: 8px;
              font-size: 14px;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
              display: inline-block;
              width: 120px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 40px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            .items-table th {
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              color: white;
              padding: 16px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table td {
              padding: 16px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            .items-table tr:nth-child(even) {
              background: #f9fafb;
            }
            .items-table tr:hover {
              background: #f3f4f6;
            }
            .amount-cell {
              text-align: right;
              font-weight: 600;
              color: #059669;
            }
            .total-section {
              margin: 40px 0;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .total-label {
              width: 150px;
              text-align: right;
              margin-right: 20px;
              color: #6b7280;
            }
            .total-value {
              width: 120px;
              text-align: right;
              font-weight: 600;
            }
            .grand-total {
              border-top: 2px solid #3b82f6;
              padding-top: 15px;
              margin-top: 15px;
              font-size: 20px;
              font-weight: 700;
              color: #059669;
            }
            .footer {
              margin-top: 60px;
              padding-top: 30px;
              border-top: 2px solid #e5e7eb;
            }
            .payment-info {
              background: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #0ea5e9;
            }
            .footer-note {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            @media print {
              body { padding: 20px; }
              .header { page-break-inside: avoid; }
              .items-table { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">Escritório Silva & Associados</div>
            <div class="company-details">
              CNPJ: 12.345.678/0001-90<br>
              contato@silva.adv.br | (11) 3333-4444<br>
              Av. Paulista, 1000, Bela Vista - São Paulo/SP - CEP: 01310-100
            </div>
          </div>

          <div class="document-title">
            <span>
              ${document.type === 'estimate' ? '📋 ORÇAMENTO' :
                document.type === '📄 FATURA'} Nº ${document.number}
            </span>
            <span class="status-badge">${
              document.status === 'PAID' ? 'PAGO' :
              document.status === 'OVERDUE' ? 'VENCIDO' :
              document.status === 'SENT' ? 'ENVIADO' : 'RASCUNHO'
            }</span>
          </div>

          <div class="details-container">
            <div class="client-info">
              <div class="section-title">Dados do Cliente</div>
              <div class="info-row">
                <span class="info-label">Nome:</span>
                ${document.clientName}
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                ${document.clientEmail}
              </div>
              <div class="info-row">
                <span class="info-label">Telefone:</span>
                ${document.clientPhone || '(11) 99999-1234'}
              </div>
              <div class="info-row">
                <span class="info-label">Endereço:</span>
                ${document.clientAddress || 'Rua Augusta, 123, São Paulo/SP'}
              </div>
            </div>

            <div class="document-info">
              <div class="section-title">Informações do Documento</div>
              <div class="info-row">
                <span class="info-label">Data Emissão:</span>
                ${new Date(document.issueDate).toLocaleDateString('pt-BR')}
              </div>
              ${document.dueDate ? `
                <div class="info-row">
                  <span class="info-label">Vencimento:</span>
                  ${new Date(document.dueDate).toLocaleDateString('pt-BR')}
                </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Validade:</span>
                ${document.validUntil ? new Date(document.validUntil).toLocaleDateString('pt-BR') : '30 dias'}
              </div>
              <div class="info-row">
                <span class="info-label">Valor Total:</span>
                <strong style="color: #059669; font-size: 16px;">
                  ${formatCurrency(total)}
                </strong>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50%;">Descrição</th>
                <th style="width: 10%; text-align: center;">Qtd</th>
                <th style="width: 20%; text-align: right;">Valor Unit.</th>
                <th style="width: 20%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${document.items.map((item: any) => `
                <tr>
                  <td>
                    <strong>${item.description}</strong>
                    ${item.details ? `<br><small style="color: #6b7280;">${item.details}</small>` : ''}
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td class="amount-cell">${formatCurrency(item.rate)}</td>
                  <td class="amount-cell">${formatCurrency(item.quantity * item.rate * (1 + item.tax / 100))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">${formatCurrency(document.items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0))}</span>
            </div>
            ${document.items.some((item: any) => item.tax > 0) ? `
              <div class="total-row">
                <span class="total-label">Impostos:</span>
                <span class="total-value">${formatCurrency(document.items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate * item.tax / 100), 0))}</span>
              </div>
            ` : ''}
            <div class="total-row grand-total">
              <span class="total-label">TOTAL GERAL:</span>
              <span class="total-value">${formatCurrency(total)}</span>
            </div>
          </div>

          <div class="footer">
            <div class="payment-info">
              <strong>💳 Formas de Pagamento Aceitas:</strong><br>
              PIX, Transferência Bancária, Cartão de Crédito/Débito<br><br>
              <strong>🏦 Dados Bancários:</strong><br>
              Banco do Brasil | Agência: 1234-5 | Conta Corrente: 67890-1<br>
              Chave PIX: contato@silva.adv.br
            </div>

            ${document.notes ? `
              <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                <strong>📝 Observações:</strong><br>
                ${document.notes}
              </div>
            ` : ''}

            <div class="footer-note">
              <p><strong>Este documento foi gerado eletronicamente pelo sistema de gestão.</strong></p>
              <p>Escritório Silva & Associados - Soluções Jurídicas Especializadas</p>
              <p style="margin-top: 15px; font-size: 11px;">
                📅 Documento gerado em: ${new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Criar Blob com o conteúdo HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

      // Criar URL para download
      const url = URL.createObjectURL(blob);

      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace('.pdf', '.html'); // HTML para visualizar no navegador
      link.style.display = 'none';

      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL
      URL.revokeObjectURL(url);

      // Mostrar notificação de sucesso elegante
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #059669, #065f46);
        color: white;
        padding: 20px 28px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
        z-index: 9999;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        max-width: 380px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">📄</div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Documento baixado!</div>
            <div style="opacity: 0.9; font-size: 13px;">
              ${document.type === 'estimate' ? 'Orçamento' :
                document.type === 'invoice' ? 'Fatura' : 'Fatura'} ${document.number}
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 50);

      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 4000);

    } catch (error) {
      console.error('Erro ao fazer download do documento:', error);

      // Mostrar erro com estilo
      const errorNotification = document.createElement('div');
      errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 20px 28px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        z-index: 9999;
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;
      errorNotification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">❌</div>
          <div>
            <div style="font-weight: 600;">Erro no download</div>
            <div style="opacity: 0.9; font-size: 13px;">Tente novamente em alguns instantes</div>
          </div>
        </div>
      `;

      document.body.appendChild(errorNotification);
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
      }, 4000);
    }
  };

  const handleDuplicateDoc = (document: any) => {
    const newDocument = {
      ...document,
      id: Date.now().toString(),
      number: `${document.number}-COPY`,
      status: 'DRAFT' as DocumentStatus,
      issueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (document.type === 'estimate') {
      setEstimates(prev => [...prev, newDocument]);
    } else if (document.type === 'invoice') {
      setInvoices(prev => [...prev, newDocument]);
    }

    alert(`📋 ${document.type === 'estimate' ? 'Orçamento' :
           document.type === 'invoice' ? 'Fatura' : 'Fatura'} duplicado com sucesso!`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer re_BLdUxfAX_Au4vh5xLAPcthy8bmCgXCcXr',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const result = await response.json();
      console.log('Email enviado com sucesso:', result);

      return result;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  };

  const handleOpenEmailModal = () => {
    if (selectedDocs.length === 0) {
      alert('⚠️ Selecione pelo menos um documento para enviar por email.');
      return;
    }
    setShowEmailModal(true);
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
              <BreadcrumbPage>Cobrança</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sistema de Cobrança</h1>
            <p className="text-muted-foreground">
              Estimates e Invoices para controle financeiro
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCreateDocument('estimate')}>
                <Calculator className="mr-2 h-4 w-4" />
                Orçamento (Estimate)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateDocument('invoice')}>
                <Receipt className="mr-2 h-4 w-4" />
                Fatura (Invoice)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalEstimates + stats.totalInvoices} documentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Paga</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Documentos pagos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valores Vencidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Necessitam cobrança
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.thisMonthRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Receita realizada
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Procurar documentos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="SENT">Enviado</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="OVERDUE">Vencido</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="default"
            onClick={handleOpenEmailModal}
            disabled={selectedDocs.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="h-4 w-4 mr-2" />
            Enviar Email {selectedDocs.length > 0 && `(${selectedDocs.length})`}
          </Button>
        </div>

        {/* Documents Table with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documentos de Cobrança ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">
                  Todos ({allDocuments.length})
                </TabsTrigger>
                <TabsTrigger value="estimate">
                  Orçamentos ({estimates.length})
                </TabsTrigger>
                <TabsTrigger value="invoice">
                  Faturas ({invoices.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <DocumentsTable
                  documents={filteredDocuments}
                  selectedDocs={selectedDocs}
                  onSelectDoc={handleSelectDoc}
                  onSelectAll={handleSelectAll}
                  onEditDoc={handleEditDoc}
                  onDeleteDoc={handleDeleteDoc}
                  onViewDoc={handleViewDoc}
                  onDownloadDoc={handleDownloadDoc}
                  onDuplicateDoc={handleDuplicateDoc}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Document Form Modal */}
        <DocumentForm
          open={showDocumentForm}
          onOpenChange={setShowDocumentForm}
          document={editingDocument}
          onSubmit={handleSubmitDocument}
          isEditing={!!editingDocument}
          type={documentType}
        />

        {/* Document View Dialog */}
        <DocumentViewDialog
          open={showDocumentView}
          onOpenChange={setShowDocumentView}
          document={viewingDocument}
          onEdit={handleEditFromView}
          onDownload={handleDownloadDoc}
          onSend={handleSendDoc}
          onDuplicate={handleDuplicateDoc}
        />

        {/* Email Send Modal */}
        <EmailSendModal
          open={showEmailModal}
          onOpenChange={setShowEmailModal}
          documents={allDocuments.filter(doc => selectedDocs.includes(doc.id)) || []}
          onSendEmail={handleSendEmail}
        />
      </div>
    </DashboardLayout>
  );
}
