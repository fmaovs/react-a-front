import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { DashboardSummary } from '../../models/types';
import {
  LucideAngularModule,
  Database, BarChart3, Briefcase, Users, FileText, CreditCard,
  AlertTriangle, Clock, RefreshCw
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  readonly DatabaseIcon    = Database;
  readonly BarChart3Icon   = BarChart3;
  readonly BriefcaseIcon   = Briefcase;
  readonly UsersIcon       = Users;
  readonly FileTextIcon    = FileText;
  readonly CreditCardIcon  = CreditCard;
  readonly AlertIcon       = AlertTriangle;
  readonly ClockIcon       = Clock;
  readonly RefreshIcon     = RefreshCw;

  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.dashboardService.getSummary().subscribe({
      next: s  => { this.summary.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  kpiCards = computed(() => {
    const k = this.summary()?.kpis;
    if (!k) return [];
    const activeCases = (k.openCases ?? 0) + (k.inProgressCases ?? 0) + (k.escalatedCases ?? 0);
    const recoveryPct = k.totalCases > 0
      ? ((k.resolvedCases / k.totalCases) * 100).toFixed(1)
      : '0.0';
    return [
      { label: 'Cartera Total',      value: this.fmtCurrency(k.totalPortfolioValue), icon: this.DatabaseIcon,   color: 'blue'    },
      { label: 'Clientes en Mora',   value: (k.clientsInDefault ?? 0).toLocaleString(), icon: this.UsersIcon,   color: 'red'     },
      { label: 'Casos Activos',      value: activeCases.toLocaleString(),             icon: this.BriefcaseIcon, color: 'amber'   },
      { label: 'Tasa Recuperación',  value: `${recoveryPct}%`,                        icon: this.BarChart3Icon, color: 'emerald' },
      { label: 'Acuerdos de Pago',   value: (k.activePaymentAgreements ?? 0).toLocaleString(), icon: this.CreditCardIcon, color: 'violet' },
      { label: 'Lotes este Mes',     value: (k.batchesThisMonth ?? 0).toLocaleString(), icon: this.FileTextIcon, color: 'cyan'   },
    ];
  });

  advisorLoad = computed(() => {
    const list = this.summary()?.advisorMetrics ?? [];
    const max = Math.max(...list.map(a => a.totalAssigned), 1);
    return list.map(a => ({
      ...a,
      percentage: Math.round((a.totalAssigned / max) * 100),
      initials: a.advisorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    }));
  });

  agingBuckets = computed(() => {
    const buckets = this.summary()?.agingAnalysis ?? [];
    const max = Math.max(...buckets.map(b => b.percentageOfPortfolio), 0.01);
    return buckets.map(b => ({ ...b, barWidth: (b.percentageOfPortfolio / max) * 100 }));
  });

  private riskColors: Record<string, string> = {
    BAJO: 'risk-low', MEDIO: 'risk-medium', ALTO: 'risk-high', CRITICO: 'risk-critical'
  };

  private batchStatusColors: Record<string, string> = {
    COMPLETED: 'status-ok', PROMOTED: 'status-ok', PROCESSING: 'status-in-progress',
    VALIDATING: 'status-in-progress', FAILED: 'status-error', UPLOADED: 'status-pending',
    STAGING: 'status-pending'
  };

  riskClass(level: string): string  { return this.riskColors[level] ?? ''; }
  batchClass(status: string): string { return this.batchStatusColors[status] ?? ''; }

  fmtCurrency(v: number): string {
    if (!v) return '$0';
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000)     return `$${(v / 1_000_000).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
  }

  fmtDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
