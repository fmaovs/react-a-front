import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuditLog } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/audit/log`);
  }

  getSlaConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/sla`);
  }

  updateSlaConfig(config: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/sla`, config);
  }

  getBrandConfig(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/brand`);
  }

  updateBrandConfig(config: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/brand`, config);
  }
}
