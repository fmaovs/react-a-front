import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Case, CaseNote, Page } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/management/cases`;

  getCases(page: number = 0, size: number = 20): Observable<Page<Case>> {
    return this.http.get<Page<Case>>(this.apiUrl, {
      params: { page, size }
    });
  }

  getCase(id: number): Observable<Case> {
    return this.http.get<Case>(`${this.apiUrl}/${id}`);
  }

  createCase(clientId: number, description: string): Observable<Case> {
    return this.http.post<Case>(this.apiUrl, null, {
      params: { clientId, description }
    });
  }

  updateCase(id: number, updates: { description?: string; status?: Case['status']; priority?: Case['priority'] }): Observable<Case> {
    return this.http.put<Case>(`${this.apiUrl}/${id}`, null, {
      params: {
        ...(updates.description ? { description: updates.description } : {}),
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.priority ? { priority: updates.priority } : {})
      }
    });
  }

  escalateCase(id: number, reason: string): Observable<Case> {
    return this.http.post<Case>(`${this.apiUrl}/${id}/escalate`, null, {
      params: { reason }
    });
  }

  resolveCase(id: number, resolution: string): Observable<Case> {
    return this.http.post<Case>(`${this.apiUrl}/${id}/resolve`, null, {
      params: { resolution }
    });
  }

  addNote(caseId: number, content: string): Observable<CaseNote> {
    return this.http.post<CaseNote>(`${this.apiUrl}/${caseId}/notes`, null, {
      params: { content }
    });
  }

  getNotes(caseId: number): Observable<CaseNote[]> {
    return this.http.get<CaseNote[]>(`${this.apiUrl}/${caseId}/notes`);
  }
}
