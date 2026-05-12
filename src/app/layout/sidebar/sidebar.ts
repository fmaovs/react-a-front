import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  LucideAngularModule,
  LayoutDashboard,
  Database,
  BarChart3,
  Settings2,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Menu,
  X
} from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  authService = inject(AuthService);
  isSidebarOpen = signal(true);

  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly DatabaseIcon = Database;
  readonly BarChart3Icon = BarChart3;
  readonly Settings2Icon = Settings2;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly BriefcaseIcon = Briefcase;
  readonly DollarSignIcon = DollarSign;
  readonly MenuIcon = Menu;
  readonly XIcon = X;

  modules = [
    { id: 'dashboard', name: 'Dashboard General',           icon: this.LayoutDashboardIcon, path: '/dashboard' },
    { id: 'm1',        name: 'M1. Integración',             icon: this.DatabaseIcon,        path: '/integration' },
    { id: 'm2',        name: 'M2. Analítica',               icon: this.BarChart3Icon,       path: '/analytics' },
    { id: 'm3',        name: 'M3. Reglas de Contacto',      icon: this.ShieldCheckIcon,     path: '/contact-rules' },
    { id: 'm4',        name: 'M4. Gestión de Casos',        icon: this.BriefcaseIcon,       path: '/cases' },
    { id: 'm5',        name: 'M5. Recaudo',                 icon: this.DollarSignIcon,      path: '/recaudo' },
    { id: 'm6',        name: 'M6. Reporting',               icon: this.BarChart3Icon,       path: '/reporting' },
    { id: 'settings',  name: 'Configuración',               icon: this.Settings2Icon,       path: '/settings' },
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }
}
