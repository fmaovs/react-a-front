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
import { IntegrationService } from '../../services/integration.service';
import { Batch } from '../../models/types';
import { StoreService } from '../../services/store.service';

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
  progress = signal(0);
  realBatches = signal<Batch[]>([]);

  readonly DatabaseIcon = Database;
  readonly UploadIcon = Upload;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;
  readonly ArrowRightIcon = ArrowRight;

  endpoints = [
    { path: '/api/integration/batches', method: 'POST', status: 200, time: 'Activo' },
    { path: '/api/portfolio/clients', method: 'GET', status: 200, time: 'Activo' },
    { path: '/api/management/cases', method: 'GET', status: 200, time: 'Activo' },
  ];

  ngOnInit() {
    this.loadBatches();
  }

  loadBatches() {
    this.integrationService.getBatches().subscribe(response => {
      // API returns a Page object or Array
      const batches = response.content || response;
      this.realBatches.set(batches);
    });
  }

  handleFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.isUploading.set(true);
    this.progress.set(30);
    this.integrationService.uploadBatch(file).subscribe({
      next: () => {
        this.progress.set(100);
        setTimeout(() => {
          this.isUploading.set(false);
          this.loadBatches();
        }, 1000);
      },
      error: () => {
        this.isUploading.set(false);
        this.progress.set(0);
      }
    });
  }

  promoteBatch(id: number) {
    this.integrationService.promoteBatch(id).subscribe(() => {
      this.loadBatches();
      // After promotion, new clients/obligations/cases should appear
      this.store.refreshData();
    });
  }
}
