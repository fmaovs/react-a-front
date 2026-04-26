import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardMetrics } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolio/dashboard`;

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/metrics`);
  }

  getDailyCollections(): Observable<any[]> {
    // Assuming backend returns a list of daily data
    return this.http.get<any[]>(`${this.apiUrl}/collections/daily`);
  }
}
