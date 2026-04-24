import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Database,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-angular';

@Component({
  selector: 'app-integration',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './integration.html',
  styleUrl: './integration.css'
})
export class IntegrationComponent {
  isUploading = signal(false);
  progress = signal(0);

  readonly DatabaseIcon = Database;
  readonly UploadIcon = Upload;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;
  readonly ArrowRightIcon = ArrowRight;

  endpoints = [
    { path: '/api/v1/cartera/sync', method: 'POST', status: 200, time: 'Hace 2 min' },
    { path: '/api/v1/pagos/notificar', method: 'POST', status: 200, time: 'Hace 5 min' },
    { path: '/api/v1/asociados/perfil', method: 'GET', status: 200, time: 'Hace 12 min' },
  ];

  batches = [
    { name: 'Lote_Marzo_Q1.txt', records: 12500, errors: 0, date: '15 Mar 2024', status: 'Exitoso' },
    { name: 'Novedades_Nomina.csv', records: 4200, errors: 12, date: '14 Mar 2024', status: 'Parcial' },
    { name: 'Ajustes_Saldos_V2.txt', records: 850, errors: 0, date: '12 Mar 2024', status: 'Exitoso' },
  ];

  simulateUpload() {
    this.isUploading.set(true);
    this.progress.set(0);
    const interval = setInterval(() => {
      this.progress.update(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => this.isUploading.set(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  }
}
