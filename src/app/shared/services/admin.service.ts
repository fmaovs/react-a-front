import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuditLog, Page } from '../../models/types';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAuditLogs(size: number = 50): Observable<AuditLog[]> {
    return this.http.get<Page<AuditLog>>(`${this.apiUrl}/audit/log?size=${size}`).pipe(
      map(page => page.content ?? [])
    );
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
