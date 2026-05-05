import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StoreService } from '../../core/store/app-store.service';
import { UserService } from './user.service';
import { ScoringConfigService, ScoringModelConfig, RiskThreshold, IntensityPolicy, SegmentRule, WorkflowConfig, ScoringVariable, VariableRange } from './scoring-config.service';
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
    { id: 'segmentation',  label: 'Segmentación', icon: this.GitBranchIcon },
    { id: 'workflow',      label: 'Flujo de Cobranza',   icon: this.SlidersIcon },
    { id: 'file-structure',label: 'Estructura de Archivo', icon: this.FileCodeIcon },
    { id: 'users',         label: 'Usuarios',            icon: this.UsersIcon },
  ];

  // ── Scoring model state ───────────────────────────────────────────────────
  activeModel = signal<ScoringModelConfig | null>(null);
  thresholds = signal<RiskThreshold[]>([]);
  intensityPolicies = signal<IntensityPolicy[]>([]);
  variables = signal<ScoringVariable[]>([]);
  selectedVariableKey = signal('');
  variableRanges = signal<VariableRange[]>([]);

  weightsTotal = computed(() => {
    const m = this.activeModel();
    if (!m) return 0;
    return +((m.weightPaymentHistory + m.weightDaysPastDue +
              m.weightDefaultFrequency + m.weightSeniority) * 100).toFixed(1);
  });

  variableWeightsTotal = computed(() => {
    const vars = this.variables();
    const activeTotal = vars
      .filter(v => v.active)
      .reduce((acc, v) => acc + v.weight, 0);

    return +(activeTotal * 100).toFixed(1);
  });

  // ── Segmentation state ────────────────────────────────────────────────────
  segmentRules = signal<SegmentRule[]>([]);

  readonly SEGMENTS = ['PREVENTIVA', 'ADMINISTRATIVA', 'PREJUDICIAL', 'JURIDICA'];
  readonly PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
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
        this.scoringConfigService.getThresholds(model.modelVersion).subscribe({
          next: t => this.thresholds.set(t),
          error: () => this.thresholds.set([])
        });
        this.scoringConfigService.getIntensityPolicies(model.modelVersion).subscribe({
          next: p => this.intensityPolicies.set(p),
          error: () => this.intensityPolicies.set([])
        });
        this.scoringConfigService.getVariables(model.modelVersion).subscribe({
          next: vars => {
            this.variables.set(vars);
            const current = this.selectedVariableKey();
            const selected = vars.find(v => v.variableKey === current)?.variableKey ?? vars[0]?.variableKey ?? '';
            this.selectedVariableKey.set(selected);

            if (selected) {
              this.loadVariableRanges(model.modelVersion, selected);
            } else {
              this.variableRanges.set([]);
            }
          },
          error: () => {
            this.variables.set([]);
            this.selectedVariableKey.set('');
            this.variableRanges.set([]);
          }
        });
      }
    });
  }

  loadSegmentation() {
    this.scoringConfigService.getActiveSegmentRules().subscribe({
      next: r => this.segmentRules.set(r),
      error: () => this.segmentRules.set([])
    });
  }

  loadWorkflow() {
    this.scoringConfigService.getActiveWorkflowConfig().subscribe({
      next: cfg => this.workflowConfig.set(cfg),
      error: () => this.workflowConfig.set(null)
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: users => this.realUsers.set(users),
      error: () => this.realUsers.set([])
    });
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

  saveIntensityPolicies() {
    const model = this.activeModel();
    if (!model) return;
    this.setSaving();
    this.scoringConfigService.updateIntensityPolicies(model.modelVersion, this.intensityPolicies()).subscribe({
      next: p => { this.intensityPolicies.set(p); this.setSuccess('Políticas de intensidad guardadas'); },
      error: () => this.setError('Error al guardar políticas de intensidad')
    });
  }

  saveVariables() {
    const model = this.activeModel();
    if (!model) return;

    if (this.variableWeightsTotal() !== 100) {
      this.setError('La suma de pesos de variables activas debe ser 100%');
      return;
    }

    this.setSaving();
    this.scoringConfigService.updateVariables(model.modelVersion, this.variables()).subscribe({
      next: vars => { this.variables.set(vars); this.setSuccess('Variables de scoring guardadas'); },
      error: () => this.setError('Error al guardar variables de scoring')
    });
  }

  onVariableKeyChange(key: string) {
    this.selectedVariableKey.set(key);
    const model = this.activeModel();
    if (!model || !key) {
      this.variableRanges.set([]);
      return;
    }

    this.loadVariableRanges(model.modelVersion, key);
  }

  saveVariableRanges() {
    const model = this.activeModel();
    const key = this.selectedVariableKey();
    if (!model || !key) return;

    const validationError = this.validateRanges(this.variableRanges());
    if (validationError) {
      this.setError(validationError);
      return;
    }

    this.setSaving();
    this.scoringConfigService.updateVariableRanges(model.modelVersion, key, this.variableRanges()).subscribe({
      next: ranges => { this.variableRanges.set(ranges); this.setSuccess(`Rangos de ${key} guardados`); },
      error: () => this.setError('Error al guardar rangos de variable')
    });
  }

  addVariableRange() {
    this.variableRanges.update(ranges => [
      ...ranges,
      { minValue: 0, maxValue: null, baseScore: 500 }
    ]);
  }

  removeVariableRange(index: number) {
    this.variableRanges.update(ranges => ranges.filter((_, i) => i !== index));
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

  updateVariableWeight(index: number, value: number) {
    const normalized = Math.max(0, Math.min(100, value));
    this.variables.update(vars => vars.map((v, i) => i === index ? { ...v, weight: normalized / 100 } : v));
  }

  getVariableWeight(index: number): number {
    return Math.round((this.variables()[index]?.weight ?? 0) * 100);
  }

  getWeight(field: keyof ScoringModelConfig): number {
    const m = this.activeModel();
    return m ? Math.round((m[field] as number) * 100) : 0;
  }

  private loadVariableRanges(version: string, key: string) {
    this.scoringConfigService.getVariableRanges(version, key).subscribe({
      next: ranges => {
        const sorted = [...ranges].sort((a, b) => a.minValue - b.minValue);
        this.variableRanges.set(sorted);
      },
      error: () => this.variableRanges.set([])
    });
  }

  private validateRanges(ranges: VariableRange[]): string | null {
    if (!ranges.length) {
      return 'Debe definir al menos un rango para la variable seleccionada';
    }

    const sorted = [...ranges].sort((a, b) => a.minValue - b.minValue);

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      if (current.maxValue !== null && current.maxValue < current.minValue) {
        return 'Cada rango debe tener maxValue mayor o igual a minValue';
      }

      if (current.maxValue === null && i !== sorted.length - 1) {
        return 'Solo el último rango puede tener maxValue vacío';
      }

      const next = sorted[i + 1];
      if (!next) continue;
      const currentMax = current.maxValue ?? Number.POSITIVE_INFINITY;
      if (currentMax >= next.minValue) {
        return 'Los rangos no deben superponerse';
      }
    }

    return null;
  }

  private setSaving() { this.isSaving.set(true); this.saveSuccess.set(''); this.saveError.set(''); }
  private setSuccess(msg: string) { this.isSaving.set(false); this.saveSuccess.set(msg); setTimeout(() => this.saveSuccess.set(''), 3000); }
  private setError(msg: string) { this.isSaving.set(false); this.saveError.set(msg); setTimeout(() => this.saveError.set(''), 5000); }
}
