import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { MatButtonModule } from '@angular/material/button';
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
export class DashboardComponent {
  store = inject(StoreService);

  readonly DatabaseIcon = Database;
  readonly BarChart3Icon = BarChart3;
  readonly BriefcaseIcon = Briefcase;
  readonly MessageSquareIcon = MessageSquare;

  agents = ['Agente 01', 'Agente 02', 'Agente 03', 'Agente 04'];

  agentLoad = computed(() => {
    const cases = this.store.cases();
    return this.agents.map(agent => {
      const count = cases.filter(c => c.assignedTo === agent).length;
      const percentage = cases.length > 0 ? (count / cases.length) * 100 : 0;
      return {
        name: agent,
        count,
        percentage,
        initials: agent.split(' ')[1]
      };
    });
  });

  totalBalance = computed(() => {
    return this.store.associates().reduce((sum, a) => sum + a.balance, 0);
  });

  activeCasesCount = computed(() => this.store.cases().length);

  stats = computed(() => [
    { label: 'Cartera Total', value: this.formatCurrency(this.totalBalance()), change: '', icon: this.DatabaseIcon, color: 'blue' },
    { label: 'Tasa de Recuperación', value: '78.5%', change: '', icon: this.BarChart3Icon, color: 'emerald' },
    { label: 'Casos Activos', value: this.activeCasesCount().toLocaleString(), change: '', icon: this.BriefcaseIcon, color: 'amber' },
    { label: 'Efectividad Contacto', value: '64.2%', change: '', icon: this.MessageSquareIcon, color: 'violet' },
  ]);

  private formatCurrency(value: number): string {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  }
}
