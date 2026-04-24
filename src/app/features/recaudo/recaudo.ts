import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  Plus
} from 'lucide-angular';
import { CollectionService } from '../../services/collection.service';
import { PaymentAgreement, Installment } from '../../models/types';

@Component({
  selector: 'app-recaudo',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './recaudo.html',
  styleUrl: './recaudo.css'
})
export class RecaudoComponent implements OnInit {
  private collectionService = inject(CollectionService);

  isGenerating = signal(false);
  realAgreements = signal<PaymentAgreement[]>([]);
  realInstallments = signal<Installment[]>([]);

  readonly DollarSignIcon = DollarSign;
  readonly LinkIcon = LinkIcon;
  readonly SendIcon = Send;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;
  readonly CreditCardIcon = CreditCard;
  readonly SmartphoneIcon = Smartphone;
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Plus;

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
    this.collectionService.getInstallments().subscribe(data => this.realInstallments.set(data));
  }

  handleGenerate() {
    this.isGenerating.set(true);
    // Logic to create a new agreement could go here
    setTimeout(() => this.isGenerating.set(false), 1500);
  }

  payInstallment(id: number) {
    this.collectionService.payInstallment(id).subscribe(() => this.loadData());
  }
}
