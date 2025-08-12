export interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  tax?: number;
  taxType?: 'percentage' | 'fixed';
}

export interface BaseDocument {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  senderId: string;
  senderName: string;
  senderDetails: CompanyDetails;
  receiverId: string;
  receiverName: string;
  receiverDetails: CompanyDetails;
  title: string;
  description?: string;
  items: BillingItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  fee: number;
  feeType: 'percentage' | 'fixed';
  tax: number;
  taxType: 'percentage' | 'fixed';
  total: number;
  currency: 'BRL' | 'USD' | 'EUR';
  status: DocumentStatus;
  templateId?: string;
  notes?: string;
  attachments: DocumentAttachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface Estimate extends BaseDocument {
  type: 'estimate';
  number: string; // EST-{id}
  validUntil: string;
  convertedToInvoice?: boolean;
  invoiceId?: string;
}

export interface Invoice extends BaseDocument {
  type: 'invoice';
  number: string; // INV-{id}
  estimateId?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  emailSent: boolean;
  emailSentAt?: string;
  remindersSent: number;
  lastReminderAt?: string;
}

export type DocumentStatus = 
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PENDING'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type PaymentStatus = 
  | 'PENDING'
  | 'PAID'
  | 'PARTIAL'
  | 'OVERDUE'
  | 'CANCELLED';

export type PaymentMethod = 
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'BOLETO'
  | 'CASH'
  | 'CHECK';

export interface CompanyDetails {
  name: string;
  document: string; // CNPJ/CPF
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'estimate' | 'invoice';
  content: string; // HTML template
  variables: TemplateVariable[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
  required: boolean;
  defaultValue?: string;
}

export interface BillingStats {
  totalEstimates: number;
  totalInvoices: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  thisMonthRevenue: number;
  averagePaymentTime: number; // in days
}

export interface BillingActivity {
  id: string;
  type: 'created' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  documentType: 'estimate' | 'invoice';
  documentId: string;
  documentNumber: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
}
