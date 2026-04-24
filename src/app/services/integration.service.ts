import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Batch } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/integration`;

  getBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.apiUrl}/batches`);
  }

  uploadBatch(file: File): Observable<Batch> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Batch>(`${this.apiUrl}/batches`, formData);
  }

  promoteBatch(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batches/${id}/promote`, {});
  }
}
