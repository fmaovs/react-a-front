import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { StoreService } from '../../core/store/app-store.service';
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

  metrics = signal<any>(null);
  dailyCollections = signal<any[]>([]);

  ngOnInit() {
    this.dashboardService.getMetrics().subscribe(m => this.metrics.set(m));
    this.dashboardService.getDailyCollections().subscribe(data => this.dailyCollections.set(data));
  }

  riskData = computed(() => {
    const m = this.metrics();
    if (!m || !m.riskDistribution) return [];

    return Object.entries(m.riskDistribution).map(([name, value]) => ({
      name,
      value: Number(value),
      color: this.getRiskColor(name)
    }));
  });

  recoveryTrend = computed(() => {
    const m = this.metrics();
    if (!m || !m.monthlyRecovery) return [];

    return Object.entries(m.monthlyRecovery).map(([month, recovery]) => ({
      month,
      recovery: Number(recovery),
      goal: 80 // Hardcoded goal for UI reference only
    }));
  });

  private getRiskColor(risk: string): string {
    switch(risk.toLowerCase()) {
      case 'bajo': return '#10989B';
      case 'medio': return '#055177';
      case 'alto': return '#0A3B4E';
      case 'crítico': return '#001822';
      default: return '#cbd5e1';
    }
  }
}
