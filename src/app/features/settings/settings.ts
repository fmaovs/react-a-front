import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StoreService } from '../../core/store/app-store.service';
import { UserService } from './user.service';
import {
  ScoringConfigService,
  ScoringModelConfig,
  RiskThreshold,
  IntensityPolicy,
  SegmentRule,
  WorkflowConfig,
  ScoringVariable,
  VariableRange,
  ScoreCalculationDetail,
  ScoreResult
} from './scoring-config.service';
import { User, UserCreateRequest, UserUpdateRequest } from '../../models/types';
import { UserModalComponent } from '../../shared/components/user-modal/user-modal';
import {
  LucideAngularModule,
  Settings2, ShieldAlert, FileCode, Clock, Save, Plus, Trash2, Info,
  CheckCircle2, AlertTriangle, Users, Lock, Shield, Mail, UserPlus,
  Briefcase, Sliders, GitBranch, RefreshCw
} from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

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
  scoringClientId = signal<number | null>(null);
  scoringPreview = signal<ScoreResult | null>(null);
  scoringPreviewDetail = signal<ScoreCalculationDetail | null>(null);
  scoringPreviewLoading = signal(false);
  scoringPreviewError = signal('');

  // ── Formulario agregar variable ───────────────────────────────────────────
  showNewVarForm = signal(false);
  newVarKey = '';
  newVarLabel = '';
  newVarWeight = 10;
  newVarActive = true;

  // ── Formulario agregar política de intensidad ─────────────────────────────
  showNewPolicyForm = signal(false);
  newPolicyRiskLevel = '';
  newPolicyLabel = '';
  newPolicySms = 1;
  newPolicyEmail = 7;
  newPolicyCalls = 1;
  newPolicyWhatsapp = 1;

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

  readonly SEGMENTS = ['PREVENTIVA', 'ADMINISTRATIVA', 'PREJUDICIAL'];
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
      next: r => {
        // Normaliza configuraciones antiguas para mantener el flujo solo prejuridico.
        const normalized = (r ?? []).map(rule => ({
          ...rule,
          segment: ['JURIDICA', 'JUDICIAL'].includes(rule.segment) ? 'PREJUDICIAL' : rule.segment
        }));
        this.segmentRules.set(normalized);
      },
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
      next: ranges => { this.variableRanges.set(ranges); this.setSuccess('Rangos de variable guardados'); },
      error: () => this.setError('Error al guardar rangos de variable')
    });
  }

  calculatePreviewScore() {
    const clientId = this.scoringClientId();
    if (!clientId || clientId <= 0) {
      this.scoringPreviewError.set('Ingresa un ID de cliente válido.');
      return;
    }

    this.scoringPreviewLoading.set(true);
    this.scoringPreviewError.set('');

    this.scoringConfigService.calculateClientScore(clientId).pipe(
      switchMap(() => forkJoin({
        score: this.scoringConfigService.getCurrentClientScore(clientId).pipe(catchError(() => of(null))),
        detail: this.scoringConfigService.getCurrentClientScoreDetail(clientId).pipe(catchError(() => of(null)))
      }))
    ).subscribe({
      next: ({ score, detail }) => {
        const normalizedScore = this.normalizeScoreResult(score);
        const normalizedDetail = detail ?? this.parseCalculationDetail(normalizedScore?.calculationDetail);
        const fallbackScore = normalizedScore ?? this.buildPreviewScoreFromDetail(normalizedDetail);

        this.scoringPreview.set(fallbackScore);
        this.scoringPreviewDetail.set(normalizedDetail);
        this.scoringPreviewLoading.set(false);

        if (!fallbackScore && !normalizedDetail) {
          this.scoringPreviewError.set('El scoring fue calculado, pero no fue posible leer la respuesta del backend.');
        }
      },
      error: err => {
        this.scoringPreview.set(null);
        this.scoringPreviewDetail.set(null);
        this.scoringPreviewLoading.set(false);
        this.scoringPreviewError.set(err?.error?.message || 'No fue posible calcular el scoring del cliente.');
      }
    });
  }

  updateScoringClientId(value: number | string | null) {
    const parsed = Number(value);
    this.scoringClientId.set(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
  }

  getPreviewCreditScore(): number {
    const preview = this.scoringPreview();
    return this.clampNumber(preview?.creditScore ?? preview?.score ?? 0, 0, 1000);
  }

  getPreviewRiskScore(): number {
    return Math.round(this.getPreviewRiskScoreFraction() * 100);
  }

  getPreviewRiskScoreFraction(): number {
    const risk = this.scoringPreview()?.riskScore;
    return this.clampNumber(typeof risk === 'number' ? risk : 0, 0, 1);
  }

  getPreviewCollectionProbability(): number {
    const probability = this.scoringPreview()?.collectionProbability;
    return Math.round(this.clampNumber(typeof probability === 'number' ? probability : 0, 0, 1) * 100);
  }

  getPreviewScorePercentage(): number {
    return Math.round((this.getPreviewCreditScore() / 1000) * 100);
  }

  getPreviewRiskLevel(): string {
    const preview = this.scoringPreview();
    const backendRisk = this.normalizeRiskLevel(preview?.riskLevel);
    if (backendRisk) return backendRisk;

    const band = this.getPreviewThresholdBand();
    return this.normalizeRiskLevel(band?.riskLevel) || 'SIN NIVEL';
  }

  getPreviewRiskBadgeClass(): string {
    const level = this.getPreviewRiskLevel();
    const slug = this.slugifyRiskLevel(level);
    return ['bajo', 'medio', 'alto', 'critico'].includes(slug) ? `risk-${slug}` : 'risk-neutral';
  }

  getPreviewScoreBandLabel(): string {
    const band = this.getPreviewThresholdBand();
    if (!band) return 'Sin umbral configurado';

    return `${this.formatRiskLevelLabel(band.riskLevel)} · ${band.minScore} - ${band.maxScore}`;
  }

  getPreviewModelVersion(): string {
    return this.scoringPreview()?.modelVersion || this.scoringPreviewDetail()?.modelVersion || this.scoringPreviewDetail()?.model_version || '-';
  }

  getPreviewCalculatedAt(): string {
    return this.scoringPreview()?.calculatedAt || '-';
  }

  getPreviewRecommendedSegment(): string {
    return this.scoringPreview()?.recommendedSegment || this.getDetailResultValue('recommended_segment', 'recommendedSegment') || '-';
  }

  getPreviewDetailInputs(): Record<string, unknown> {
    return (this.scoringPreviewDetail()?.inputs as Record<string, unknown>) ?? {};
  }

  getPreviewDetailResult(): Record<string, unknown> {
    return (this.scoringPreviewDetail()?.result as Record<string, unknown>) ?? {};
  }

  getPreviewDetailModelVersion(): string {
    return this.scoringPreviewDetail()?.model_version || this.scoringPreviewDetail()?.modelVersion || '-';
  }

  getPreviewRiskLevelLabel(): string {
    return this.formatRiskLevelLabel(this.getPreviewRiskLevel());
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

  commitAddVariable() {
    const key = this.newVarKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const label = this.newVarLabel.trim();
    if (!key || !label) { this.setError('La clave y la etiqueta son obligatorias'); return; }
    if (this.variables().some(v => v.variableKey === key)) {
      this.setError(`Ya existe una variable con la clave "${key}"`); return;
    }
    this.variables.update(vars => [
      ...vars, { variableKey: key, label, weight: this.newVarWeight / 100, active: this.newVarActive }
    ]);
    this.newVarKey = ''; this.newVarLabel = ''; this.newVarWeight = 10; this.newVarActive = true;
    this.showNewVarForm.set(false);
  }

  removeVariable(index: number) {
    const removed = this.variables()[index];
    this.variables.update(vars => vars.filter((_, i) => i !== index));
    if (removed && this.selectedVariableKey() === removed.variableKey) {
      const next = this.variables()[0]?.variableKey ?? '';
      this.selectedVariableKey.set(next);
      const model = this.activeModel();
      if (model && next) this.loadVariableRanges(model.modelVersion, next);
      else this.variableRanges.set([]);
    }
  }

  commitAddPolicy() {
    const riskLevel = this.newPolicyRiskLevel.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!riskLevel) { this.setError('El nivel de riesgo es obligatorio'); return; }
    if (this.intensityPolicies().some(p => p.riskLevel === riskLevel)) {
      this.setError(`Ya existe una política para el nivel "${riskLevel}"`); return;
    }
    this.intensityPolicies.update(policies => [...policies, {
      riskLevel,
      intensityLabel: this.newPolicyLabel.trim() || riskLevel,
      smsPerWeek: this.newPolicySms,
      emailEveryDays: this.newPolicyEmail,
      callsPerWeek: this.newPolicyCalls,
      whatsappPerWeek: this.newPolicyWhatsapp,
      physicalNotice: false,
      contactReferences: false
    }]);
    this.newPolicyRiskLevel = ''; this.newPolicyLabel = '';
    this.newPolicySms = 1; this.newPolicyEmail = 7; this.newPolicyCalls = 1; this.newPolicyWhatsapp = 1;
    this.showNewPolicyForm.set(false);
  }

  removeIntensityPolicy(index: number) {
    this.intensityPolicies.update(p => p.filter((_, i) => i !== index));
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

  private normalizeScoreResult(score: ScoreResult | null): ScoreResult | null {
    if (!score) return null;

    return {
      ...score,
      creditScore: this.clampNumber(score.creditScore ?? score.score ?? 0, 0, 1000),
      score: this.clampNumber(score.score ?? score.creditScore ?? 0, 0, 1000),
      riskScore: this.clampNumber(typeof score.riskScore === 'number' ? score.riskScore : 0, 0, 1),
      collectionProbability: this.clampNumber(typeof score.collectionProbability === 'number' ? score.collectionProbability : 0, 0, 1),
      calculationDetail: this.parseCalculationDetail(score.calculationDetail) ?? score.calculationDetail ?? undefined
    };
  }

  private buildPreviewScoreFromDetail(detail: ScoreCalculationDetail | null): ScoreResult | null {
    if (!detail) return null;

    const result = (detail.result ?? {}) as Record<string, unknown>;
    const creditScore = this.readNumericValue(result, 'credit_score', 'creditScore', 'score');
    const riskScore = this.readNumericValue(result, 'risk_score', 'riskScore');
    const collectionProbability = this.readNumericValue(result, 'collection_probability', 'collectionProbability');

    return {
      creditScore: creditScore ?? undefined,
      score: creditScore ?? undefined,
      riskScore: riskScore ?? undefined,
      collectionProbability: collectionProbability ?? undefined,
      riskLevel: this.readStringValue(result, 'risk_level', 'riskLevel'),
      recommendedSegment: this.readStringValue(result, 'recommended_segment', 'recommendedSegment'),
      modelVersion: this.readStringValue(detail, 'model_version', 'modelVersion'),
      calculatedAt: this.readStringValue(result, 'calculated_at', 'calculatedAt'),
      calculationDetail: detail
    };
  }

  private parseCalculationDetail(detail: ScoreResult['calculationDetail']): ScoreCalculationDetail | null {
    if (!detail) return null;
    if (typeof detail === 'string') {
      try {
        const parsed = JSON.parse(detail);
        return parsed && typeof parsed === 'object' ? parsed as ScoreCalculationDetail : null;
      } catch {
        return null;
      }
    }

    return typeof detail === 'object' ? detail as ScoreCalculationDetail : null;
  }

  private getPreviewThresholdBand(): RiskThreshold | null {
    const score = this.getPreviewCreditScore();
    const thresholds = [...this.thresholds()].sort((a, b) => a.minScore - b.minScore);
    if (!thresholds.length) return null;

    const exactMatch = thresholds.find(t => score >= t.minScore && score <= t.maxScore);
    if (exactMatch) return exactMatch;

    if (score < thresholds[0].minScore) return thresholds[0];
    return thresholds[thresholds.length - 1];
  }

  private normalizeRiskLevel(value?: string | null): string {
    const normalized = (value || '').toString().trim().toUpperCase().replace(/Á/g, 'A').replace(/Í/g, 'I').replace(/É/g, 'E').replace(/Ó/g, 'O').replace(/Ú/g, 'U');
    if (!normalized) return '';
    if (normalized === 'CRITICO' || normalized === 'CRITICAL') return 'CRITICO';
    if (normalized === 'ALTO' || normalized === 'HIGH') return 'ALTO';
    if (normalized === 'MEDIO' || normalized === 'MEDIUM') return 'MEDIO';
    if (normalized === 'BAJO' || normalized === 'LOW') return 'BAJO';
    return normalized;
  }

  private slugifyRiskLevel(value: string): string {
    return this.normalizeRiskLevel(value).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  private formatRiskLevelLabel(value: string): string {
    const normalized = this.normalizeRiskLevel(value);
    switch (normalized) {
      case 'BAJO': return 'Bajo';
      case 'MEDIO': return 'Medio';
      case 'ALTO': return 'Alto';
      case 'CRITICO': return 'Crítico';
      default: return normalized || '-';
    }
  }

  private getDetailResultValue(...keys: string[]): string {
    const result = this.getPreviewDetailResult();
    for (const key of keys) {
      const value = result?.[key];
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
    }
    return '';
  }

  private clampNumber(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
  }

  private readNumericValue(source: Record<string, unknown>, ...keys: string[]): number | null {
    for (const key of keys) {
      const value = source?.[key];
      const parsed = Number(value);
      if (value !== undefined && value !== null && Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
  }

  private readStringValue(source: Record<string, unknown> | ScoreCalculationDetail, ...keys: string[]): string | undefined {
    for (const key of keys) {
      const value = source?.[key as keyof typeof source];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return String(value);
      }
    }

    return undefined;
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
