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

  stats = [
    { label: 'Cartera Total', value: '$1.2B', change: '+2.4%', icon: this.DatabaseIcon, color: 'blue' },
    { label: 'Tasa de Recuperación', value: '78.5%', change: '+5.2%', icon: this.BarChart3Icon, color: 'emerald' },
    { label: 'Casos Activos', value: '1,240', change: '-12', icon: this.BriefcaseIcon, color: 'amber' },
    { label: 'Efectividad Contacto', value: '64.2%', change: '+1.8%', icon: this.MessageSquareIcon, color: 'violet' },
  ];
}
