import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentAgreement, Installment } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/collection`;

  getAgreements(): Observable<PaymentAgreement[]> {
    return this.http.get<PaymentAgreement[]>(`${this.apiUrl}/agreements`);
  }

  createAgreement(agreement: Partial<PaymentAgreement>): Observable<PaymentAgreement> {
    return this.http.post<PaymentAgreement>(`${this.apiUrl}/agreements`, agreement);
  }

  getInstallments(): Observable<Installment[]> {
    return this.http.get<Installment[]>(`${this.apiUrl}/installments`);
  }

  payInstallment(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/installments/${id}/pay`, {});
  }
}
