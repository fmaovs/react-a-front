import { Injectable, signal, computed, inject } from '@angular/core';
import { Client, Case, Policy, Campaign, CaseStatus, AssignmentRule, Associate, CaseNote } from '../models/types';
import { PortfolioService } from './portfolio.service';
import { CaseService } from './case.service';
import { forkJoin } from 'rxjs';

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
  searchQuery = signal<string>('');

  constructor() {
    this.refreshData();
  }

  refreshData() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // We use forkJoin to wait for both clients and obligations to have a consistent view
    forkJoin({
      clientsPage: this.portfolioService.getClients(),
      obligationsPage: this.portfolioService.getObligations()
    }).subscribe({
      next: ({ clientsPage, obligationsPage }) => {
        const clients = clientsPage.content;
        const obligations = obligationsPage.content;

        const mappedAssociates: Associate[] = clients.map(c => {
          const clientObs = obligations.filter(o => o.clientId === c.id);
          const totalBalance = clientObs.reduce((sum, o) => sum + o.currentBalance, 0);
          const maxDays = Math.max(0, ...clientObs.map(o => o.daysPastDue));

          return {
            ...c,
            name: c.fullName,
            document: c.documentNumber,
            risk: c.riskLevel as any,
            balance: totalBalance,
            daysOverdue: maxDays,
            propensity: 'Media'
          };
        });
        this.associates.set(mappedAssociates);
        this.loadCases();
      },
      error: (err) => console.error('Error loading data', err)
    });
  }

  private loadCases() {
    this.caseService.getCases().subscribe({
      next: (page) => {
        this.cases.set(page.content);
      },
      error: (err) => console.error('Error loading cases', err)
    });
  }

  addAssociate(a: Associate) {
    this.refreshData();
  }

  updateCase(id: number, updates: Partial<Case>) {
    this.caseService.updateCase(id, updates).subscribe(() => this.loadCases());
  }

  addNoteToCase(caseId: number, text: string) {
    this.caseService.addNote(caseId, text).subscribe(() => {
      this.loadCases();
    });
  }

  addCampaign(c: Campaign) {}
  updateCampaignProgress(id: string, progress: number) {}
  addCaseStatus(s: CaseStatus) {}
  updateCaseStatus(id: string, updates: Partial<CaseStatus>) {}
  deleteCaseStatus(id: string) {}
  addAssignmentRule(r: AssignmentRule) {}
  updateAssignmentRule(id: string, updates: Partial<AssignmentRule>) {}
  deleteAssignmentRule(id: string) {}
  rebalanceCases() {}
}
