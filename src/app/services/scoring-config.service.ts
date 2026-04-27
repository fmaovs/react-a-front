import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  isActive: boolean;
}

export interface RiskThreshold {
  id?: number;
  modelVersion?: string;
  riskLevel: string;
  minScore: number;
  maxScore: number;
}

export interface ChannelRule {
  id?: number;
  modelVersion?: string;
  riskLevel: string;
  contactChannel: string;
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

@Injectable({ providedIn: 'root' })
export class ScoringConfigService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/scoring`;

  // ── Modelo de scoring ─────────────────────────────────────────────────────

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
      description:          model.description
    });
  }

  getThresholds(version: string): Observable<RiskThreshold[]> {
    return this.http.get<RiskThreshold[]>(`${this.baseUrl}/config/models/${version}/thresholds`);
  }

  updateThresholds(version: string, thresholds: RiskThreshold[]): Observable<RiskThreshold[]> {
    return this.http.put<RiskThreshold[]>(`${this.baseUrl}/config/models/${version}/thresholds`, thresholds);
  }

  getChannels(version: string): Observable<ChannelRule[]> {
    return this.http.get<ChannelRule[]>(`${this.baseUrl}/config/models/${version}/channels`);
  }

  updateChannels(version: string, channels: ChannelRule[]): Observable<ChannelRule[]> {
    return this.http.put<ChannelRule[]>(`${this.baseUrl}/config/models/${version}/channels`, channels);
  }

  // ── Flujo de cobranza ─────────────────────────────────────────────────────

  getActiveWorkflowConfig(): Observable<WorkflowConfig> {
    return this.http.get<WorkflowConfig>(`${this.baseUrl}/workflow-config`);
  }

  updateWorkflowConfig(cfg: WorkflowConfig): Observable<WorkflowConfig> {
    return this.http.put<WorkflowConfig>(`${this.baseUrl}/workflow-config`, cfg);
  }

  // ── Segmentación ──────────────────────────────────────────────────────────

  getActiveSegmentRules(): Observable<SegmentRule[]> {
    return this.http.get<SegmentRule[]>(`${this.baseUrl}/workflow-config/segment-rules`);
  }

  updateSegmentRules(version: string, rules: SegmentRule[]): Observable<SegmentRule[]> {
    return this.http.put<SegmentRule[]>(`${this.baseUrl}/workflow-config/segment-rules/${version}`, rules);
  }

  // ── Cuotas ────────────────────────────────────────────────────────────────

  getActiveInstallmentRules(): Observable<InstallmentRule[]> {
    return this.http.get<InstallmentRule[]>(`${this.baseUrl}/workflow-config/installment-rules`);
  }

  updateInstallmentRules(version: string, rules: InstallmentRule[]): Observable<InstallmentRule[]> {
    return this.http.put<InstallmentRule[]>(`${this.baseUrl}/workflow-config/installment-rules/${version}`, rules);
  }
}
