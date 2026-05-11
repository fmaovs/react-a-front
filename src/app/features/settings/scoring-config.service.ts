import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ScoringModelConfig {
  id?: number;
  modelVersion: string;
  description?: string;
  weightPaymentHistory: number;
  weightDaysPastDue: number;
  weightDefaultFrequency: number;
  weightSeniority: number;
  maxDaysPastDueRef: number;
  maxSeniorityDaysRef: number;
  neutralBaseScore: number;
  isActive: boolean;
}

export interface RiskThreshold {
  id?: number;
  modelVersion?: string;
  riskLevel: string;
  minScore: number;
  maxScore: number;
}

export interface ScoringVariable {
  id?: number;
  modelVersion?: string;
  variableKey: string;
  label: string;
  weight: number;
  active: boolean;
}

export interface VariableRange {
  id?: number;
  modelVersion?: string;
  variableKey?: string;
  minValue: number;
  maxValue: number | null;
  baseScore: number;
}

export interface IntensityPolicy {
  id?: number;
  modelVersion?: string;
  riskLevel: string;
  intensityLabel: string;
  smsPerWeek: number;
  emailEveryDays: number;
  callsPerWeek: number;
  whatsappPerWeek: number;
  physicalNotice: boolean;
  contactReferences: boolean;
  notes?: string;
}

export interface SegmentRule {
  id?: number;
  modelVersion?: string;
  minDays: number;
  maxDays: number | null;
  segment: string;
  casePriority: string;
  label?: string;
}

export interface InstallmentRule {
  id?: number;
  modelVersion?: string;
  minDays: number;
  maxDays: number | null;
  installments: number;
  label?: string;
}

export interface WorkflowConfig {
  id?: number;
  modelVersion: string;
  isActive: boolean;
  escalateDaysPastDue: number;
  paymentLinkMinDpd: number;
  riskEscalationThreshold: number;
  riskPaymentThreshold: number;
  contactWindowStart: number;
  contactWindowEnd: number;
  maxDailyContacts: number;
  fallbackCreditScore: number;
  fallbackRiskScore: number;
  fallbackCollectionProbability: number;
}

export interface ScoreResult {
  id?: number;
  creditScore?: number;
  score?: number;
  riskScore?: number;
  riskLevel?: string;
  collectionProbability?: number;
  recommendedSegment?: string;
  modelVersion?: string;
  calculatedAt?: string;
  calculationDetail?: string | Record<string, unknown>;
}

export interface ScoreCalculationDetail {
  model_version?: string;
  modelVersion?: string;
  inputs?: Record<string, unknown>;
  result?: Record<string, unknown>;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class ScoringConfigService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/scoring`;

  getActiveModel(): Observable<ScoringModelConfig> {
    return this.http.get<ScoringModelConfig>(`${this.baseUrl}/config/models/active`);
  }

  updateModelWeights(model: ScoringModelConfig): Observable<ScoringModelConfig> {
    return this.http.put<ScoringModelConfig>(`${this.baseUrl}/config/models/active/weights`, {
      weightPaymentHistory: model.weightPaymentHistory,
      weightDaysPastDue:    model.weightDaysPastDue,
      weightDefaultFrequency: model.weightDefaultFrequency,
      weightSeniority:      model.weightSeniority,
      maxDaysPastDueRef:    model.maxDaysPastDueRef,
      maxSeniorityDaysRef:  model.maxSeniorityDaysRef,
      neutralBaseScore:     model.neutralBaseScore,
      description:          model.description
    });
  }

  getVariables(version: string): Observable<ScoringVariable[]> {
    return this.http.get<ScoringVariable[]>(`${this.baseUrl}/config/models/${version}/variables`);
  }

  updateVariables(version: string, variables: ScoringVariable[]): Observable<ScoringVariable[]> {
    return this.http.put<ScoringVariable[]>(`${this.baseUrl}/config/models/${version}/variables`, variables);
  }

  getVariableRanges(version: string, key: string): Observable<VariableRange[]> {
    return this.http.get<VariableRange[]>(`${this.baseUrl}/config/models/${version}/variables/${key}/ranges`);
  }

  updateVariableRanges(version: string, key: string, ranges: VariableRange[]): Observable<VariableRange[]> {
    return this.http.put<VariableRange[]>(`${this.baseUrl}/config/models/${version}/variables/${key}/ranges`, ranges);
  }

  getThresholds(version: string): Observable<RiskThreshold[]> {
    return this.http.get<RiskThreshold[]>(`${this.baseUrl}/config/models/${version}/thresholds`);
  }

  updateThresholds(version: string, thresholds: RiskThreshold[]): Observable<RiskThreshold[]> {
    return this.http.put<RiskThreshold[]>(`${this.baseUrl}/config/models/${version}/thresholds`, thresholds);
  }

  getIntensityPolicies(version: string): Observable<IntensityPolicy[]> {
    return this.http.get<IntensityPolicy[]>(`${this.baseUrl}/config/models/${version}/intensity-policies`);
  }

  updateIntensityPolicies(version: string, policies: IntensityPolicy[]): Observable<IntensityPolicy[]> {
    return this.http.put<IntensityPolicy[]>(`${this.baseUrl}/config/models/${version}/intensity-policies`, policies);
  }

  getActiveWorkflowConfig(): Observable<WorkflowConfig> {
    return this.http.get<WorkflowConfig>(`${this.baseUrl}/workflow-config`);
  }

  updateWorkflowConfig(cfg: WorkflowConfig): Observable<WorkflowConfig> {
    return this.http.put<WorkflowConfig>(`${this.baseUrl}/workflow-config`, cfg);
  }

  calculateClientScore(clientId: number): Observable<ScoreResult> {
    return this.http.post<ScoreResult>(`${this.baseUrl}/calculate/${clientId}`, {});
  }

  getCurrentClientScore(clientId: number): Observable<ScoreResult> {
    return this.http.get<ScoreResult>(`${this.baseUrl}/${clientId}`);
  }

  getCurrentClientScoreDetail(clientId: number): Observable<ScoreCalculationDetail> {
    return this.http.get<ScoreCalculationDetail>(`${this.baseUrl}/${clientId}/detail`);
  }

  getClientScoreHistory(clientId: number): Observable<ScoreResult[]> {
    return this.http.get<ScoreResult[]>(`${this.baseUrl}/${clientId}/history`);
  }

  calculateBatchScore(batchId: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/calculate/batch/${batchId}`, {});
  }

  getActiveSegmentRules(): Observable<SegmentRule[]> {
    return this.http.get<SegmentRule[]>(`${this.baseUrl}/workflow-config/segment-rules`);
  }

  updateSegmentRules(version: string, rules: SegmentRule[]): Observable<SegmentRule[]> {
    return this.http.put<SegmentRule[]>(`${this.baseUrl}/workflow-config/segment-rules/${version}`, rules);
  }
}
