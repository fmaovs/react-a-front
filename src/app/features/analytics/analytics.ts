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

  private readonly riskOrder: Record<string, number> = {
    CRITICO: 0, ALTO: 1, MEDIO: 2, BAJO: 3
  };

  sortedAssociates = computed(() =>
    [...this.store.associates()].sort((a, b) => {
      const ra = this.riskOrder[(a.risk ?? '').toUpperCase()] ?? 4;
      const rb = this.riskOrder[(b.risk ?? '').toUpperCase()] ?? 4;
      if (ra !== rb) return ra - rb;
      return (b.creditScore ?? 0) - (a.creditScore ?? 0);
    })
  );

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
        return '#22c55e';
      case 'medio':
        return '#eab308';
      case 'alto':
        return '#f97316';
      case 'critico':
        return '#ef4444';
      default:
        return '#cbd5e1';
    }
  }
}
