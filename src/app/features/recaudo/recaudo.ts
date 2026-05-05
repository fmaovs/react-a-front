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
  Loader2
} from 'lucide-angular';
import { CollectionService } from './collection.service';
import { PortfolioService } from '../../shared/services/portfolio.service';
import { PaymentAgreement, Client, Obligation } from '../../models/types';
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

  readonly DollarSignIcon = DollarSign;
  readonly LinkIcon = LinkIcon;
  readonly SendIcon = Send;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;
  readonly CreditCardIcon = CreditCard;
  readonly SmartphoneIcon = Smartphone;
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly XIcon = X;
  readonly CopyIcon = Copy;
  readonly ExternalLinkIcon = ExternalLink;
  readonly LoaderIcon = Loader2;

  gateways = [
    { name: 'PSE / ACH', status: 'Activo', icon: this.CheckCircle2Icon },
    { name: 'Bancolombia', status: 'Activo', icon: this.CheckCircle2Icon },
    { name: 'Wompi', status: 'Mantenimiento', icon: this.ClockIcon },
  ];

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

  closeModal() {
    this.showModal.set(false);
    this.resetForm();
  }

  payInstallment(id: number) {
    this.collectionService.payInstallment(id).subscribe(() => this.loadData());
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
