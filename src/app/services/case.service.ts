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

  updateCase(id: number, updates: Partial<Case>): Observable<Case> {
    return this.http.put<Case>(`${this.apiUrl}/${id}`, updates);
  }

  addNote(caseId: number, content: string): Observable<CaseNote> {
    return this.http.post<CaseNote>(`${this.apiUrl}/${caseId}/notes`, { content });
  }

  getNotes(caseId: number): Observable<CaseNote[]> {
    return this.http.get<CaseNote[]>(`${this.apiUrl}/${caseId}/notes`);
  }
}
