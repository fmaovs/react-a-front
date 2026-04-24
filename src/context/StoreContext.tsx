import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Associate {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  segment: string;
  score: number;
  propensity: 'Alta' | 'Media' | 'Baja';
  risk: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  balance: number;
  daysOverdue: number;
  lastAction?: string;
}

export interface CaseStatus {
  id: string;
  name: string;
  color: string;
  description: string;
  isInitial?: boolean;
  isFinal?: boolean;
}

export interface Case {
  id: string;
  associateId: string;
  status: string; // ID of the CaseStatus
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  assignedTo?: string;
  notes: { date: string; text: string; author: string }[];
  agreements: { date: string; amount: number; installments: number }[];
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

export interface AssignmentRule {
  id: string;
  name: string;
  minAmount?: number;
  riskLevels?: string[];
  maxFailedAttempts?: number;
  priority: number;
  isActive: boolean;
}

export interface StoreContextType {
  associates: Associate[];
  cases: Case[];
  policies: Policy[];
  campaigns: Campaign[];
  caseStatuses: CaseStatus[];
  assignmentRules: AssignmentRule[];
  addAssociate: (a: Associate) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  addNoteToCase: (caseId: string, note: string) => void;
  addCampaign: (c: Campaign) => void;
  updateCampaignProgress: (id: string, progress: number) => void;
  addCaseStatus: (s: CaseStatus) => void;
  updateCaseStatus: (id: string, updates: Partial<CaseStatus>) => void;
  deleteCaseStatus: (id: string) => void;
  addAssignmentRule: (r: AssignmentRule) => void;
  updateAssignmentRule: (id: string, updates: Partial<AssignmentRule>) => void;
  deleteAssignmentRule: (id: string) => void;
  rebalanceCases: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [caseStatuses, setCaseStatuses] = useState<CaseStatus[]>([]);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>([]);

  // Initialize with mock data
  useEffect(() => {
    const mockRules: AssignmentRule[] = [
      { id: 'R-001', name: 'Mora Crítica > 10M', minAmount: 10000000, riskLevels: ['Crítico'], isActive: true, priority: 1 },
      { id: 'R-002', name: 'Intentos Fallidos > 3', maxFailedAttempts: 3, isActive: true, priority: 2 },
    ];
    const mockStatuses: CaseStatus[] = [
      { id: 'ST-001', name: 'Nuevo', color: '#3b82f6', description: 'Caso recién ingresado', isInitial: true },
      { id: 'ST-002', name: 'En Gestión', color: '#10b981', description: 'En proceso de cobro' },
      { id: 'ST-003', name: 'Promesa Pago', color: '#10989B', description: 'Acuerdo formalizado' },
      { id: 'ST-004', name: 'Ilocalizado/Sin respuesta', color: '#f59e0b', description: 'Sin contacto exitoso' },
      { id: 'ST-005', name: 'Prejurídico', color: '#ef4444', description: 'Escalado a legal' },
      { id: 'ST-006', name: 'Cerrado', color: '#64748b', description: 'Gestión finalizada', isFinal: true },
    ];

    const mockAssociates: Associate[] = [
      { id: '1', name: 'Juan Pérez', document: '10203040', email: 'juan@example.com', phone: '3001234567', segment: 'Preventiva', score: 850, propensity: 'Alta', risk: 'Bajo', balance: 1500000, daysOverdue: -5 },
      { id: '2', name: 'Maria Garcia', document: '50607080', email: 'maria@example.com', phone: '3109876543', segment: 'Administrativa', score: 420, propensity: 'Media', risk: 'Alto', balance: 4250000, daysOverdue: 15 },
      { id: '3', name: 'Carlos Ruiz', document: '90102030', email: 'carlos@example.com', phone: '3201112233', segment: 'Temprana', score: 680, propensity: 'Alta', risk: 'Medio', balance: 6800000, daysOverdue: 45 },
      { id: '4', name: 'Ana Lopez', document: '40506070', email: 'ana@example.com', phone: '3154445566', segment: 'Prejurídica', score: 150, propensity: 'Baja', risk: 'Crítico', balance: 12500000, daysOverdue: 95 },
    ];

    const mockCases: Case[] = mockAssociates.map(a => ({
      id: `CS-${a.id}`,
      associateId: a.id,
      status: a.daysOverdue > 90 ? 'ST-005' : a.daysOverdue > 0 ? 'ST-002' : 'ST-001',
      priority: a.risk === 'Crítico' ? 'Crítica' : a.risk === 'Alto' ? 'Alta' : a.risk === 'Medio' ? 'Media' : 'Baja',
      notes: [],
      agreements: []
    }));

    const mockPolicies: Policy[] = [
      { id: 'SEG-001', name: 'Preventiva', criteria: 'Mora < 0 días', intensity: 'Baja', color: 'bg-emerald-500' },
      { id: 'SEG-002', name: 'Administrativa', criteria: 'Mora 1 - 30 días', intensity: 'Media', color: 'bg-blue-500' },
      { id: 'SEG-003', name: 'Temprana', criteria: 'Mora 31 - 60 días', intensity: 'Alta', color: 'bg-amber-500' },
      { id: 'SEG-004', name: 'Prejurídica', criteria: 'Mora > 90 días', intensity: 'Crítica', color: 'bg-red-500' },
    ];

    const mockCampaigns: Campaign[] = [
      { id: 'C-001', name: 'Recordatorio Preventivo Q1', segment: 'Preventiva', progress: 85, status: 'En curso', channel: 'WhatsApp' },
      { id: 'C-002', name: 'Recuperación Administrativa', segment: 'Administrativa', progress: 42, status: 'En curso', channel: 'SMS' },
    ];

    setAssociates(mockAssociates);
    setCases(mockCases);
    setPolicies(mockPolicies);
    setCampaigns(mockCampaigns);
    setCaseStatuses(mockStatuses);
    setAssignmentRules(mockRules);
  }, []);

  const addAssociate = (a: Associate) => setAssociates(prev => [...prev, a]);
  
  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addNoteToCase = (caseId: string, text: string) => {
    const note = { date: new Date().toISOString(), text, author: 'Camilo Cantor' };
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, notes: [note, ...c.notes] } : c));
  };

  const addCampaign = (c: Campaign) => setCampaigns(prev => [...prev, c]);

  const updateCampaignProgress = (id: string, progress: number) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, progress } : c));
  };

  const addCaseStatus = (s: CaseStatus) => setCaseStatuses(prev => [...prev, s]);
  const updateCaseStatus = (id: string, updates: Partial<CaseStatus>) => {
    setCaseStatuses(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteCaseStatus = (id: string) => setCaseStatuses(prev => prev.filter(s => s.id !== id));

  const addAssignmentRule = (r: AssignmentRule) => setAssignmentRules(prev => [...prev, r]);
  const updateAssignmentRule = (id: string, updates: Partial<AssignmentRule>) => {
    setAssignmentRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };
  const deleteAssignmentRule = (id: string) => setAssignmentRules(prev => prev.filter(r => r.id !== id));

  const rebalanceCases = () => {
    // Mock agents (in a real app, these would come from the users state)
    const agents = ['Agente 01', 'Agente 02', 'Agente 03', 'Agente 04'];
    
    setCases(prevCases => {
      const updatedCases = [...prevCases];
      let agentIndex = 0;

      return updatedCases.map(c => {
        const associate = associates.find(a => a.id === c.associateId);
        if (!associate) return c;

        // Check rules
        const shouldAssign = assignmentRules.some(rule => {
          if (!rule.isActive) return false;
          
          if (rule.minAmount && associate.balance < rule.minAmount) return false;
          if (rule.riskLevels && !rule.riskLevels.includes(associate.risk)) return false;
          // For failed attempts, we'd need a field in Case, let's assume 0 for now
          // if (rule.maxFailedAttempts && (c.failedAttempts || 0) < rule.maxFailedAttempts) return false;
          
          return true;
        });

        if (shouldAssign && !c.assignedTo) {
          const assignedAgent = agents[agentIndex % agents.length];
          agentIndex++;
          return { ...c, assignedTo: assignedAgent, status: 'ST-002' }; // Move to 'En Gestión'
        }

        return c;
      });
    });
  };

  return (
    <StoreContext.Provider value={{ 
      associates, cases, policies, campaigns, caseStatuses, assignmentRules,
      addAssociate, updateCase, addNoteToCase, addCampaign, updateCampaignProgress,
      addCaseStatus, updateCaseStatus, deleteCaseStatus,
      addAssignmentRule, updateAssignmentRule, deleteAssignmentRule, rebalanceCases
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
