import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  LucideAngularModule,
  DollarSign,
  Link as LinkIcon,
  Send,
  CheckCircle2,
  Clock,
  CreditCard,
  Smartphone,
  ArrowRight,
  Plus,
  Search,
  X,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BadgeCheck
} from 'lucide-angular';
import { CollectionService } from './collection.service';
import { PortfolioService } from '../../shared/services/portfolio.service';
import { NotificationService } from '../../shared/services/notification.service';
import { PaymentAgreement, Installment, Client, Obligation } from '../../models/types';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-recaudo',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MatButtonModule, FormsModule],
  templateUrl: './recaudo.html',
  styleUrl: './recaudo.css'
})
export class RecaudoComponent implements OnInit {
  private collectionService = inject(CollectionService);
  private portfolioService = inject(PortfolioService);
  private notificationService = inject(NotificationService);

  isGenerating = signal(false);
  realAgreements = signal<PaymentAgreement[]>([]);

  // Modal & Form State
  showModal = signal(false);
  searchQueryValue = '';
  clients = signal<Client[]>([]);
  selectedClient = signal<Client | null>(null);
  obligations = signal<Obligation[]>([]);
  selectedObligation = signal<Obligation | null>(null);
  paymentAmountValue = 0;
  generatedLink = signal<string | null>(null);
  generatedPaymentId = signal<string | null>(null);
  generatedStatus = signal<string | null>(null);
  copied = signal(false);
  showGenerationAnimation = signal(false);
  error = signal<string | null>(null);
  paymentIdQuery = '';
  paymentStatus = signal<string | null>(null);
  paymentStatusId = signal<string | null>(null);
  paymentStatusUrl = signal<string | null>(null);
  paymentStatusLoading = signal(false);
  paymentStatusError = signal<string | null>(null);

  // Notification States
  sendingSMS = signal(false);
  sendingEmail = signal(false);
  smsSent = signal(false);
  emailSent = signal(false);
  smsError = signal<string | null>(null);
  emailError = signal<string | null>(null);

  readonly DollarSignIcon = DollarSign;
  readonly LinkIcon = LinkIcon;
  readonly SendIcon = Send;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly CreditCardIcon = CreditCard;
  readonly SmartphoneIcon = Smartphone;
  readonly MailIcon = Mail;
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly XIcon = X;
  readonly CopyIcon = Copy;
  readonly ExternalLinkIcon = ExternalLink;
  readonly LoaderIcon = Loader2;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly BadgeCheckIcon = BadgeCheck;

  // Installment expansion state
  expandedAgreementId = signal<number | null>(null);
  installmentsMap = signal<Record<number, Installment[]>>({});
  loadingInstallments = signal<Record<number, boolean>>({});
  payingInstallmentId = signal<number | null>(null);

  gateways = [
    { name: 'PSE / ACH', status: 'Activo', icon: this.CheckCircle2Icon },
    { name: 'Bancolombia', status: 'Activo', icon: this.CheckCircle2Icon },
    { name: 'Wompi', status: 'En mantenimiento', icon: this.ClockIcon },
  ];

  readonly agreementStatusLabels: Record<string, string> = {
    ACTIVE:     'Activo',
    COMPLETED:  'Completado',
    DRAFT:      'Borrador',
    DEFAULTED:  'En mora',
    CANCELLED:  'Cancelado',
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.collectionService.getAgreements().subscribe(data => this.realAgreements.set(data));
  }

  handleGenerate() {
    this.resetForm();
    this.showModal.set(true);
  }

  resetForm() {
    this.selectedClient.set(null);
    this.selectedObligation.set(null);
    this.paymentAmountValue = 0;
    this.generatedLink.set(null);
    this.generatedPaymentId.set(null);
    this.generatedStatus.set(null);
    this.copied.set(false);
    this.showGenerationAnimation.set(false);
    this.isGenerating.set(false);
    this.error.set(null);
    this.searchQueryValue = '';
    this.clients.set([]);
    this.obligations.set([]);
    this.paymentIdQuery = '';
    this.paymentStatus.set(null);
    this.paymentStatusId.set(null);
    this.paymentStatusUrl.set(null);
    this.paymentStatusLoading.set(false);
    this.paymentStatusError.set(null);
    this.sendingSMS.set(false);
    this.sendingEmail.set(false);
    this.smsSent.set(false);
    this.emailSent.set(false);
    this.smsError.set(null);
    this.emailError.set(null);
  }

  searchClients() {
    if (this.searchQueryValue.length < 3) {
      this.clients.set([]);
      return;
    }

    this.portfolioService.getClients(0, 20, this.searchQueryValue).subscribe(page => {
      this.clients.set(page.content);
    });
  }

  selectClient(client: Client) {
    this.selectedClient.set(client);
    this.portfolioService.getObligations(0, 50, client.id).subscribe(page => {
      this.obligations.set(page.content);
    });
  }

  selectObligation(ob: Obligation) {
    this.selectedObligation.set(ob);
    this.paymentAmountValue = ob.currentBalance;
  }

  generateLink() {
    const client = this.selectedClient();
    const obligation = this.selectedObligation();
    const amount = this.paymentAmountValue;

    if (!client || !obligation || amount <= 0) {
      this.error.set('Por favor completa todos los campos.');
      return;
    }

    const request = {
      IdCliente: client.id,
      IdTransaccion: this.buildTransactionId(obligation.id),
      Referencia1: this.buildReference(client.id, obligation.id),
      Valor: amount,
      Url: this.buildReturnUrl()
    };

    this.isGenerating.set(true);
    this.showGenerationAnimation.set(true);
    this.error.set(null);
    this.copied.set(false);

    this.collectionService.generatePaymentLink(request).pipe(
      catchError(() => {
        this.showGenerationAnimation.set(false);
        this.isGenerating.set(false);
        this.error.set('No fue posible generar el link de pago. Verifica los datos e intenta de nuevo.');
        return of(null);
      })
    ).subscribe(res => {
      if (!res?.paymentUrl) {
        this.showGenerationAnimation.set(false);
        this.isGenerating.set(false);
        this.error.set('El backend no retorno una URL de pago valida.');
        return;
      }

      // Mantiene una transición corta para dar feedback visual antes de mostrar el link final.
      window.setTimeout(() => {
        this.generatedPaymentId.set(res.paymentId || null);
        this.generatedLink.set(res.paymentUrl);
        this.generatedStatus.set(res.status || 'GENERADO');
        this.paymentIdQuery = res.paymentId || this.paymentIdQuery;
        this.showGenerationAnimation.set(false);
        this.isGenerating.set(false);
        this.loadData();
      }, 900);
    });
  }

  consultPaymentStatus() {
    const paymentId = this.paymentIdQuery.trim() || this.generatedPaymentId();
    if (!paymentId) {
      this.paymentStatusError.set('Ingresa un PaymentId para consultar su estado.');
      return;
    }

    this.paymentStatusLoading.set(true);
    this.paymentStatusError.set(null);
    this.paymentStatus.set(null);
    this.paymentStatusId.set(null);
    this.paymentStatusUrl.set(null);

    this.collectionService.consultPaymentStatus(paymentId).subscribe({
      next: res => {
        this.paymentStatus.set(res.status);
        this.paymentStatusId.set(res.paymentId || paymentId);
        this.paymentStatusUrl.set(res.paymentUrl || null);
        this.paymentIdQuery = res.paymentId || paymentId;
        this.paymentStatusLoading.set(false);
      },
      error: () => {
        this.paymentStatusLoading.set(false);
        this.paymentStatusError.set('No fue posible consultar el estado del pago.');
      }
    });
  }

  async copyToClipboard() {
    const link = this.generatedLink();
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        this.copied.set(true);
        window.setTimeout(() => this.copied.set(false), 1800);
      } catch {
        this.error.set('No se pudo copiar el enlace al portapapeles.');
      }
    }
  }

  /**
   * Envía el link de pago por SMS al cliente
   * El backend obtiene automáticamente el número de teléfono del cliente
   */
  sendPaymentLinkSMS() {
    const client = this.selectedClient();
    const link = this.generatedLink();

    if (!client || !link) {
      this.smsError.set('No hay cliente o link disponible.');
      return;
    }

    const recipient = client.mobile || client.phone || '';
    if (!recipient) {
      this.smsError.set('El cliente no tiene un teléfono móvil registrado.');
      return;
    }

    // Crear mensaje SMS (máximo 160 caracteres)
    const message = `Hola ${client.fullName}, hemos generado tu link de pago. Accede aquí: ${link}`;

    // Validar longitud
    if (message.length > 160) {
      const truncatedMsg = `Tu link de pago está listo: ${link}`;
      this.sendSMSRequest(truncatedMsg, client.id, recipient);
    } else {
      this.sendSMSRequest(message, client.id, recipient);
    }
  }

  private sendSMSRequest(message: string, clientId: number, recipient: string) {
    this.sendingSMS.set(true);
    this.smsError.set(null);
    this.smsSent.set(false);

    this.notificationService.sendSMS(recipient, message, clientId, 'Envío de link de pago').pipe(
      catchError(error => {
        this.sendingSMS.set(false);
        this.smsError.set(
          error?.error?.message || 'No fue posible enviar el SMS. Intenta más tarde.'
        );
        return of(null);
      })
    ).subscribe(result => {
      this.sendingSMS.set(false);

      if (result) {
        if (result.accepted) {
          this.smsSent.set(true);
          this.smsError.set(null);
          // Auto-reset después de 3 segundos
          window.setTimeout(() => this.smsSent.set(false), 3000);
        } else if (result.skippedByLey2300) {
          this.smsError.set('Envío bloqueado: Fuera de horario permitido (Ley 2300)');
        } else {
          this.smsError.set(result.statusDescription || 'No se pudo completar el envío');
        }
      }
    });
  }

  /**
   * Envía el link de pago por Email al cliente
   * El backend obtiene automáticamente el email del cliente
   */
  sendPaymentLinkEmail() {
    const client = this.selectedClient();
    const link = this.generatedLink();

    if (!client || !link) {
      this.emailError.set('No hay cliente o link disponible.');
      return;
    }

    const recipient = client.email || '';
    if (!recipient) {
      this.emailError.set('El cliente no tiene un email registrado.');
      return;
    }

    // Crear mensaje para email
    const message = `Tu link de pago está listo: ${link}`;

    this.sendEmailRequest(message, client.id, recipient);
  }

  private sendEmailRequest(message: string, clientId: number, recipient: string) {
    this.sendingEmail.set(true);
    this.emailError.set(null);
    this.emailSent.set(false);

    this.notificationService.sendEmail(recipient, message, clientId, 'Envío de link de pago').pipe(
      catchError(error => {
        this.sendingEmail.set(false);
        this.emailError.set(
          error?.error?.message || 'No fue posible enviar el email. Intenta más tarde.'
        );
        return of(null);
      })
    ).subscribe(result => {
      this.sendingEmail.set(false);

      if (result) {
        if (result.accepted) {
          this.emailSent.set(true);
          this.emailError.set(null);
          window.setTimeout(() => this.emailSent.set(false), 3000);
        } else if (result.skippedByLey2300) {
          this.emailError.set('Envío bloqueado: Fuera de horario permitido (Ley 2300)');
        } else {
          this.emailError.set(result.statusDescription || 'No se pudo completar el envío');
        }
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.resetForm();
  }

  toggleInstallments(agreementId: number) {
    if (this.expandedAgreementId() === agreementId) {
      this.expandedAgreementId.set(null);
      return;
    }
    this.expandedAgreementId.set(agreementId);
    if (!this.installmentsMap()[agreementId]) {
      this.loadingInstallments.update(m => ({ ...m, [agreementId]: true }));
      this.collectionService.getInstallmentsByAgreement(agreementId).subscribe({
        next: items => {
          this.installmentsMap.update(m => ({ ...m, [agreementId]: items }));
          this.loadingInstallments.update(m => ({ ...m, [agreementId]: false }));
        },
        error: () => this.loadingInstallments.update(m => ({ ...m, [agreementId]: false }))
      });
    }
  }

  payInstallment(installmentId: number, amount: number, agreementId: number) {
    this.payingInstallmentId.set(installmentId);
    this.collectionService.payInstallment(installmentId, amount).subscribe({
      next: updated => {
        this.installmentsMap.update(m => ({
          ...m,
          [agreementId]: (m[agreementId] ?? []).map(i => i.id === updated.id ? updated : i)
        }));
        this.payingInstallmentId.set(null);
        this.loadData();
      },
      error: () => this.payingInstallmentId.set(null)
    });
  }

  private buildReference(clientId: number, obligationId: number): string {
    return `CL-${clientId}-OB-${obligationId}`;
  }

  private buildTransactionId(obligationId: number): number {
    const shortTimestamp = Date.now() % 1_000_000;
    return (obligationId % 1000) * 1_000_000 + shortTimestamp;
  }

  private buildReturnUrl(): string {
    return `${window.location.origin}/recaudo`;
  }
}
