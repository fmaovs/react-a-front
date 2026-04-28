import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaymentAgreement, Installment, Page, ZolevTokenResponse, PaymentLinkRequest, PaymentLinkResponse, PaymentLinkUiResult } from '../models/types';
import { environment } from '../../environments/environment';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/collection`;
  private paymentsUrl = `${environment.apiUrl}/v1/payments`;
  private paymentsLegacyUrl = `${environment.apiUrl}/api/v1/payments`;

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

  generatePaymentLink(request: PaymentLinkRequest): Observable<PaymentLinkUiResult> {
    return this.http.post<PaymentLinkResponse>(`${this.paymentsUrl}/generate-link`, request).pipe(
      catchError(err => {
        // Fallback defensivo para ambientes donde el controlador quedo con /api/v1 dentro del context-path /api.
        if (err?.status === 404) {
          return this.http.post<PaymentLinkResponse>(`${this.paymentsLegacyUrl}/generate-link`, request);
        }
        return throwError(() => err);
      }),
      map(res => ({
        paymentId: res.paymentId,
        status: res.nombreEstado,
        paymentUrl: res.urlLink
      }))
    );
  }
}
