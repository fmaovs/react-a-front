import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SendNotificationRequest {
  recipient?: string;
  message: string;
  clientId?: number;
  reason?: string;
  template?: string;
  subject?: string;
  templateData?: Record<string, string>;
  riskLevel?: string;
}

export interface NotificationDispatchResult {
  channel: string;
  externalId: string | null;
  status: string;
  statusDescription: string;
  accepted: boolean;
  skippedByLey2300: boolean;
  channelNotSupported: boolean;
  contactAttemptId: number;
}

export const NOTIFICATION_CHANNELS = {
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
  PHONE: 'PHONE'
} as const;

export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_SMS_LENGTH = 160;
export const PHONE_REGEX = /^\+?\d{7,15}$/;
export const EMAIL_REGEX = /^[\w._%+\-]+@[\w.\-]+\.[a-zA-Z]{2,}$/;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/strategy/notifications`;

  /**
   * Envía una notificación a través del canal especificado
   */
  sendNotification(
    channel: string,
    request: SendNotificationRequest
  ): Observable<NotificationDispatchResult> {
    return this.http.post<NotificationDispatchResult>(
      `${this.baseUrl}/send/${channel}`,
      request
    );
  }

  /**
   * Método de conveniencia: Enviar SMS
   */
  sendSMS(recipient: string, message: string, clientId?: number, reason?: string) {
    return this.sendNotification('SMS', { recipient, message, clientId, reason });
  }

  /**
   * Método de conveniencia: Enviar Email
   */
  sendEmail(recipient: string, message: string, clientId?: number, reason?: string,
            template?: string, subject?: string, riskLevel?: string) {
    return this.sendNotification('EMAIL', {
      recipient, message, clientId, reason,
      template: template ?? 'COBRANZA_PREVENTIVA_BVS',
      subject:  subject  ?? 'Recordatorio de pago - BankVision',
      riskLevel
    });
  }

  /**
   * Método de conveniencia: Enviar WhatsApp
   */
  sendWhatsApp(recipient: string, message: string, clientId?: number, reason?: string) {
    return this.sendNotification('WHATSAPP', { recipient, message, clientId, reason });
  }

  /**
   * Valida el formato del destinatario según el canal
   */
  validateRecipient(recipient: string, channel: string): boolean {
    if (channel === NOTIFICATION_CHANNELS.EMAIL) {
      return EMAIL_REGEX.test(recipient);
    }
    return PHONE_REGEX.test(recipient);
  }

  /**
   * Valida la longitud del mensaje
   */
  validateMessage(message: string): boolean {
    return message.length > 0 && message.length <= MAX_MESSAGE_LENGTH;
  }
}


