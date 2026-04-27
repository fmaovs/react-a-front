import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { CaseService } from '../../services/case.service';
import { Case, CaseNote } from '../../models/types';
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
  User
} from 'lucide-angular';

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

  isLoading = signal(false);
  errorMessage = signal('');
  cases = signal<Case[]>([]);
  activePanel = signal<ActionPanel | null>(null);
  caseNotes = signal<Record<number, CaseNote[]>>({});

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

  readonly statuses: Case['status'][] = ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
  readonly priorities: Case['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  readonly escalationReasons: { value: EscalationReason; label: string }[] = [
    { value: 'MAX_CONTACT_ATTEMPTS', label: 'Máximos intentos de contacto agotados' },
    { value: 'PAYMENT_REFUSED',      label: 'Cliente se negó a pagar' },
    { value: 'HIGH_RISK_SCORE',      label: 'Puntaje de riesgo alto' },
    { value: 'LEGAL_REQUIRED',       label: 'Requiere gestión legal' },
    { value: 'COMPLEX_SITUATION',    label: 'Situación compleja' },
  ];

  readonly resolutionTypes: { value: ResolutionType; label: string; obligationEffect: string }[] = [
    { value: 'PAYMENT_COMPLETE',   label: 'Pago total recibido',         obligationEffect: '→ Obligación: PAGADA' },
    { value: 'PAYMENT_AGREEMENT',  label: 'Acuerdo de pago activo',      obligationEffect: '→ Obligación: EN COBRANZA' },
    { value: 'WRITE_OFF',          label: 'Castigo contable',            obligationEffect: '→ Obligación: CASTIGADA' },
    { value: 'DISPUTE_RESOLVED',   label: 'Disputa resuelta',            obligationEffect: '→ Obligación: AL DÍA' },
    { value: 'UNABLE_TO_COLLECT',  label: 'Sin recuperación posible',    obligationEffect: '→ Obligación: sin cambio' },
  ];

  filteredCases = computed(() => {
    const status = this.selectedStatusFilter();
    const q = this.store.searchQuery().trim().toLowerCase();

    let result = this.cases();

    if (status !== 'ALL') {
      result = result.filter(c => c.status === status);
    }

    if (q) {
      result = result.filter(c =>
        (c.caseNumber?.toLowerCase().includes(q)) ||
        (c.client?.fullName?.toLowerCase().includes(q)) ||
        (c.client?.documentNumber?.toLowerCase().includes(q)) ||
        (c.obligation?.obligationNumber?.toLowerCase().includes(q)) ||
        (c.escalatedAdvisorName?.toLowerCase().includes(q))
      );
    }

    return result;
  });

  stats = computed(() => {
    const data = this.cases();
    return [
      { label: 'Abiertos',           value: data.filter(c => c.status === 'OPEN').length.toString(),                         color: 'bg-blue-500' },
      { label: 'En gestión',         value: data.filter(c => c.status === 'IN_PROGRESS').length.toString(),                  color: 'bg-brand-accent' },
      { label: 'Escalados',          value: data.filter(c => c.status === 'ESCALATED').length.toString(),                    color: 'bg-red-500' },
      { label: 'Cerrados/Resueltos', value: data.filter(c => c.status === 'CLOSED' || c.status === 'RESOLVED').length.toString(), color: 'bg-emerald-500' },
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
      next: () => { this.closePanel(); this.loadCases(); },
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible agregar la nota')
    });
  }

  submitEscalate(caseId: number) {
    this.caseService.escalateCase(caseId, this.escalationReason).subscribe({
      next: () => { this.closePanel(); this.loadCases(); },
      error: err => this.errorMessage.set(err?.error?.message || 'No fue posible escalar el caso')
    });
  }

  submitResolve(caseId: number) {
    this.caseService.resolveCase(caseId, this.resolutionType, this.resolutionDetails).subscribe({
      next: () => { this.closePanel(); this.loadCases(); },
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

  getEscalationLabel(reason: string): string {
    return this.escalationReasons.find(r => r.value === reason)?.label ?? reason;
  }

  getResolutionLabel(type: string): string {
    return this.resolutionTypes.find(r => r.value === type)?.label ?? type;
  }
}
