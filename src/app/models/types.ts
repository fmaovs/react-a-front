export interface User {
  id?: number;
  username: string;
  fullName: string;
  email: string;
  roleName?: string;
  status: string;
  createdAt?: string;
  lastLogin?: string;
  token?: string;
  // Compatibility fields
  name?: string;
  role?: any;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  roleId: number;
}

export interface UserUpdateRequest {
  email: string;
  fullName: string;
  roleId?: number;
  status: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DashboardMetrics {
  totalPortfolioValue: number;
  activeCases: number;
  recoveryRate: number;
  dailyCollections: number;
  riskDistribution: { [key: string]: number };
  monthlyRecovery: { [key: string]: number };
}

export interface Client {
  id: number;
  documentNumber: string;
  documentType: string;
  fullName: string; // Updated from name to match ClientDTO
  email: string;
  phone: string;
  segment: string;
  riskLevel: string;
  creditScore: number; // Updated from score to match ClientDTO
}

export interface Obligation {
  id: number;
  clientId: number;
  obligationNumber: string;
  principalAmount: number;
  currentBalance: number;
  daysPastDue: number;
  status: string;
}

export interface Batch {
  id: number;
  fileName: string; // Updated from filename to match Batch schema
  uploadDate?: string;
  uploadedAt?: string;
  createdAt?: string;
  status: 'STAGING' | 'UPLOADED' | 'VALIDATING' | 'VALIDATED' | 'PROCESSING' | 'PROMOTED' | 'COMPLETED' | 'FAILED';
  totalRecords: number; // Updated from recordCount
}

export interface Case {
  id: number;
  clientId: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
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
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
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
  name: string; // Keep for UI
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
