import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  LucideAngularModule,
  Database,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-angular';
import { IntegrationService, BatchScoreSummary } from './integration.service';
import { Batch } from '../../models/types';
import { StoreService } from '../../core/store/app-store.service';

@Component({
  selector: 'app-integration',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MatButtonModule],
  templateUrl: './integration.html',
  styleUrl: './integration.css'
})
export class IntegrationComponent implements OnInit {
  private integrationService = inject(IntegrationService);
  private store = inject(StoreService);

  isUploading = signal(false);
  isProcessing = signal<number | null>(null);
  progress = signal(0);
  uploadError = signal('');
  processResult = signal<BatchScoreSummary | null>(null);
  processError = signal('');
  realBatches = signal<Batch[]>([]);

  readonly DatabaseIcon = Database;
  readonly UploadIcon = Upload;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;
  readonly ArrowRightIcon = ArrowRight;

  endpoints = [
    { path: '/api/integration/batches/csv/upload', method: 'POST', status: 200, time: 'Activo' },
    { path: '/api/scoring/config/models/active', method: 'GET', status: 200, time: 'Activo' },
    { path: '/api/scoring/batch/{batchId}/calculate', method: 'POST', status: 200, time: 'Activo' },
  ];

  ngOnInit() {
    this.loadBatches();
  }

  loadBatches() {
    this.integrationService.getBatches().subscribe({
      next: response => {
        // API returns a Page object or Array
        const batches = response.content || response;
        this.realBatches.set(batches);
      },
      error: err => {
        this.realBatches.set([]);
        this.uploadError.set(err?.error?.message || 'No fue posible consultar los lotes');
      }
    });
  }

  handleFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.uploadError.set('');
    this.isUploading.set(true);
    this.progress.set(30);
    this.integrationService.uploadBatch(file).subscribe({
      next: (response) => {
        this.processResult.set(response);

        if (response?.status === 'FAILED' || response?.status === 'ERROR') {
          this.isUploading.set(false);
          this.progress.set(0);
          this.uploadError.set(response?.message || 'No fue posible procesar el lote');
          this.loadBatches();
          return;
        }

        this.progress.set(100);
        setTimeout(() => {
          this.isUploading.set(false);
          this.loadBatches();
        }, 1000);
      },
      error: (err) => {
        this.isUploading.set(false);
        this.progress.set(0);
        this.uploadError.set(
          err?.error?.message ||
          'Error procesando lote. Verifique que exista al menos un asesor activo.'
        );
        this.loadBatches();
      }
    });
  }

  promoteBatch(id: number) {
    this.integrationService.promoteBatch(id).subscribe(() => {
      this.loadBatches();
      this.store.refreshData();
    });
  }

  processBatch(id: number) {
    this.processResult.set(null);
    this.processError.set('');
    this.isProcessing.set(id);
    this.integrationService.processBatch(id).subscribe({
      next: result => {
        this.isProcessing.set(null);
        this.processResult.set(result);
        this.loadBatches();
        this.store.refreshData();
      },
      error: err => {
        this.isProcessing.set(null);
        this.processError.set(err?.error?.message || 'Error al procesar el lote completo.');
        this.loadBatches();
      }
    });
  }

  private readonly batchStatusLabels: Record<string, string> = {
    COMPLETED:  'Completado',
    PROMOTED:   'Promovido',
    PROCESSING: 'Procesando',
    VALIDATING: 'Validando',
    VALIDATED:  'Validado',
    FAILED:     'Fallido',
    UPLOADED:   'Cargado',
    STAGING:    'En espera',
  };

  getBatchStatusLabel(status: string): string {
    return this.batchStatusLabels[status] ?? status;
  }
}
