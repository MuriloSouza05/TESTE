export interface Client {
  id: string;
  name: string;
  organization?: string;
  email: string;
  mobile: string;
  country: string;
  state: string;
  address: string;
  city: string;
  zipCode: string;
  budget: number;
  currency: 'BRL' | 'USD' | 'EUR';
  level?: string;
  tags: string[];
  description?: string;
  image?: string;
  
  // Legal fields
  pis?: string;
  cei?: string;
  professionalTitle?: string;
  maritalStatus?: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  inssStatus?: string;
  amountPaid?: number;
  referredBy?: string;
  registeredBy?: string; // Nome do colaborador que cadastrou o cliente

  // Metadata
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Deal {
  id: string;
  title: string;
  contactName: string;
  organization?: string;
  email: string;
  mobile: string;
  address: string;
  budget: number;
  currency: 'BRL' | 'USD' | 'EUR';
  stage: DealStage;
  tags: string[];
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// SISTEMA SIMPLIFICADO: Apenas 4 estágios conforme solicitado
export type DealStage =
  | 'contacted'     // Em Contato
  | 'proposal'      // Com Proposta
  | 'won'           // Cliente Bem Sucedido
  | 'lost';         // Cliente Perdido

  // REMOVIDOS: 'opportunity', 'advanced', 'general' conforme solicitação

export interface PipelineStage {
  id: DealStage;
  name: string;
  color: string;
  deals: Deal[];
}

export interface ClientLevel {
  id: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
