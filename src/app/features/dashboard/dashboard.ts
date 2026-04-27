import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { DashboardService } from '../../services/dashboard.service';
import { MatButtonModule } from '@angular/material/button';
import { DashboardMetrics } from '../../models/types';
import {
  LucideAngularModule,
  Database,
  BarChart3,
  Briefcase,
  MessageSquare
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  store = inject(StoreService);
  private dashboardService = inject(DashboardService);

  readonly DatabaseIcon = Database;
  readonly BarChart3Icon = BarChart3;
  readonly BriefcaseIcon = Briefcase;
  readonly MessageSquareIcon = MessageSquare;

  metrics = signal<DashboardMetrics | null>(null);

  agents = ['Agente 01', 'Agente 02', 'Agente 03', 'Agente 04'];

  ngOnInit() {
    this.dashboardService.getMetrics().subscribe({
      next: (m) => this.metrics.set(m),
      error: (err) => console.error('Error fetching dashboard metrics', err)
    });
  }

  agentLoad = computed(() => {
    const cases = this.store.cases();
    return this.agents.map(agent => {
      const count = cases.filter(c => c.assignedTo === agent).length;
      const percentage = cases.length > 0 ? (count / cases.length) * 100 : 0;
      return {
        name: agent,
        count,
        percentage,
        initials: agent.split(' ')[1] || 'AG'
      };
    });
  });

  stats = computed(() => {
    const m = this.metrics();
    if (!m) {
      // Fallback while loading
      return [
        { label: 'Cartera Total', value: '$0', change: '', icon: this.DatabaseIcon, color: 'blue' },
        { label: 'Tasa de Recuperación', value: '0%', change: '', icon: this.BarChart3Icon, color: 'emerald' },
        { label: 'Casos Activos', value: '0', change: '', icon: this.BriefcaseIcon, color: 'amber' },
        { label: 'Recaudo Diario', value: '$0', change: '', icon: this.MessageSquareIcon, color: 'violet' },
      ];
    }

    return [
      { label: 'Cartera Total', value: this.formatCurrency(m.totalPortfolioValue), change: '', icon: this.DatabaseIcon, color: 'blue' },
      { label: 'Tasa de Recuperación', value: `${(m.recoveryRate * 100).toFixed(1)}%`, change: '', icon: this.BarChart3Icon, color: 'emerald' },
      { label: 'Casos Activos', value: m.activeCases.toLocaleString(), change: '', icon: this.BriefcaseIcon, color: 'amber' },
      { label: 'Recaudo Diario', value: this.formatCurrency(m.dailyCollections), change: '', icon: this.MessageSquareIcon, color: 'violet' },
    ];
  });

  private formatCurrency(value: number): string {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  }
}
