import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { StoreService } from '../../core/store/app-store.service';
import { DashboardSummary } from '../../models/types';
import {
  LucideAngularModule,
  Brain,
  TrendingUp,
  ShieldAlert,
  Target
} from 'lucide-angular';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  store = inject(StoreService);

  readonly BrainIcon = Brain;
  readonly TrendingUpIcon = TrendingUp;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly TargetIcon = Target;

  summary = signal<DashboardSummary | null>(null);

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: summary => this.summary.set(summary),
      error: () => this.summary.set(null)
    });
  }

  riskData = computed(() => {
    const riskDistribution = this.summary()?.riskDistribution ?? [];
    if (riskDistribution.length === 0) return [];

    return riskDistribution.map(item => ({
      name: item.label || item.riskLevel,
      value: item.clientCount,
      color: this.getRiskColor(item.riskLevel)
    }));
  });

  riskTotal = computed(() => this.riskData().reduce((acc, item) => acc + item.value, 0));

  caseStats = computed(() => {
    const kpis = this.summary()?.kpis;
    const byStatus = this.summary()?.casesByStatus ?? [];
    return {
      total: kpis?.totalCases ?? 0,
      byStatus
    };
  });

  recoveryTrend = computed(() => {
    const batches = this.summary()?.recentBatches ?? [];
    if (batches.length === 0) return [];

    return batches.slice(0, 4).map(batch => ({
      month: batch.fileName || batch.batchNumber,
      recovery: batch.successfulRecords,
      goal: batch.totalRecords
    }));
  });

  private getRiskColor(risk: string): string {
    switch (risk.toLowerCase()) {
      case 'bajo':
        return '#10989B';
      case 'medio':
        return '#055177';
      case 'alto':
        return '#0A3B4E';
      case 'critico':
        return '#001822';
      default:
        return '#cbd5e1';
    }
  }
}
