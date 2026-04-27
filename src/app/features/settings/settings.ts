import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StoreService } from '../../services/store.service';
import { UserService } from '../../services/user.service';
import { User, UserCreateRequest, UserUpdateRequest } from '../../models/types';
import { UserModalComponent } from '../../shared/components/user-modal/user-modal';
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
  imports: [CommonModule, FormsModule, LucideAngularModule, MatDialogModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  store = inject(StoreService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

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
  realUsers = signal<User[]>([]);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.realUsers.set(users);
    });
  }

  handleSave() {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
    }, 1500);
  }

  removeRiskLevel(index: number) {
    this.riskLevels.update(prev => prev.filter((_, i) => i !== index));
  }

  removeUser(id: number) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  addUser() {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const request: UserCreateRequest = {
          username: result.username,
          email: result.email,
          fullName: result.fullName,
          password: result.password,
          roleId: result.roleId
        };
        this.userService.createUser(request).subscribe(() => this.loadUsers());
      }
    });
  }

  editUser(user: User) {
    const dialogRef = this.dialog.open(UserModalComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user.id) {
        const request: UserUpdateRequest = {
          email: result.email,
          fullName: result.fullName,
          roleId: result.roleId,
          status: result.status
        };
        this.userService.updateUser(user.id, request).subscribe(() => this.loadUsers());
      }
    });
  }
}
