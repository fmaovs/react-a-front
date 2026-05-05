import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DashboardSummary,
  KpiSummary,
  SegmentBreakdown,
  AgingBucket,
  CaseStatusBreakdown,
  AdvisorMetrics,
  RiskDistribution,
  RecentBatch
} from '../../models/types';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  // Main endpoint - all data
  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(this.apiUrl);
  }

  getMetrics(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Atomized endpoints
  getKpis(): Observable<KpiSummary> {
    return this.http.get<KpiSummary>(`${this.apiUrl}/kpis`);
  }

  getPortfolioBySegment(): Observable<SegmentBreakdown[]> {
    return this.http.get<SegmentBreakdown[]>(`${this.apiUrl}/portfolio/segment`);
  }

  getAgingAnalysis(): Observable<AgingBucket[]> {
    return this.http.get<AgingBucket[]>(`${this.apiUrl}/aging`);
  }

  getCasesByStatus(): Observable<CaseStatusBreakdown[]> {
    return this.http.get<CaseStatusBreakdown[]>(`${this.apiUrl}/cases/status`);
  }

  getAdvisorMetrics(): Observable<AdvisorMetrics[]> {
    return this.http.get<AdvisorMetrics[]>(`${this.apiUrl}/advisors`);
  }

  getRiskDistribution(): Observable<RiskDistribution[]> {
    return this.http.get<RiskDistribution[]>(`${this.apiUrl}/risk`);
  }

  getRecentBatches(): Observable<RecentBatch[]> {
    return this.http.get<RecentBatch[]>(`${this.apiUrl}/batches/recent`);
  }

  getDailyCollections(): Observable<RecentBatch[]> {
    return this.http.get<RecentBatch[]>(`${this.apiUrl}/batches/recent`);
  }
}
