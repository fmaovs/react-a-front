import { Component, signal } from '@angular/core';
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

@Component({
  selector: 'app-recaudo',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './recaudo.html',
  styleUrl: './recaudo.css'
})
export class RecaudoComponent {
  isGenerating = signal(false);

  readonly DollarSignIcon = DollarSign;
  readonly LinkIcon = LinkIcon;
  readonly SendIcon = Send;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;
  readonly CreditCardIcon = CreditCard;
  readonly SmartphoneIcon = Smartphone;
  readonly ArrowRightIcon = ArrowRight;
  readonly PlusIcon = Plus;

  links = [
    { name: 'Juan Pérez', amount: '$150,000', expiry: '24 Mar 2024', status: 'Pagado', channel: 'WhatsApp' },
    { name: 'Maria Garcia', amount: '$420,000', expiry: '22 Mar 2024', status: 'Pendiente', channel: 'SMS' },
    { name: 'Carlos Ruiz', amount: '$280,000', expiry: '20 Mar 2024', status: 'Vencido', channel: 'Email' },
    { name: 'Ana Lopez', amount: '$85,000', expiry: '25 Mar 2024', status: 'Pendiente', channel: 'WhatsApp' },
  ];

  gateways = [
    { name: 'PSE / ACH', status: 'Activo', icon: this.CheckCircle2Icon },
    { name: 'Bancolombia', status: 'Activo', icon: this.CheckCircle2Icon },
    { name: 'Wompi', status: 'Mantenimiento', icon: this.ClockIcon },
  ];

  handleGenerate() {
    this.isGenerating.set(true);
    setTimeout(() => this.isGenerating.set(false), 1500);
  }
}
