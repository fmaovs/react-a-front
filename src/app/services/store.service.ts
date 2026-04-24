import { Injectable, signal, computed, inject } from '@angular/core';
import { Client, Case, Policy, Campaign, CaseStatus, AssignmentRule, Associate, CaseNote } from '../models/types';
import { PortfolioService } from './portfolio.service';
import { CaseService } from './case.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private portfolioService = inject(PortfolioService);
  private caseService = inject(CaseService);

  associates = signal<Associate[]>([]);
  cases = signal<Case[]>([]);
  policies = signal<Policy[]>([]);
  campaigns = signal<Campaign[]>([]);
  caseStatuses = signal<CaseStatus[]>([]);
  assignmentRules = signal<AssignmentRule[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.portfolioService.getClients().subscribe({
      next: (clients) => {
        const mappedAssociates: Associate[] = clients.map(c => ({
          ...c,
          document: c.documentNumber,
          risk: c.riskLevel as any,
          balance: 0, // Will be updated by obligations
          daysOverdue: 0,
          propensity: 'Media' // Default for mapping
        }));
        this.associates.set(mappedAssociates);
        this.loadObligations();
      },
      error: () => this.initializeMockData()
    });
  }

  private loadObligations() {
    this.portfolioService.getObligations().subscribe(obs => {
      this.associates.update(prev => prev.map(a => {
        const clientObs = obs.filter(o => o.clientId === a.id);
        const totalBalance = clientObs.reduce((sum, o) => sum + o.currentBalance, 0);
        const maxDays = Math.max(0, ...clientObs.map(o => o.daysPastDue));
        return { ...a, balance: totalBalance, daysOverdue: maxDays };
      }));
      this.loadCases();
    });
  }

  private loadCases() {
    this.caseService.getCases().subscribe(cases => {
      this.cases.set(cases);
    });
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
      { id: 1, name: 'Juan Pérez', documentNumber: '10203040', documentType: 'CC', document: '10203040', email: 'juan@example.com', phone: '3001234567', segment: 'Preventiva', score: 850, riskLevel: 'Bajo', risk: 'Bajo', balance: 1500000, daysOverdue: -5, propensity: 'Alta' },
      { id: 2, name: 'Maria Garcia', documentNumber: '50607080', documentType: 'CC', document: '50607080', email: 'maria@example.com', phone: '3109876543', segment: 'Administrativa', score: 420, riskLevel: 'Alto', risk: 'Alto', balance: 4250000, daysOverdue: 15, propensity: 'Media' },
      { id: 3, name: 'Carlos Ruiz', documentNumber: '90102030', documentType: 'CC', document: '90102030', email: 'carlos@example.com', phone: '3201112233', segment: 'Temprana', score: 680, riskLevel: 'Medio', risk: 'Medio', balance: 6800000, daysOverdue: 45, propensity: 'Alta' },
      { id: 4, name: 'Ana Lopez', documentNumber: '40506070', documentType: 'CC', document: '40506070', email: 'ana@example.com', phone: '3154445566', segment: 'Prejurídica', score: 150, riskLevel: 'Crítico', risk: 'Crítico', balance: 12500000, daysOverdue: 95, propensity: 'Baja' },
    ];

    const mockCases: Case[] = mockAssociates.map(a => ({
      id: a.id,
      clientId: a.id,
      status: a.daysOverdue > 90 ? 'ST-005' : a.daysOverdue > 0 ? 'ST-002' : 'ST-001',
      priority: a.risk === 'Crítico' ? 'Crítica' : a.risk === 'Alto' ? 'Alta' : a.risk === 'Medio' ? 'Media' : 'Baja',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

  updateCase(id: number, updates: Partial<Case>) {
    this.cases.update(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }

  addNoteToCase(caseId: number, text: string) {
    this.caseService.addNote(caseId, text).subscribe(note => {
      // In a real app we might want to update the local signal,
      // but for simplicity we reload or rely on backend sync
      this.loadCases();
    });
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
        const associate = this.associates().find(a => a.id === c.clientId);
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
