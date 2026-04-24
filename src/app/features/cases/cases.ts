import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import {
  LucideAngularModule,
  Briefcase,
  UserCheck,
  Calendar,
  DollarSign,
  FileText,
  MoreVertical,
  ExternalLink,
  Filter
} from 'lucide-angular';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cases.html',
  styleUrl: './cases.css'
})
export class CasesComponent {
  store = inject(StoreService);

  readonly BriefcaseIcon = Briefcase;
  readonly UserCheckIcon = UserCheck;
  readonly CalendarIcon = Calendar;
  readonly DollarSignIcon = DollarSign;
  readonly FileTextIcon = FileText;
  readonly MoreVerticalIcon = MoreVertical;
  readonly ExternalLinkIcon = ExternalLink;
  readonly FilterIcon = Filter;

  stats = [
    { label: 'Casos Pendientes', value: '450', color: 'bg-blue-500' },
    { label: 'Promesas de Pago', value: '125', color: 'bg-emerald-500' },
    { label: 'Acuerdos Incumplidos', value: '12', color: 'bg-red-500' },
    { label: 'Casos en Gestión', value: '84', color: 'bg-brand-accent' },
  ];

  logs = [
    { user: 'Asesor 01', action: 'Registró promesa de pago', target: 'Lucía Méndez', time: 'Hace 5m' },
    { user: 'Sistema IA', action: 'Desbordó caso por alto riesgo', target: 'Fernando Soto', time: 'Hace 12m' },
    { user: 'Asesor 03', action: 'Adjuntó evidencia de contacto', target: 'Roberto Jaramillo', time: 'Hace 25m' },
    { user: 'Sistema IA', action: 'Cerró caso por recaudo exitoso', target: 'Elena Rivas', time: 'Hace 1h' },
  ];

  getStatusInfo(statusId: string) {
    return this.store.caseStatuses().find(s => s.id === statusId) || { name: statusId, color: '#64748b' };
  }

  getAssociate(id: string) {
    return this.store.associates().find(a => a.id === id);
  }
}
