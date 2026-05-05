import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from './dashboard.service';
import {
  DashboardSummary,
  SegmentBreakdown,
  AgingBucket,
  RiskDistribution,
} from '../../models/types';
import {
  LucideAngularModule,
  Database, BarChart3, Briefcase, Users, FileText, CreditCard,
  RefreshCw
} from 'lucide-angular';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsCoreOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, BarChart, LineChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  readonly DatabaseIcon = Database;
  readonly BarChart3Icon = BarChart3;
  readonly BriefcaseIcon = Briefcase;
  readonly UsersIcon = Users;
  readonly FileTextIcon = FileText;
  readonly CreditCardIcon = CreditCard;
  readonly RefreshIcon = RefreshCw;

  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);

  segmentChartOptions = computed<EChartsCoreOption>(() => {
    const data = (this.summary()?.portfolioBySegment ?? []).map((s: SegmentBreakdown) => ({
      name: this.normalizeSegmentLabel(s.segment),
      value: Number(s.totalAmount)
    }));

    return {
      color: ['#2563eb', '#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'],
      tooltip: { trigger: 'item', formatter: (p: any) => `${p.name}<br/>${this.fmtCurrency(p.value)} (${p.percent}%)` },
      legend: { bottom: 0, icon: 'circle', textStyle: { color: '#64748b', fontSize: 11 } },
      series: [
        {
          name: 'Segmentos',
          type: 'pie',
          radius: ['48%', '72%'],
          center: ['50%', '44%'],
          label: { formatter: '{d}%', color: '#334155', fontSize: 11 },
          data
        }
      ]
    };
  });

  riskChartOptions = computed<EChartsCoreOption>(() => {
    const data = (this.summary()?.riskDistribution ?? []).map((r: RiskDistribution) => ({
      name: r.label || r.riskLevel,
      value: Number(r.clientCount)
    }));

    return {
      color: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
      tooltip: { trigger: 'item', formatter: (p: any) => `${p.name}<br/>${p.value} clientes (${p.percent}%)` },
      legend: { bottom: 0, icon: 'circle', textStyle: { color: '#64748b', fontSize: 11 } },
      series: [
        {
          name: 'Riesgo',
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '44%'],
          label: { show: true, formatter: '{b}: {d}%', fontSize: 10 },
          data
        }
      ]
    };
  });

  agingChartOptions = computed<EChartsCoreOption>(() => {
    const data = this.summary()?.agingAnalysis ?? [];
    return {
      color: ['#2563eb'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (items: any[]) => {
          const item = items?.[0];
          const row = data[item?.dataIndex ?? -1];
          if (!row) return '';
          return `${row.bucket}<br/>Monto: ${this.fmtCurrency(Number(row.totalAmount))}<br/>Obligaciones: ${row.obligationCount}`;
        }
      },
      grid: { left: 40, right: 10, top: 20, bottom: 55 },
      xAxis: {
        type: 'category',
        data: data.map((b: AgingBucket) => b.bucket),
        axisLabel: { color: '#64748b', interval: 0 }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#64748b',
          formatter: (v: number) => this.fmtCompact(v)
        },
        splitLine: { lineStyle: { color: '#e5e7eb' } }
      },
      series: [
        {
          type: 'bar',
          barWidth: '46%',
          data: data.map((b: AgingBucket) => Number(b.totalAmount)),
          itemStyle: { borderRadius: [8, 8, 0, 0] }
        }
      ]
    };
  });

   advisorChartOptions = computed<EChartsCoreOption>(() => {
     const advisors = this.summary()?.advisorMetrics ?? [];
     
     // Ordenar por total asignado descendente y tomar top 8
     const topAdvisors = [...advisors]
       .sort((a, b) => b.totalAssigned - a.totalAssigned)
       .slice(0, 8);

     const colors = ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'];
     
     return {
       tooltip: {
         trigger: 'item',
         formatter: (p: any) => {
           const advisor = topAdvisors.find(a => a.advisorName === p.name);
           if (!advisor) return '';
           const escalationRate = advisor.totalAssigned > 0 
             ? Math.round((advisor.escalatedCases / advisor.totalAssigned) * 100) 
             : 0;
           return `<b>${advisor.advisorName}</b><br/>Casos: ${advisor.totalAssigned}<br/>Escalados: ${advisor.escalatedCases} (${escalationRate}%)`;
         }
       },
       grid: { left: 120, right: 20, top: 20, bottom: 20 },
       xAxis: {
         type: 'value',
         axisLabel: { color: '#64748b', fontSize: 11 },
         splitLine: { lineStyle: { color: '#e5e7eb' } }
       },
       yAxis: {
         type: 'category',
         data: topAdvisors.map(a => a.advisorName),
         axisLabel: { color: '#475569', fontSize: 12, fontWeight: 'bold' }
       },
       series: [
         {
           type: 'bar',
           name: 'Casos Asignados',
           data: topAdvisors.map(a => a.totalAssigned),
           itemStyle: {
             borderRadius: [0, 8, 8, 0],
             color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
               { offset: 0, color: '#3b82f6' },
               { offset: 1, color: '#1d4ed8' }
             ])
           },
           label: {
             show: true,
             position: 'right',
             color: '#1e293b',
             fontSize: 11,
             fontWeight: 'bold'
           }
         }
       ]
     };
   });

   batchesLineChartOptions = computed<EChartsCoreOption>(() => {
     const data = (this.summary()?.recentBatches ?? []).slice().reverse();
     return {
       color: ['#7c3aed'],
       tooltip: {
         trigger: 'axis',
         formatter: (items: any[]) => {
           const item = items?.[0];
           const row = data[item?.dataIndex ?? -1];
           if (!row) return '';
           return `${row.batchNumber}<br/>Exitosos: ${row.successfulRecords}/${row.totalRecords}<br/>Fecha: ${this.fmtDate(row.createdAt)}`;
         }
       },
       grid: { left: 35, right: 10, top: 15, bottom: 45 },
       xAxis: {
         type: 'category',
         data: data.map(b => this.fmtShortDate(b.createdAt)),
         axisLabel: { color: '#64748b', fontSize: 10 }
       },
       yAxis: {
         type: 'value',
         axisLabel: { color: '#64748b' },
         splitLine: { lineStyle: { color: '#e5e7eb' } }
       },
       series: [
         {
           type: 'line',
           smooth: true,
           symbol: 'circle',
           symbolSize: 7,
           areaStyle: { opacity: 0.12 },
           data: data.map(b => b.successfulRecords)
         }
       ]
     };
   });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.dashboardService.getSummary().subscribe({
      next: s => {
        this.summary.set(s);
        this.loading.set(false);
      },
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
      { label: 'Cartera total', value: this.fmtCurrency(k.totalPortfolioValue), icon: this.DatabaseIcon, color: 'blue' },
      { label: 'Clientes con mora', value: (k.clientsInDefault ?? 0).toLocaleString(), icon: this.UsersIcon, color: 'red' },
      { label: 'Casos activos', value: activeCases.toLocaleString(), icon: this.BriefcaseIcon, color: 'amber' },
      { label: 'Tasa de recuperacion', value: `${recoveryPct}%`, icon: this.BarChart3Icon, color: 'emerald' },
      { label: 'Acuerdos de pago activos', value: (k.activePaymentAgreements ?? 0).toLocaleString(), icon: this.CreditCardIcon, color: 'violet' },
      { label: 'Lotes del mes', value: (k.batchesThisMonth ?? 0).toLocaleString(), icon: this.FileTextIcon, color: 'cyan' }
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

  private batchStatusColors: Record<string, string> = {
    COMPLETED: 'status-ok',
    PROMOTED: 'status-ok',
    PROCESSING: 'status-in-progress',
    VALIDATING: 'status-in-progress',
    FAILED: 'status-error',
    UPLOADED: 'status-pending',
    STAGING: 'status-pending'
  };

  batchClass(status: string): string {
    return this.batchStatusColors[status] ?? '';
  }

  formatCurrency(v: number): string {
    if (!v) return '$0';
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    return `$${v.toLocaleString()}`;
  }

  fmtCurrency(v: number): string {
    return this.formatCurrency(v);
  }

  fmtDate(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private fmtShortDate(d: string): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' });
  }

  private fmtCompact(v: number): string {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return `${v}`;
  }

  private normalizeSegmentLabel(segment: string): string {
    if (!segment) return 'Prejuridica';

    const normalized = segment.toUpperCase();
    if (normalized === 'JURIDICA' || normalized === 'JUDICIAL' || normalized === 'JURIDICO') {
      return 'Prejuridica';
    }

    if (normalized === 'PREJUDICIAL') {
      return 'Prejuridica';
    }

    return segment;
  }
}
