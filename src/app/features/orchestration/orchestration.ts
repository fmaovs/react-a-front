import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Save,
  Copy,
  Eye
} from 'lucide-angular';

@Component({
  selector: 'app-orchestration',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './orchestration.html',
  styleUrl: './orchestration.css'
})
export class OrchestrationComponent {
  activeTab = signal<'dashboard' | 'templates'>('dashboard');
  activeChannel = signal('WhatsApp');
  isSaving = signal(false);
  showToast = signal(false);

  readonly MessageSquareIcon = MessageSquare;
  readonly PhoneIcon = Phone;
  readonly MailIcon = Mail;
  readonly MessageCircleIcon = MessageCircle;
  readonly SendIcon = Send;
  readonly UsersIcon = Users;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly XCircleIcon = XCircle;
  readonly PlusIcon = Plus;
  readonly SaveIcon = Save;
  readonly CopyIcon = Copy;
  readonly EyeIcon = Eye;

  channels = [
    { name: 'WhatsApp', icon: this.MessageCircleIcon, colorClass: 'emerald', sent: 4500, delivered: 4200 },
    { name: 'SMS', icon: this.MessageSquareIcon, colorClass: 'blue', sent: 8200, delivered: 7900 },
    { name: 'Voz / VoIP', icon: this.PhoneIcon, colorClass: 'accent', sent: 1200, delivered: 1150 },
    { name: 'Email', icon: this.MailIcon, colorClass: 'violet', sent: 15000, delivered: 14800 },
  ];

  campaigns = [
    { name: 'Recordatorio Preventivo Q1', segment: 'Preventiva', progress: 85, status: 'En curso' },
    { name: 'Recuperación Administrativa', segment: 'Administrativa', progress: 42, status: 'En curso' },
    { name: 'Campaña Especial Semana Santa', segment: 'Todos', progress: 100, status: 'Completada' },
  ];

  events = [
    { type: 'delivered', user: 'Juan Pérez', channel: 'WhatsApp', time: 'Hace 10s' },
    { type: 'read', user: 'Maria Garcia', channel: 'Email', time: 'Hace 45s' },
    { type: 'failed', user: 'Carlos Ruiz', channel: 'SMS', time: 'Hace 2m' },
    { type: 'delivered', user: 'Ana Lopez', channel: 'WhatsApp', time: 'Hace 5m' },
  ];

  templates: Record<string, string> = {
    'WhatsApp': 'Hola {{NOMBRE_COMPLETO}}, te saludamos de BankVision. Te recordamos que tu obligación {{NUM_OBLIGACION}} presenta un valor a pagar de {{VALOR_A_PAGAR}} con fecha de vencimiento {{FECHA_VENC}}. Evita recargos adicionales pagando aquí: {{LINK_PAGO}}',
    'SMS': 'BankVision: {{NOMBRE_COMPLETO}}, tu pago de {{VALOR_A_PAGAR}} vence el {{FECHA_VENC}}. Paga facil aqui: {{LINK_PAGO}}',
    'Email': 'Estimado(a) {{NOMBRE_COMPLETO}},\n\nEsperamos que te encuentres bien. Te informamos que tu estado de cuenta presenta un saldo pendiente por valor de {{VALOR_A_PAGAR}}.\n\nDetalles:\nObligación: {{NUM_OBLIGACION}}\nFecha Vencimiento: {{FECHA_VENC}}\n\nPuedes realizar tu pago de forma segura en el siguiente enlace: {{LINK_PAGO}}\n\nSi ya realizaste el pago, por favor haz caso omiso a este mensaje.',
    'Voz / VoIP': 'Hola {{NOMBRE_COMPLETO}}, tienes un recordatorio de pago pendiente por valor de {{VALOR_A_PAGAR}}. Presiona 1 para recibir el link de pago en tu celular o 2 para hablar con un asesor.',
  };

  currentText = signal('');

  constructor() {
    this.currentText.set(this.templates['WhatsApp']);

    effect(() => {
      const channel = this.activeChannel();
      this.currentText.set(this.templates[channel]);
    }, { allowSignalWrites: true });
  }

  handleSave() {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
    }, 1000);
  }

  getPreviewText() {
    let text = this.currentText();
    text = text.replace('{{NOMBRE_COMPLETO}}', 'Juan Pérez');
    text = text.replace('{{VALOR_A_PAGAR}}', '$150,000');
    text = text.replace('{{FECHA_VENC}}', '25/03/2024');
    text = text.replace('{{LINK_PAGO}}', 'https://bv.co/p/123');
    text = text.replace('{{NUM_OBLIGACION}}', 'OB-1234');
    return text;
  }
}
