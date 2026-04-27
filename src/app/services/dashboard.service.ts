import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardMetrics, DashboardSummary } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardSummary>(this.apiUrl).pipe(
      map(summary => {
        const kpis = summary?.kpis;
        const totalCases = kpis?.totalCases ?? 0;
        const resolvedCases = kpis?.resolvedCases ?? 0;
        const activeCases = (kpis?.openCases ?? 0) + (kpis?.inProgressCases ?? 0) + (kpis?.escalatedCases ?? 0);
        const recoveryRate = totalCases > 0 ? resolvedCases / totalCases : 0;

        return {
          totalPortfolioValue: Number(kpis?.totalPortfolioValue ?? 0),
          activeCases,
          recoveryRate,
          dailyCollections: 0,
          riskDistribution: {},
          monthlyRecovery: {},
          openCases: kpis?.openCases ?? 0,
          inProgressCases: kpis?.inProgressCases ?? 0,
          escalatedCases: kpis?.escalatedCases ?? 0,
          resolvedCases: kpis?.resolvedCases ?? 0,
          totalCases,
          activeAdvisors: kpis?.activeAdvisors ?? 0
        };
      })
    );
  }

  getDailyCollections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/batches/recent`);
  }
}
