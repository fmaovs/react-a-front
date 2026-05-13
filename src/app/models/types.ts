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
  temporaryPassword?: string;
  // Compatibility fields
  name?: string;
  role?: any;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  userId: number;
  username: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  fullName: string;
  roleId: number;
}

export interface ResetPasswordResponse {
  message: string;
  temporaryPassword: string;
  username: string;
}

export interface UserUpdateRequest {
  email: string;
  fullName: string;
  roleId?: number;
  status: string;
}

export interface RoleOption {
  id: number;
  name: string;
  description?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface KpiSummary {
  totalPortfolioValue: number;
  totalObligations: number;
  activeObligations: number;
  clientsInDefault: number;
  totalClients: number;
  openCases: number;
  inProgressCases: number;
  escalatedCases: number;
  resolvedCases: number;
  totalCases: number;
  activeAdvisors: number;
  activePaymentAgreements: number;
  batchesThisMonth: number;
  totalRecordsThisMonth: number;
  criticalClientsCount?: number;
}

export interface AgingBucket {
  bucket: string;
  daysFrom: number;
  daysTo: number;
  obligationCount: number;
  totalAmount: number;
  percentageOfPortfolio: number;
}

export interface SegmentBreakdown {
  segment: string;
  obligationCount: number;
  totalAmount: number;
  percentageOfPortfolio: number;
}

export interface CaseStatusBreakdown {
  status: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AdvisorMetrics {
  advisorId: number;
  advisorCode: string;
  advisorName: string;
  totalAssigned: number;
  openCases: number;
  inProgressCases: number;
  escalatedCases: number;
  resolvedCases: number;
  closedCases: number;
}

export interface RiskDistribution {
  riskLevel: string;
  label: string;
  clientCount: number;
  totalDebt: number;
  percentage: number;
}

export interface RecentBatch {
  batchId: number;
  batchNumber: string;
  lote: string;
  fileName: string;
  status: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  createdAt: string;
  processedAt: string;
}

export interface DashboardSummary {
  kpis: KpiSummary;
  portfolioBySegment: SegmentBreakdown[];
  agingAnalysis: AgingBucket[];
  casesByStatus: CaseStatusBreakdown[];
  advisorMetrics: AdvisorMetrics[];
  riskDistribution: RiskDistribution[];
  recentBatches: RecentBatch[];
  generatedAt: string;
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
  mobile?: string;
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
  caseNumber?: string;
  client?: {
    id?: number;
    fullName?: string;
    documentNumber?: string;
  };
  obligation?: {
    id?: number;
    client?: {
      id?: number;
      fullName?: string;
      documentNumber?: string;
    };
    obligationNumber?: string;
    currentBalance?: number;
    totalBalance?: number;
    daysPastDue?: number;
  };
  advisorId?: number;
  batchId?: number;
  assignedTo?: number | string;
  status: 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  contactAttempts?: number;
  aiEscalationCount?: number;
  resolutionType?: 'PAYMENT_COMPLETE' | 'PAYMENT_AGREEMENT' | 'WRITE_OFF' | 'UNABLE_TO_COLLECT' | 'DISPUTE_RESOLVED';
  escalationReason?: 'MAX_CONTACT_ATTEMPTS' | 'PAYMENT_REFUSED' | 'HIGH_RISK_SCORE' | 'LEGAL_REQUIRED' | 'COMPLEX_SITUATION';
  escalatedToAdvisorId?: number;
  escalatedAdvisorName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CaseNote {
  id: number;
  caseEntity?: { id: number };
  noteType?: 'INTERNAL' | 'CUSTOMER_VISIBLE';
  source?: 'AI' | 'HUMAN';
  content: string;
  createdBy?: number;
  createdAt: string;
}

export interface PaymentAgreement {
  id: number;
  agreementNumber: string;
  totalAmount: number;
  finalAmount: number;
  discountAmount?: number;
  numberOfInstallments: number;
  installmentAmount: number;
  paymentGateway?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  paidAmount?: number;
  paidInstallments?: number;
  createdAt: string;
  updatedAt?: string;
  obligation?: {
    id?: number;
    obligationNumber?: string;
    currentBalance?: number;
    status?: string;
    lastPaymentDate?: string;
  };
  client?: {
    id?: number;
    fullName?: string;
    documentNumber?: string;
  };
}

export interface Installment {
  id: number;
  agreementId: number;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount?: number;
  paymentDate?: string;
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
  propensity: 'Alta' | 'Media' | 'Baja' | 'Muy Baja';
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

export interface ZolevTokenResponse {
  respuesta: {
    codigo: number;
    mensaje: string;
  };
  salida: {
    token: string;
  };
}

export interface PaymentLinkRequest {
  IdCliente: number;
  IdTransaccion: number;
  Referencia1: string;
  Valor: number;
  Url: string;
}

export interface PaymentLinkResponse {
  paymentId: string;
  nombreEstado: string;
  estado: number;
  urlLink: string;
}

export interface PaymentLinkUiResult {
  paymentId: string;
  status: string;
  paymentUrl: string;
}

export type EscalationReason =
  | 'MAX_CONTACT_ATTEMPTS'
  | 'PAYMENT_REFUSED'
  | 'HIGH_RISK_SCORE'
  | 'LEGAL_REQUIRED'
  | 'COMPLEX_SITUATION';

export type ResolutionType =
  | 'PAYMENT_COMPLETE'
  | 'PAYMENT_AGREEMENT'
  | 'WRITE_OFF'
  | 'UNABLE_TO_COLLECT'
  | 'DISPUTE_RESOLVED';

// ========== CHART CONFIGURATION TYPES ==========

export interface ChartOption {
  title?: any;
  tooltip?: any;
  legend?: any;
  series?: any[];
  xAxis?: any;
  yAxis?: any;
  grid?: any;
  color?: string[];
  [key: string]: any;
}

export interface PieChartItem {
  value: number;
  name: string;
  percentage?: number;
  icon?: string;
}

export interface BarChartItem {
  name: string;
  value: number;
  extra?: string;
}

export interface AdvisorPerformanceItem extends BarChartItem {
  advisorId: number;
  advisorCode: string;
}

export interface TableColumn {
  label: string;
  key: string;
  width?: string;
  sortable?: boolean;
  formatter?: (value: any) => string;
}

export interface TableData {
  columns: TableColumn[];
  rows: any[];
  pagination?: {
    total: number;
    pageSize: number;
    currentPage: number;
  };
}

// Dashboard Chart Configurations
export interface DashboardChartConfig {
  portfolioPie: ChartOption;
  agingStackedBar: ChartOption;
  riskPie: ChartOption;
  casesDonut: ChartOption;
  advisorBar: ChartOption;
}
