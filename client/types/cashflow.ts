export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  categoryId: string;
  description: string;
  date: string;
  paymentMethod?: PaymentMethod;
  status: TransactionStatus;
  tags: string[];
  attachments: TransactionAttachment[];
  projectId?: string;
  projectTitle?: string;
  clientId?: string;
  clientName?: string;
  recurringId?: string;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  notes?: string;
}

export type TransactionStatus = 
  | 'pending'
  | 'confirmed'
  | 'cancelled';

export type PaymentMethod = 
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'boleto'
  | 'cash'
  | 'check';

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  subcategories?: TransactionCategory[];
}

export interface TransactionAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CashFlowStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  averageIncome: number;
  averageExpense: number;
  biggestIncome: Transaction | null;
  biggestExpense: Transaction | null;
  monthlyGrowth: number;
  categoryBreakdown: CategoryStats[];
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  color: string;
}

export interface CashFlowFilter {
  dateRange: {
    start: string;
    end: string;
  };
  type?: 'income' | 'expense';
  categories?: string[];
  paymentMethods?: PaymentMethod[];
  status?: TransactionStatus[];
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  projectId?: string;
  clientId?: string;
}

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetPlan {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  categories: BudgetCategory[];
  totalBudget: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  status: 'under' | 'on_track' | 'over';
}

export interface CashFlowReport {
  id: string;
  name: string;
  type: 'income_statement' | 'expense_report' | 'cash_flow' | 'category_analysis';
  period: {
    start: string;
    end: string;
  };
  filters: CashFlowFilter;
  data: any;
  generatedAt: string;
  generatedBy: string;
}
