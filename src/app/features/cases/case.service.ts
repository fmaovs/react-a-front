import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Case, CaseNote, EscalationReason, ResolutionType, Page } from '../../models/types';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/management/cases`;

  getCases(page: number = 0, size: number = 50): Observable<Page<Case>> {
    return this.http.get<Page<Case>>(this.apiUrl, { params: { page, size } });
  }

  getCase(id: number): Observable<Case> {
    return this.http.get<Case>(`${this.apiUrl}/${id}`);
  }

  createCase(clientId: number, description: string): Observable<Case> {
    return this.http.post<Case>(this.apiUrl, null, { params: { clientId, description } });
  }

  updateCase(id: number, updates: { description?: string; status?: Case['status']; priority?: Case['priority'] }): Observable<Case> {
    return this.http.put<Case>(`${this.apiUrl}/${id}`, null, {
      params: {
        ...(updates.description ? { description: updates.description } : {}),
        ...(updates.status     ? { status: updates.status }           : {}),
        ...(updates.priority   ? { priority: updates.priority }       : {})
      }
    });
  }

  addNote(caseId: number, content: string,
          noteType: 'INTERNAL' | 'CUSTOMER_VISIBLE' = 'INTERNAL',
          source: 'HUMAN' | 'AI' = 'HUMAN'): Observable<CaseNote> {
    return this.http.post<CaseNote>(`${this.apiUrl}/${caseId}/notes`, null, {
      params: { content, noteType, source }
    });
  }

  getNotes(caseId: number): Observable<CaseNote[]> {
    return this.http.get<CaseNote[]>(`${this.apiUrl}/${caseId}/notes`);
  }

  escalateCase(caseId: number, reason: EscalationReason): Observable<Case> {
    return this.http.post<Case>(`${this.apiUrl}/${caseId}/escalate`, null, { params: { reason } });
  }

  resolveCase(caseId: number, resolutionType: ResolutionType, details?: string): Observable<Case> {
    const params: Record<string, string> = { resolutionType };
    if (details?.trim()) params['details'] = details.trim();
    return this.http.post<Case>(`${this.apiUrl}/${caseId}/resolve`, null, { params });
  }
}
