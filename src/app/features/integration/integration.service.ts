import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Batch } from '../../models/types';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/integration`;

  getBatches(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/batches`);
  }

  uploadBatch(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/batches/csv/upload`, formData);
  }

  promoteBatch(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batches/${id}/promote`, {});
  }

  processBatch(id: number): Observable<BatchProcessSummary> {
    return this.http.post<BatchProcessSummary>(`${this.apiUrl}/batches/${id}/process`, {});
  }
}

export interface BatchProcessSummary {
  batchId: number;
  batchNumber: string;
  status: string;
  totalRecords: number;
  validRecords: number;
  failedRecords: number;
  clientsProcessed: number;
  scoresGenerated: number;
  casesCreated: number;
  paymentLinksCreated: number;
}
