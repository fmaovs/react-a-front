export interface User {
  id?: number;
  username: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'AGENT' | 'AUDITOR';
  token?: string;
}

export interface Client {
  id: number;
  documentNumber: string;
  documentType: string;
  name: string;
  email: string;
  phone: string;
  segment: string;
  riskLevel: string;
  score: number;
}

export interface Obligation {
  id: number;
  clientId: number;
  productType: string;
  principalAmount: number;
  currentBalance: number;
  daysPastDue: number;
  status: string;
}

export interface Batch {
  id: number;
  filename: string;
  uploadDate: string;
  status: 'PENDING' | 'VALIDATED' | 'PROMOTED' | 'FAILED';
  recordCount: number;
}

export interface Case {
  id: number;
  clientId: number;
  status: string;
  priority: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseNote {
  id: number;
  caseId: number;
  content: string;
  author: string;
  createdAt: string;
}

export interface PaymentAgreement {
  id: number;
  caseId: number;
  totalAmount: number;
  installmentsCount: number;
  status: string;
  createdAt: string;
}

export interface Installment {
  id: number;
  agreementId: number;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

export interface AuditLog {
  id: number;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}

// Legacy for compatibility during transition
export interface Associate extends Client {
  document: string;
  risk: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  balance: number;
  daysOverdue: number;
  lastAction?: string;
  propensity: 'Alta' | 'Media' | 'Baja';
}

export interface Policy {
  id: string;
  name: string;
  criteria: string;
  intensity: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  color: string;
}

export interface Campaign {
  id: string;
  name: string;
  segment: string;
  progress: number;
  status: 'En curso' | 'Completada' | 'Pausada';
  channel: 'WhatsApp' | 'SMS' | 'Email' | 'Voz';
}

export interface CaseStatus {
  id: string;
  name: string;
  color: string;
  description: string;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface AssignmentRule {
  id: string;
  name: string;
  minAmount?: number;
  riskLevels?: string[];
  maxFailedAttempts?: number;
  priority: number;
  isActive: boolean;
}
