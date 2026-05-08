import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../core/store/app-store.service';
import { CaseService } from './case.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { Case, CaseNote, CaseStatusBreakdown, EscalationReason, ResolutionType } from '../../models/types';
import {
  LucideAngularModule,
  RefreshCw,
  FileText,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  Lock
} from 'lucide-angular';

interface ActionPanel {
  caseId: number;
  mode: 'note' | 'escalate' | 'resolve' | 'notes';
}

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
  private dashboardService = inject(DashboardService);

  isLoading = signal(false);
  errorMessage = signal('');
  cases = signal<Case[]>([]);
  activePanel = signal<ActionPanel | null>(null);
  caseNotes = signal<Record<number, CaseNote[]>>({});

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  caseStatusGlobal = signal<CaseStatusBreakdown[]>([]);

  // Campos del panel activo
  noteContent = '';
  noteType: 'INTERNAL' | 'CUSTOMER_VISIBLE' = 'INTERNAL';
  escalationReason: EscalationReason = 'MAX_CONTACT_ATTEMPTS';
  resolutionType: ResolutionType = 'PAYMENT_COMPLETE';
  resolutionDetails = '';

  selectedStatusFilter = signal<string>('ALL');

  readonly RefreshCwIcon = RefreshCw;
  readonly FileTextIcon = FileText;
  readonly FilterIcon = Filter;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly Clock3Icon = Clock3;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly BotIcon = Bot;
  readonly UserIcon = User;
  readonly LockIcon = Lock;

  readonly statuses: Case['status'][] = ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
  readonly priorities: Case['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  readonly statusLabels: Record<string, string> = {
    OPEN:        'Abierto',
    IN_PROGRESS: 'En gestión',
    ESCALATED:   'Escalado',
    RESOLVED:    'Resuelto',
    CLOSED:      'Cerrado',
  };

  readonly priorityLabels: Record<string, string> = {
    LOW:    'Baja',
    MEDIUM: 'Media',
    HIGH:   'Alta',
    URGENT: 'Urgente',
  };

  readonly escalationReasons: { value: EscalationReason; label: string }[] = [
    { value: 'MAX_CONTACT_ATTEMPTS', label: 'Máximos intentos de contacto agotados' },
    { value: 'PAYMENT_REFUSED',      label: 'Cliente se negó a pagar' },
    { value: 'HIGH_RISK_SCORE',      label: 'Puntaje de riesgo alto (CRITICO)' },
    { value: 'LEGAL_REQUIRED',       label: 'Mora ≥ 90 días — escalamiento jurídico' },
    { value: 'COMPLEX_SITUATION',    label: 'Situación compleja' },
  ];

  private readonly escalationReasonLabels: Record<string, string> = {
    MAX_CONTACT_ATTEMPTS: 'Máximos intentos de contacto agotados',
    PAYMENT_REFUSED:      'Cliente se negó a pagar',
    HIGH_RISK_SCORE:      'Puntaje de riesgo alto (CRITICO)',
    LEGAL_REQUIRED:       'Mora ≥ 90 días — escalamiento jurídico',
    COMPLEX_SITUATION:    'Situación compleja',
  };

  readonly resolutionTypes: { value: ResolutionType; label: string; obligationEffect: string }[] = [
    { value: 'PAYMENT_COMPLETE',   label: 'Pago total recibido',         obligationEffect: '→ Obligación: PAGADA' },
    { value: 'PAYMENT_AGREEMENT',  label: 'Acuerdo de pago activo',      obligationEffect: '→ Obligación: EN COBRANZA' },
    { value: 'WRITE_OFF',          label: 'Castigo contable',            obligationEffect: '→ Obligación: CASTIGADA' },
    { value: 'DISPUTE_RESOLVED',   label: 'Disputa resuelta',            obligationEffect: '→ Obligación: AL DÍA' },
    { value: 'UNABLE_TO_COLLECT',  label: 'Sin recuperación posible',    obligationEffect: '→ Obligación: sin cambio' },
  ];

  filteredCases = computed(() => {
    const q = this.store.searchQuery().trim().toLowerCase();
    if (!q) return this.cases();
    return this.cases().filter(c =>
      (c.caseNumber?.toLowerCase().includes(q)) ||
      (c.client?.fullName?.toLowerCase().includes(q)) ||
      (c.client?.documentNumber?.toLowerCase().includes(q)) ||
      (c.obligation?.obligationNumber?.toLowerCase().includes(q)) ||
      (c.escalatedAdvisorName?.toLowerCase().includes(q))
    );
  });

  stats = computed(() => {
    const get = (s: string) => this.caseStatusGlobal().find(c => c.status === s)?.count ?? 0;
    return [
      { label: 'Abiertos',           value: get('OPEN').toString(),                      color: 'bg-blue-500' },
      { label: 'En gestión',         value: get('IN_PROGRESS').toString(),               color: 'bg-brand-accent' },
      { label: 'Escalados',          value: get('ESCALATED').toString(),                 color: 'bg-red-500' },
      { label: 'Cerrados/Resueltos', value: (get('CLOSED') + get('RESOLVED')).toString(), color: 'bg-emerald-500' },
    ];
  });

  constructor() {
    this.loadCases(0);
    this.loadGlobalStats();
  }

  loadGlobalStats() {
    this.dashboardService.getCasesByStatus().subscribe({
      next: data => this.caseStatusGlobal.set(data),
      error: () => {}
    });
  }

  loadCases(page: number = 0) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const status = this.selectedStatusFilter();
    const obs = status !== 'ALL'
      ? this.caseService.getCasesPageByStatus(status, page)
      : this.caseService.getCases(page);

    obs.subscribe({
      next: pageData => {
        this.cases.set(pageData.content ?? []);
        this.currentPage.set(pageData.number ?? 0);
        this.totalPages.set(pageData.totalPages ?? 0);
        this.totalElements.set(pageData.totalElements ?? 0);
        this.isLoading.set(false);
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || 'No fue posible cargar los casos');
        this.isLoading.set(false);
      }
    });
  }

  onStatusFilterChange(status: string) {
    this.selectedStatusFilter.set(status);
    this.loadCases(0);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.loadCases(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.loadCases(this.currentPage() - 1);
    }
  }

  changeStatus(caseId: number, status: Case['status']) {
    this.caseService.updateCase(caseId, { status }).subscribe({
      next: () => { this.loadCases(this.currentPage()); this.loadGlobalStats(); },
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible actualizar estado')
    });
  }

  changePriority(caseId: number, priority: Case['priority']) {
    this.caseService.updateCase(caseId, { priority }).subscribe({
      next: () => this.loadCases(this.currentPage()),
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible actualizar prioridad')
    });
  }

  // ── Gestión del panel de acciones ─────────────────────────────────────────

  openPanel(caseId: number, mode: ActionPanel['mode']) {
    const current = this.activePanel();
    if (current?.caseId === caseId && current?.mode === mode) {
      this.closePanel();
      return;
    }
    this.noteContent = '';
    this.resolutionDetails = '';
    this.activePanel.set({ caseId, mode });

    if (mode === 'notes') {
      this.loadNotes(caseId);
    }
  }

  closePanel() {
    this.activePanel.set(null);
  }

  isPanelOpen(caseId: number, mode: ActionPanel['mode']): boolean {
    const p = this.activePanel();
    return p?.caseId === caseId && p?.mode === mode;
  }

  // ── Acciones ──────────────────────────────────────────────────────────────

  submitNote(caseId: number) {
    if (!this.noteContent.trim()) return;
    this.caseService.addNote(caseId, this.noteContent.trim(), this.noteType, 'HUMAN').subscribe({
      next: () => { this.closePanel(); this.loadCases(this.currentPage()); },
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible agregar la nota')
    });
  }

  submitEscalate(caseId: number) {
    this.caseService.escalateCase(caseId, this.escalationReason).subscribe({
      next: () => { this.closePanel(); this.loadCases(this.currentPage()); this.loadGlobalStats(); },
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible escalar el caso')
    });
  }

  submitResolve(caseId: number) {
    this.caseService.resolveCase(caseId, this.resolutionType, this.resolutionDetails).subscribe({
      next: () => { this.closePanel(); this.loadCases(this.currentPage()); this.loadGlobalStats(); },
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible resolver el caso')
    });
  }

  loadNotes(caseId: number) {
    this.caseService.getNotes(caseId).subscribe({
      next: notes => this.caseNotes.update(all => ({ ...all, [caseId]: notes })),
      error: () => {}
    });
  }

  getNotesForCase(caseId: number): CaseNote[] {
    return this.caseNotes()[caseId] ?? [];
  }

  // ── Helpers de presentación ───────────────────────────────────────────────

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
      case 'OPEN':        return '#3b82f6';
      case 'IN_PROGRESS': return '#10989B';
      case 'ESCALATED':   return '#ef4444';
      case 'RESOLVED':    return '#10b981';
      case 'CLOSED':      return '#6b7280';
      default:            return '#64748b';
    }
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  getPriorityLabel(priority: string): string {
    return this.priorityLabels[priority] ?? priority;
  }

  getMoraClass(dpd: number): string {
    if (dpd > 90) return 'critical';
    if (dpd > 30) return 'warning';
    return 'good';
  }

  isFinal(caseItem: Case): boolean {
    return caseItem.status === 'RESOLVED' || caseItem.status === 'CLOSED';
  }

  getEscalationLabel(reason: string): string {
    return this.escalationReasonLabels[reason] ?? reason;
  }

  getResolutionLabel(type: string): string {
    return this.resolutionTypes.find(r => r.value === type)?.label ?? type;
  }
}
