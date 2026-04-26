import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, Obligation, Page } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolio`;

  getClients(page: number = 0, size: number = 20): Observable<Page<Client>> {
    return this.http.get<Page<Client>>(`${this.apiUrl}/clients`, {
      params: { page, size }
    });
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`);
  }

  getObligations(page: number = 0, size: number = 20): Observable<Page<Obligation>> {
    return this.http.get<Page<Obligation>>(`${this.apiUrl}/obligations`, {
      params: { page, size }
    });
  }

  getObligation(id: number): Observable<Obligation> {
    return this.http.get<Obligation>(`${this.apiUrl}/obligations/${id}`);
  }
}
