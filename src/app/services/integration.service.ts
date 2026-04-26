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

  getBatches(): Observable<any> { // Could be PageBatch
    return this.http.get<any>(`${this.apiUrl}/batches`);
  }

  uploadBatch(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // Based on OpenAPI, there are two upload endpoints.
    // /integration/batches/csv/upload seems to be the most complete (M1)
    return this.http.post<any>(`${this.apiUrl}/batches/csv/upload`, formData);
  }

  promoteBatch(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batches/${id}/promote`, {});
  }
}
