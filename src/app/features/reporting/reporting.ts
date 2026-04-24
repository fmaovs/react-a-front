import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  BarChart3,
  PieChart as PieIcon,
  Download,
  Calendar,
  History,
  ShieldCheck
} from 'lucide-angular';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './reporting.html',
  styleUrl: './reporting.css'
})
export class ReportingComponent {
  readonly BarChart3Icon = BarChart3;
  readonly PieIcon = PieIcon;
  readonly DownloadIcon = Download;
  readonly CalendarIcon = Calendar;
  readonly HistoryIcon = History;
  readonly ShieldCheckIcon = ShieldCheck;

  channelEffectiveness = [
    { name: 'WhatsApp', value: 75, color: '#10989B' },
    { name: 'Llamada', value: 62, color: '#055177' },
    { name: 'Email', value: 45, color: '#0A3B4E' },
    { name: 'SMS', value: 38, color: '#001822' },
  ];

  dailyRecovery = [
    { day: 'Lun', amount: 4500000 },
    { day: 'Mar', amount: 5200000 },
    { day: 'Mie', amount: 3800000 },
    { day: 'Jue', amount: 6100000 },
    { day: 'Vie', amount: 7500000 },
    { day: 'Sab', amount: 2100000 },
  ];

  auditLogs = [
    { user: 'Admin_Camilo', action: 'Modificó Política de Riesgo Alto', date: 'Hace 2 horas', type: 'Config' },
    { user: 'System_IA', action: 'Actualizó pesos de scoring v3.2', date: 'Hace 5 horas', type: 'Model' },
    { user: 'Supervisor_Elena', action: 'Aprobó excepción de cobro #992', date: 'Ayer', type: 'Auth' },
  ];
}
