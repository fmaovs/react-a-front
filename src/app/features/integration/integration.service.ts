import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/integration`;
  private scoringUrl = `${environment.apiUrl}/scoring`;

  getBatches(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/batches`);
  }

  uploadBatch(file: File): Observable<BatchScoreSummary> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BatchScoreSummary>(`${this.apiUrl}/batches/csv/upload`, formData);
  }

  promoteBatch(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batches/${id}/promote`, {});
  }

  processBatch(id: number): Observable<BatchScoreSummary> {
    return this.http.post<BatchScoreSummary>(`${this.scoringUrl}/batch/${id}/calculate`, {});
  }
}

export interface BatchScoreSummary {
  batchId: number;
  batchNumber: string;
  lote?: string;
  status: string;
  totalRecords: number;
  stagedRecords?: number;
  validRecords: number;
  failedRecords: number;
  clientsUpserted?: number;
  obligationsUpserted?: number;
  scoresGenerated: number;
  casesCreated: number;
  scoresFailed?: number;
  rowErrors?: unknown[];
  message?: string;
}
