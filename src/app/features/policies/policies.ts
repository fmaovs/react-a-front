import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Filter,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-angular';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './policies.html',
  styleUrl: './policies.css'
})
export class PoliciesComponent {
  activeTab = signal<'segments' | 'rules'>('segments');
  showAddSegment = signal(false);
  showAddRule = signal(false);

  readonly PlusIcon = Plus;
  readonly FilterIcon = Filter;
  readonly ClockIcon = Clock;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly AlertTriangleIcon = AlertTriangle;

  segments = signal([
    { name: 'Preventiva', criteria: 'Mora < 0 dias', intensity: 'Baja', color: 'bg-emerald-500' },
    { name: 'Administrativa', criteria: 'Mora 1 - 30 dias', intensity: 'Media', color: 'bg-blue-500' },
    { name: 'Temprana', criteria: 'Mora 31 - 60 dias', intensity: 'Alta', color: 'bg-amber-500' },
    { name: 'Especializada', criteria: 'Mora > 90 dias', intensity: 'Critica', color: 'bg-red-500' },
  ]);

  rules = signal([
    { rule: 'Ventana de Contacto L-V', value: '07:00 - 19:00', status: 'Activo', icon: this.ClockIcon },
    { rule: 'Ventana de Contacto Sabados', value: '08:00 - 15:00', status: 'Activo', icon: this.ClockIcon },
    { rule: 'Frecuencia Maxima Semanal', value: '2 contactos / canal', status: 'Activo', icon: this.AlertTriangleIcon },
    { rule: 'Exclusion Festivos', value: 'Habilitado', status: 'Activo', icon: this.ShieldCheckIcon },
  ]);

  newSegment = { name: '', criteria: '', intensity: 'Baja', color: 'bg-brand-accent' };
  newRule = { rule: '', value: '', status: 'Activo' };

  addSegment() {
    if (this.newSegment.name && this.newSegment.criteria) {
      this.segments.update(prev => [...prev, { ...this.newSegment }]);
      this.newSegment = { name: '', criteria: '', intensity: 'Baja', color: 'bg-brand-accent' };
      this.showAddSegment.set(false);
    }
  }

  addRule() {
    if (this.newRule.rule && this.newRule.value) {
      this.rules.update(prev => [...prev, { ...this.newRule, icon: this.ShieldCheckIcon }]);
      this.newRule = { rule: '', value: '', status: 'Activo' };
      this.showAddRule.set(false);
    }
  }
}
