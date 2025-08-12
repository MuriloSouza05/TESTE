export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  module: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  granted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
  clientPortalAccess: boolean;
}

export interface CompanySettings {
  id: string;
  name: string;
  document: string; // CNPJ
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  logo?: string;
  favicon?: string;
  website?: string;
  description?: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface EmailSettings {
  provider: 'smtp' | 'brevo' | 'mailgun' | 'sendgrid';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  encryption?: 'tls' | 'ssl' | 'none';
  templates: {
    estimate: string;
    invoice: string;
    reminder: string;
    welcome: string;
  };
}

export interface SystemSettings {
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: 'BRL' | 'USD' | 'EUR';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  sidebarCollapsed: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  projectDeadlines: {
    enabled: boolean;
    daysBefore: number[];
  };
  invoiceReminders: {
    enabled: boolean;
    daysBefore: number[];
    frequency: 'daily' | 'weekly';
  };
  taskAssignments: boolean;
  systemUpdates: boolean;
  securityAlerts: boolean;
}

export interface LegalSettings {
  inssStatuses: {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
  }[];
  caseCategories: {
    id: string;
    name: string;
    description?: string;
    color: string;
    isActive: boolean;
  }[];
  contractTemplates: {
    id: string;
    name: string;
    content: string;
    variables: string[];
    isDefault: boolean;
  }[];
  defaultDeadlines: {
    caseType: string;
    days: number;
  }[];
}

export interface FinancialSettings {
  bankAccounts: {
    id: string;
    name: string;
    bank: string;
    agency: string;
    account: string;
    type: 'checking' | 'savings';
    isDefault: boolean;
  }[];
  paymentMethods: {
    id: string;
    name: string;
    type: 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'boleto' | 'cash' | 'check';
    isActive: boolean;
    fees: number;
  }[];
  taxRates: {
    serviceType: string;
    rate: number;
    description?: string;
  }[];
  accountingCategories: {
    id: string;
    name: string;
    type: 'income' | 'expense';
    code?: string;
    isActive: boolean;
  }[];
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays?: number;
  };
  sessionSettings: {
    timeoutMinutes: number;
    maxSessions: number;
    requireReauth: boolean;
  };
  twoFactorAuth: {
    enabled: boolean;
    methods: ('sms' | 'email' | 'app')[];
  };
  auditLog: {
    retention: number; // days
    enabledActions: string[];
  };
}

export interface IntegrationSettings {
  brevoApi: {
    enabled: boolean;
    apiKey?: string;
    listId?: string;
  };
  webhooks: {
    id: string;
    name: string;
    url: string;
    events: string[];
    secret?: string;
    isActive: boolean;
  }[];
  backupSettings: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    provider: 'aws' | 'google' | 'local';
    retention: number; // days
  };
}

export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: SettingsSection[];
}

export interface SettingsSection {
  id: string;
  name: string;
  description?: string;
  component: string;
  permissions?: string[];
}
