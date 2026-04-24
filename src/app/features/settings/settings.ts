import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import {
  LucideAngularModule,
  Settings2,
  ShieldAlert,
  FileCode,
  Clock,
  Save,
  Plus,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Users,
  Lock,
  Shield,
  Mail,
  UserPlus,
  Briefcase
} from 'lucide-angular';

type TabId = 'policies' | 'rules' | 'case-statuses' | 'file-structure' | 'users';

interface Tab {
  id: TabId;
  label: string;
  icon: any;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent {
  store = inject(StoreService);
  activeTab = signal<TabId>('policies');
  isSaving = signal(false);

  readonly Settings2Icon = Settings2;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly FileCodeIcon = FileCode;
  readonly ClockIcon = Clock;
  readonly SaveIcon = Save;
  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly InfoIcon = Info;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly UsersIcon = Users;
  readonly LockIcon = Lock;
  readonly ShieldIcon = Shield;
  readonly MailIcon = Mail;
  readonly UserPlusIcon = UserPlus;
  readonly BriefcaseIcon = Briefcase;

  tabs: Tab[] = [
    { id: 'policies', label: 'Políticas & Score', icon: this.ShieldAlertIcon },
    { id: 'rules', label: 'Reglas de Negocio', icon: this.ClockIcon },
    { id: 'case-statuses', label: 'Estados de Casos', icon: this.BriefcaseIcon },
    { id: 'file-structure', label: 'Estructura de Archivo', icon: this.FileCodeIcon },
    { id: 'users', label: 'Gestión de Usuarios', icon: this.UsersIcon },
  ];

  // Policies sub-state
  riskLevels = signal([
    { level: 'Bajo', score: '700 - 1000', mora: '0 - 5 días', color: 'bg-emerald-500', action: 'Recordatorio suave' },
    { level: 'Medio', score: '400 - 699', mora: '6 - 30 días', color: 'bg-blue-500', action: 'Llamada informativa' },
    { level: 'Alto', score: '200 - 399', mora: '31 - 90 días', color: 'bg-amber-500', action: 'Negociación directa' },
    { level: 'Crítico', score: '0 - 199', mora: '> 90 días', color: 'bg-red-500', action: 'Cobro prejurídico' },
  ]);

  aiVariables = signal([
    { label: 'Historial de Pago', weight: 40 },
    { label: 'Días de Mora Actual', weight: 30 },
    { label: 'Frecuencia de Incumplimiento', weight: 20 },
    { label: 'Antigüedad del Asociado', weight: 10 },
  ]);

  // File structure sub-state
  fields = signal([
    { pos: '001-020', name: 'DOC_CLIENTE', type: 'Alfanumérico', req: 'Sí', desc: 'Identificador primario (Tipo + Número)' },
    { pos: '021-080', name: 'NOMBRE_COMPLETO', type: 'Alfanumérico', req: 'Sí', desc: 'Nombre para personalización' },
    { pos: '141-160', name: 'NUM_OBLIGACION', type: 'Alfanumérico', req: 'Sí', desc: 'Clave de la deuda' },
    { pos: '252-271', name: 'VALOR_A_PAGAR', type: 'Decimal', req: 'Sí', desc: 'Total exigible (Min + Com + Cargos)' },
  ]);

  // Users sub-state
  users = signal([
    { id: '1', name: 'Admin Principal', email: 'admin@fintra.co', role: 'Administrador', status: 'Activo', lastLogin: '2024-03-15 10:30' },
    { id: '2', name: 'Coordinador Cobranza', email: 'coord@fintra.co', role: 'Supervisor', status: 'Activo', lastLogin: '2024-03-15 09:15' },
    { id: '3', name: 'Agente Externo 01', email: 'agente01@externo.com', role: 'Agente', status: 'Bloqueado', lastLogin: '2024-03-10 16:45' },
  ]);

  handleSave() {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
    }, 1500);
  }

  removeRiskLevel(index: number) {
    this.riskLevels.update(prev => prev.filter((_, i) => i !== index));
  }

  removeUser(id: string) {
    this.users.update(prev => prev.filter(u => u.id !== id));
  }

  toggleUserStatus(id: string) {
    this.users.update(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Activo' ? 'Bloqueado' : 'Activo' } : u));
  }
}
