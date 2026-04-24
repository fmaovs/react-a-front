import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, Obligation } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolio`;

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`);
  }

  getObligations(): Observable<Obligation[]> {
    return this.http.get<Obligation[]>(`${this.apiUrl}/obligations`);
  }

  getObligation(id: number): Observable<Obligation> {
    return this.http.get<Obligation>(`${this.apiUrl}/obligations/${id}`);
  }
}
