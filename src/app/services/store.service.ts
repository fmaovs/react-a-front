import { Injectable, signal, computed } from '@angular/core';
import { Associate, Case, Policy, Campaign, CaseStatus, AssignmentRule } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  associates = signal<Associate[]>([]);
  cases = signal<Case[]>([]);
  policies = signal<Policy[]>([]);
  campaigns = signal<Campaign[]>([]);
  caseStatuses = signal<CaseStatus[]>([]);
  assignmentRules = signal<AssignmentRule[]>([]);

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
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

    this.associates.set(mockAssociates);
    this.cases.set(mockCases);
    this.policies.set(mockPolicies);
    this.campaigns.set(mockCampaigns);
    this.caseStatuses.set(mockStatuses);
    this.assignmentRules.set(mockRules);
  }

  addAssociate(a: Associate) {
    this.associates.update(prev => [...prev, a]);
  }

  updateCase(id: string, updates: Partial<Case>) {
    this.cases.update(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }

  addNoteToCase(caseId: string, text: string) {
    const note = { date: new Date().toISOString(), text, author: 'Camilo Cantor' };
    this.cases.update(prev => prev.map(c => c.id === caseId ? { ...c, notes: [note, ...c.notes] } : c));
  }

  addCampaign(c: Campaign) {
    this.campaigns.update(prev => [...prev, c]);
  }

  updateCampaignProgress(id: string, progress: number) {
    this.campaigns.update(prev => prev.map(c => c.id === id ? { ...c, progress } : c));
  }

  addCaseStatus(s: CaseStatus) {
    this.caseStatuses.update(prev => [...prev, s]);
  }

  updateCaseStatus(id: string, updates: Partial<CaseStatus>) {
    this.caseStatuses.update(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  deleteCaseStatus(id: string) {
    this.caseStatuses.update(prev => prev.filter(s => s.id !== id));
  }

  addAssignmentRule(r: AssignmentRule) {
    this.assignmentRules.update(prev => [...prev, r]);
  }

  updateAssignmentRule(id: string, updates: Partial<AssignmentRule>) {
    this.assignmentRules.update(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }

  deleteAssignmentRule(id: string) {
    this.assignmentRules.update(prev => prev.filter(r => r.id !== id));
  }

  rebalanceCases() {
    const agents = ['Agente 01', 'Agente 02', 'Agente 03', 'Agente 04'];
    let agentIndex = 0;

    this.cases.update(prevCases => {
      return prevCases.map(c => {
        const associate = this.associates().find(a => a.id === c.associateId);
        if (!associate) return c;

        const shouldAssign = this.assignmentRules().some(rule => {
          if (!rule.isActive) return false;
          if (rule.minAmount && associate.balance < rule.minAmount) return false;
          if (rule.riskLevels && !rule.riskLevels.includes(associate.risk)) return false;
          return true;
        });

        if (shouldAssign && !c.assignedTo) {
          const assignedAgent = agents[agentIndex % agents.length];
          agentIndex++;
          return { ...c, assignedTo: assignedAgent, status: 'ST-002' };
        }
        return c;
      });
    });
  }
}
