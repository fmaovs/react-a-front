import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
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
export class AnalyticsComponent {
  store = inject(StoreService);

  readonly BrainIcon = Brain;
  readonly TrendingUpIcon = TrendingUp;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly TargetIcon = Target;

  riskData = computed(() => {
    const associates = this.store.associates();
    const counts = associates.reduce((acc, a) => {
      acc[a.risk] = (acc[a.risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Bajo', value: counts['Bajo'] || 0, color: '#10989B' },
      { name: 'Medio', value: counts['Medio'] || 0, color: '#055177' },
      { name: 'Alto', value: counts['Alto'] || 0, color: '#0A3B4E' },
      { name: 'Crítico', value: counts['Crítico'] || 0, color: '#001822' },
    ];
  });

  recoveryTrend = [
    { month: 'Ene', recovery: 65, goal: 70 },
    { month: 'Feb', recovery: 72, goal: 70 },
    { month: 'Mar', recovery: 78, goal: 75 },
    { month: 'Abr', recovery: 85, goal: 80 },
  ];
}
