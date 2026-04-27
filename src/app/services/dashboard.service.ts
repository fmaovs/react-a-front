import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardSummary } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(this.apiUrl);
  }

  getMetrics(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getDailyCollections(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/batches/recent`);
  }
}
