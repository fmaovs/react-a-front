import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { CaseService } from '../../services/case.service';
import { Case } from '../../models/types';
import {
  LucideAngularModule,
  Briefcase,
  Plus,
  RefreshCw,
  FileText,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock3
} from 'lucide-angular';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './cases.html',
  styleUrl: './cases.css'
})
export class CasesComponent {
  store = inject(StoreService);
  private caseService = inject(CaseService);

  isLoading = signal(false);
  errorMessage = signal('');
  cases = signal<Case[]>([]);

  selectedStatusFilter = signal<string>('ALL');
  newCaseClientId = '';
  newCaseDescription = '';

  readonly BriefcaseIcon = Briefcase;
  readonly PlusIcon = Plus;
  readonly RefreshCwIcon = RefreshCw;
  readonly FileTextIcon = FileText;
  readonly FilterIcon = Filter;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly Clock3Icon = Clock3;

  readonly statuses: Case['status'][] = ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
  readonly priorities: Case['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  filteredCases = computed(() => {
    const status = this.selectedStatusFilter();
    if (status === 'ALL') return this.cases();
    return this.cases().filter(c => c.status === status);
  });

  stats = computed(() => {
    const data = this.cases();
    const open = data.filter(c => c.status === 'OPEN').length;
    const inProgress = data.filter(c => c.status === 'IN_PROGRESS').length;
    const escalated = data.filter(c => c.status === 'ESCALATED').length;
    const closed = data.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED').length;
    return [
      { label: 'Abiertos', value: open.toString(), color: 'bg-blue-500' },
      { label: 'En gestion', value: inProgress.toString(), color: 'bg-brand-accent' },
      { label: 'Escalados', value: escalated.toString(), color: 'bg-red-500' },
      { label: 'Cerrados/Resueltos', value: closed.toString(), color: 'bg-emerald-500' }
    ];
  });

  constructor() {
    this.loadCases();
  }

  loadCases() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.caseService.getCases().subscribe({
      next: page => {
        this.cases.set(page.content ?? []);
        this.isLoading.set(false);
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || 'No fue posible cargar los casos');
        this.isLoading.set(false);
      }
    });
  }

  createCase() {
    const clientId = Number(this.newCaseClientId);
    const description = this.newCaseDescription.trim();
    if (!clientId || !description) return;

    this.caseService.createCase(clientId, description).subscribe({
      next: () => {
        this.newCaseClientId = '';
        this.newCaseDescription = '';
        this.loadCases();
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || 'No fue posible crear el caso');
      }
    });
  }

  changeStatus(caseId: number, status: Case['status']) {
    this.caseService.updateCase(caseId, { status }).subscribe({
      next: () => this.loadCases(),
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible actualizar estado')
    });
  }

  changePriority(caseId: number, priority: Case['priority']) {
    this.caseService.updateCase(caseId, { priority }).subscribe({
      next: () => this.loadCases(),
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible actualizar prioridad')
    });
  }

  addNote(caseId: number) {
    const content = prompt('Nota del caso:');
    if (!content?.trim()) return;
    this.caseService.addNote(caseId, content.trim()).subscribe({
      next: () => this.loadCases(),
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible agregar la nota')
    });
  }

  escalate(caseId: number) {
    const reason = prompt('Motivo de escalamiento:');
    if (!reason?.trim()) return;
    this.caseService.escalateCase(caseId, reason.trim()).subscribe({
      next: () => this.loadCases(),
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible escalar el caso')
    });
  }

  resolve(caseId: number) {
    const resolution = prompt('Detalle de resolucion:');
    if (!resolution?.trim()) return;
    this.caseService.resolveCase(caseId, resolution.trim()).subscribe({
      next: () => this.loadCases(),
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible resolver el caso')
    });
  }

  getClientName(caseItem: Case): string {
    if (caseItem.client?.fullName) return caseItem.client.fullName;
    const obligationClient = caseItem.obligation?.client;
    if (obligationClient?.fullName) return obligationClient.fullName;
    const clientId = caseItem.client?.id ?? obligationClient?.id;
    if (!clientId) return 'Cliente no identificado';
    const associate = this.store.associates().find(a => a.id === clientId);
    return associate?.name || `Cliente #${clientId}`;
  }

  getClientDocument(caseItem: Case): string {
    return caseItem.client?.documentNumber || caseItem.obligation?.client?.documentNumber || '-';
  }

  getTotalBalance(caseItem: Case): number {
    return caseItem.obligation?.totalBalance ?? caseItem.obligation?.currentBalance ?? 0;
  }

  getDaysPastDue(caseItem: Case): number {
    return caseItem.obligation?.daysPastDue ?? 0;
  }

  getStatusColor(status: Case['status']): string {
    switch (status) {
      case 'OPEN': return '#3b82f6';
      case 'IN_PROGRESS': return '#10989B';
      case 'ESCALATED': return '#ef4444';
      case 'RESOLVED': return '#10b981';
      case 'CLOSED': return '#6b7280';
      default: return '#64748b';
    }
  }
}
