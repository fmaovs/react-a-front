import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StoreService } from '../../services/store.service';
import { UserService } from '../../services/user.service';
import { ScoringConfigService, ScoringModelConfig, RiskThreshold, ChannelRule, SegmentRule, InstallmentRule, WorkflowConfig } from '../../services/scoring-config.service';
import { User, UserCreateRequest, UserUpdateRequest } from '../../models/types';
import { UserModalComponent } from '../../shared/components/user-modal/user-modal';
import {
  LucideAngularModule,
  Settings2, ShieldAlert, FileCode, Clock, Save, Plus, Trash2, Info,
  CheckCircle2, AlertTriangle, Users, Lock, Shield, Mail, UserPlus,
  Briefcase, Sliders, GitBranch, RefreshCw
} from 'lucide-angular';

type TabId = 'scoring' | 'segmentation' | 'workflow' | 'users' | 'file-structure';

interface Tab { id: TabId; label: string; icon: any; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MatDialogModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  store = inject(StoreService);
  private userService = inject(UserService);
  private scoringConfigService = inject(ScoringConfigService);
  private dialog = inject(MatDialog);

  activeTab = signal<TabId>('scoring');
  isSaving = signal(false);
  saveSuccess = signal('');
  saveError = signal('');

  readonly Settings2Icon = Settings2;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly FileCodeIcon = FileCode;
  readonly ClockIcon = Clock;
  readonly SaveIcon = Save;
  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly InfoIcon = Info;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly UsersIcon = Users;
  readonly LockIcon = Lock;
  readonly ShieldIcon = Shield;
  readonly MailIcon = Mail;
  readonly UserPlusIcon = UserPlus;
  readonly BriefcaseIcon = Briefcase;
  readonly SlidersIcon = Sliders;
  readonly GitBranchIcon = GitBranch;
  readonly RefreshCwIcon = RefreshCw;

  tabs: Tab[] = [
    { id: 'scoring',       label: 'Scoring IA',         icon: this.ShieldAlertIcon },
    { id: 'segmentation',  label: 'Segmentación & Cuotas', icon: this.GitBranchIcon },
    { id: 'workflow',      label: 'Flujo de Cobranza',   icon: this.SlidersIcon },
    { id: 'file-structure',label: 'Estructura de Archivo', icon: this.FileCodeIcon },
    { id: 'users',         label: 'Usuarios',            icon: this.UsersIcon },
  ];

  // ── Scoring model state ───────────────────────────────────────────────────
  activeModel = signal<ScoringModelConfig | null>(null);
  thresholds = signal<RiskThreshold[]>([]);
  channels = signal<ChannelRule[]>([]);

  weightsTotal = computed(() => {
    const m = this.activeModel();
    if (!m) return 0;
    return +((m.weightPaymentHistory + m.weightDaysPastDue +
              m.weightDefaultFrequency + m.weightSeniority) * 100).toFixed(1);
  });

  // ── Segmentation state ────────────────────────────────────────────────────
  segmentRules = signal<SegmentRule[]>([]);
  installmentRules = signal<InstallmentRule[]>([]);

  readonly SEGMENTS = ['PREVENTIVA', 'ADMINISTRATIVA', 'PREJUDICIAL', 'JURIDICA'];
  readonly PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  readonly CHANNELS = ['EMAIL', 'WHATSAPP', 'SMS', 'VOZ'];
  readonly RISK_LEVELS = ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'];

  // ── Workflow config state ─────────────────────────────────────────────────
  workflowConfig = signal<WorkflowConfig | null>(null);

  // ── Users state ───────────────────────────────────────────────────────────
  realUsers = signal<User[]>([]);

  // ── File structure ────────────────────────────────────────────────────────
  fields = signal([
    { pos: '001-020', name: 'document_type',    type: 'Alfanumérico', req: 'Sí', desc: 'Tipo de documento (CC, NIT, CE)' },
    { pos: '021-050', name: 'document_number',  type: 'Alfanumérico', req: 'Sí', desc: 'Número de documento del cliente' },
    { pos: '051-150', name: 'client_name',       type: 'Alfanumérico', req: 'Sí', desc: 'Nombre completo del cliente' },
    { pos: '151-200', name: 'obligation_id',     type: 'Alfanumérico', req: 'Sí', desc: 'Número de obligación único' },
    { pos: '201-220', name: 'obligation_amount', type: 'Decimal',      req: 'Sí', desc: 'Valor total de la obligación' },
    { pos: '221-230', name: 'due_date',          type: 'Fecha',        req: 'Sí', desc: 'Fecha de vencimiento (YYYY-MM-DD)' },
    { pos: '231-234', name: 'days_past_due',     type: 'Entero',       req: 'Sí', desc: 'Días de mora al momento del cargue' },
    { pos: '235-237', name: 'currency',          type: 'Alfanumérico', req: 'No', desc: 'Moneda (default: COP)' },
  ]);

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loadScoringConfig();
    this.loadSegmentation();
    this.loadWorkflow();
    this.loadUsers();
  }

  loadScoringConfig() {
    this.scoringConfigService.getActiveModel().subscribe({
      next: model => {
        this.activeModel.set(model);
        this.scoringConfigService.getThresholds(model.modelVersion).subscribe(t => this.thresholds.set(t));
        this.scoringConfigService.getChannels(model.modelVersion).subscribe(c => this.channels.set(c));
      }
    });
  }

  loadSegmentation() {
    this.scoringConfigService.getActiveSegmentRules().subscribe(r => this.segmentRules.set(r));
    this.scoringConfigService.getActiveInstallmentRules().subscribe(r => this.installmentRules.set(r));
  }

  loadWorkflow() {
    this.scoringConfigService.getActiveWorkflowConfig().subscribe(cfg => this.workflowConfig.set(cfg));
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => this.realUsers.set(users));
  }

  // ── Guardar scoring ───────────────────────────────────────────────────────

  saveWeights() {
    const model = this.activeModel();
    if (!model) return;
    this.setSaving();
    this.scoringConfigService.updateModelWeights(model).subscribe({
      next: m => { this.activeModel.set(m); this.setSuccess('Pesos del modelo guardados'); },
      error: () => this.setError('Error al guardar pesos — verifique que sumen 100%')
    });
  }

  saveThresholds() {
    const model = this.activeModel();
    if (!model) return;
    this.setSaving();
    this.scoringConfigService.updateThresholds(model.modelVersion, this.thresholds()).subscribe({
      next: t => { this.thresholds.set(t); this.setSuccess('Umbrales de riesgo guardados'); },
      error: () => this.setError('Error al guardar umbrales')
    });
  }

  saveChannels() {
    const model = this.activeModel();
    if (!model) return;
    this.setSaving();
    this.scoringConfigService.updateChannels(model.modelVersion, this.channels()).subscribe({
      next: c => { this.channels.set(c); this.setSuccess('Canales de contacto guardados'); },
      error: () => this.setError('Error al guardar canales')
    });
  }

  // ── Guardar segmentación ──────────────────────────────────────────────────

  saveSegmentRules() {
    const model = this.activeModel();
    if (!model) return;
    this.setSaving();
    this.scoringConfigService.updateSegmentRules(model.modelVersion, this.segmentRules()).subscribe({
      next: r => { this.segmentRules.set(r); this.setSuccess('Reglas de segmentación guardadas'); },
      error: () => this.setError('Error al guardar segmentación')
    });
  }

  saveInstallmentRules() {
    const model = this.activeModel();
    if (!model) return;
    this.setSaving();
    this.scoringConfigService.updateInstallmentRules(model.modelVersion, this.installmentRules()).subscribe({
      next: r => { this.installmentRules.set(r); this.setSuccess('Reglas de cuotas guardadas'); },
      error: () => this.setError('Error al guardar cuotas')
    });
  }

  // ── Guardar workflow ──────────────────────────────────────────────────────

  saveWorkflow() {
    const cfg = this.workflowConfig();
    if (!cfg) return;
    this.setSaving();
    this.scoringConfigService.updateWorkflowConfig(cfg).subscribe({
      next: c => { this.workflowConfig.set(c); this.setSuccess('Configuración de flujo guardada'); },
      error: () => this.setError('Error al guardar configuración de flujo')
    });
  }

  // ── Usuarios ──────────────────────────────────────────────────────────────

  addUser() {
    const dialogRef = this.dialog.open(UserModalComponent, { width: '500px', data: {} });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const req: UserCreateRequest = {
          username: result.username, email: result.email,
          fullName: result.fullName, password: result.password, roleId: result.roleId
        };
        this.userService.createUser(req).subscribe(() => this.loadUsers());
      }
    });
  }

  editUser(user: User) {
    const dialogRef = this.dialog.open(UserModalComponent, { width: '500px', data: { user } });
    dialogRef.afterClosed().subscribe(result => {
      if (result && user.id) {
        const req: UserUpdateRequest = {
          email: result.email, fullName: result.fullName,
          roleId: result.roleId, status: result.status
        };
        this.userService.updateUser(user.id, req).subscribe(() => this.loadUsers());
      }
    });
  }

  removeUser(id: number) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  updateWeight(field: keyof ScoringModelConfig, value: number) {
    this.activeModel.update(m => m ? { ...m, [field]: value / 100 } : m);
  }

  getWeight(field: keyof ScoringModelConfig): number {
    const m = this.activeModel();
    return m ? Math.round((m[field] as number) * 100) : 0;
  }

  private setSaving() { this.isSaving.set(true); this.saveSuccess.set(''); this.saveError.set(''); }
  private setSuccess(msg: string) { this.isSaving.set(false); this.saveSuccess.set(msg); setTimeout(() => this.saveSuccess.set(''), 3000); }
  private setError(msg: string) { this.isSaving.set(false); this.saveError.set(msg); setTimeout(() => this.saveError.set(''), 5000); }
}
