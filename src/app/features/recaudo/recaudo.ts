import { Component, signal, inject, OnInit, computed } from '@angular/core';
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
import { CollectionService } from '../../services/collection.service';
import { PortfolioService } from '../../services/portfolio.service';
import { PaymentAgreement, Client, Obligation } from '../../models/types';
import { catchError, finalize, switchMap } from 'rxjs/operators';
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
  error = signal<string | null>(null);

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
    this.error.set(null);
    this.searchQueryValue = '';
    this.clients.set([]);
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

    this.isGenerating.set(true);
    this.error.set(null);

    this.collectionService.getZolevToken().pipe(
      switchMap(tokenRes => {
        if (tokenRes.respuesta.codigo !== 0) {
          throw new Error('Error obteniendo token de Zolev');
        }
        return this.collectionService.generatePaymentLink({
          clientId: client.id,
          obligationId: obligation.id,
          amount: amount,
          zolevToken: tokenRes.salida.token
        });
      }),
      finalize(() => this.isGenerating.set(false)),
      catchError(err => {
        this.error.set('Error al generar el link de pago. Intenta de nuevo.');
        return of(null);
      })
    ).subscribe(res => {
      if (res) {
        this.generatedLink.set(res.paymentUrl);
        this.loadData(); // Refresh list
      }
    });
  }

  copyToClipboard() {
    const link = this.generatedLink();
    if (link) {
      navigator.clipboard.writeText(link);
      // Optional: show a toast
    }
  }

  closeModal() {
    this.showModal.set(false);
  }

  payInstallment(id: number) {
    this.collectionService.payInstallment(id).subscribe(() => this.loadData());
  }
}
