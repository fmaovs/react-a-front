import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaymentAgreement, Installment, Page, ZolevTokenResponse, PaymentLinkRequest, PaymentLinkResponse } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/collection`;

  getAgreements(): Observable<PaymentAgreement[]> {
    return this.http.get<Page<PaymentAgreement>>(`${this.apiUrl}/agreements?size=100`).pipe(
      map(page => page.content ?? [])
    );
  }

  createAgreement(agreement: Partial<PaymentAgreement>): Observable<PaymentAgreement> {
    return this.http.post<PaymentAgreement>(`${this.apiUrl}/agreements`, agreement);
  }

  getInstallmentsByAgreement(agreementId: number): Observable<Installment[]> {
    return this.http.get<Installment[]>(`${this.apiUrl}/agreements/${agreementId}/installments`);
  }

  payInstallment(installmentId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/agreements/installments/${installmentId}/pay`, {});
  }

  getZolevToken(): Observable<ZolevTokenResponse> {
    const headers = new HttpHeaders({
      'Zolev-IdCliente': environment.zolev.idCliente,
      'Zolev-Identificacion': environment.zolev.identificacion,
      'Zolev-CodigoUsuario': environment.zolev.codigoUsuario,
      'Zolev-Password': environment.zolev.password
    });

    return this.http.post<ZolevTokenResponse>(`${environment.zolev.urlToken}/api/token/obtener`, {}, { headers });
  }

  generatePaymentLink(request: PaymentLinkRequest): Observable<PaymentLinkResponse> {
    return this.http.post<PaymentLinkResponse>(`${this.apiUrl}/generate-link`, request);
  }
}
