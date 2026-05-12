import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  LucideAngularModule,
  BarChart3,
  PieChart as PieIcon,
  Download,
  Calendar,
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-angular';
import { AdminService } from '../../shared/services/admin.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { AuditLog } from '../../models/types';
import { environment } from '../../../environments/environment';

export interface ChannelEffectiveness {
  canal: string;
  totalEnviados: number;
  totalFallidos: number;
  contactosExitosos: number;
  efectividadPct: number;
  canalMayorRecuperacion: boolean;
}

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './reporting.html',
  styleUrl: './reporting.css'
})
export class ReportingComponent implements OnInit {
  private adminService = inject(AdminService);
  private dashboardService = inject(DashboardService);
  private http = inject(HttpClient);

  readonly BarChart3Icon = BarChart3;
  readonly PieIcon = PieIcon;
  readonly DownloadIcon = Download;
  readonly CalendarIcon = Calendar;
  readonly HistoryIcon = History;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly TrendingUpIcon = TrendingUp;
  readonly AwardIcon = Award;

  readonly PAGE_SIZE = 5;

  realAuditLogs = signal<AuditLog[]>([]);
  recentBatches = signal<any[]>([]);
  channelEffectiveness = signal<ChannelEffectiveness[]>([]);
  isLoadingEffectiveness = signal(false);

  // Paginación audit logs
  auditPage = signal(0);
  totalAuditLogs = signal(0);
  isLoadingAudit = signal(false);

  totalAuditPages = computed(() => Math.max(1, Math.ceil(this.totalAuditLogs() / this.PAGE_SIZE)));

  batchTimeline = computed(() => {
    const data = this.recentBatches();
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      day: item.fileName || item.batchNumber,
      amount: item.successfulRecords ?? item.totalRecords ?? 0
    }));
  });

  bestChannel = computed(() => {
    const list = this.channelEffectiveness();
    if (!list.length) return null;
    return list.reduce((best, cur) => cur.efectividadPct > best.efectividadPct ? cur : best, list[0]);
  });

  ngOnInit() {
    this.loadAuditLogs();
    this.dashboardService.getSummary().subscribe(summary => {
      this.recentBatches.set(summary.recentBatches ?? []);
    });
    this.loadChannelEffectiveness();
  }

  loadAuditLogs() {
    this.isLoadingAudit.set(true);
    this.adminService.getAuditLogsPaged(this.auditPage(), this.PAGE_SIZE).subscribe({
      next: page => {
        this.realAuditLogs.set(page.content ?? []);
        this.totalAuditLogs.set(page.totalElements ?? 0);
        this.isLoadingAudit.set(false);
      },
      error: () => this.isLoadingAudit.set(false)
    });
  }

  prevAuditPage() {
    if (this.auditPage() > 0) {
      this.auditPage.update(p => p - 1);
      this.loadAuditLogs();
    }
  }

  nextAuditPage() {
    if (this.auditPage() < this.totalAuditPages() - 1) {
      this.auditPage.update(p => p + 1);
      this.loadAuditLogs();
    }
  }

  loadChannelEffectiveness() {
    this.isLoadingEffectiveness.set(true);
    this.http.get<ChannelEffectiveness[]>(`${environment.apiUrl}/reporting/channel-effectiveness`).subscribe({
      next: data => {
        this.channelEffectiveness.set(data);
        this.isLoadingEffectiveness.set(false);
      },
      error: () => {
        // Fallback con datos ilustrativos si el endpoint no responde
        this.channelEffectiveness.set([
          { canal: 'SMS',       totalEnviados: 0, totalFallidos: 0, contactosExitosos: 0, efectividadPct: 0, canalMayorRecuperacion: false },
          { canal: 'EMAIL',     totalEnviados: 0, totalFallidos: 0, contactosExitosos: 0, efectividadPct: 0, canalMayorRecuperacion: false },
          { canal: 'LLAMADA',   totalEnviados: 0, totalFallidos: 0, contactosExitosos: 0, efectividadPct: 0, canalMayorRecuperacion: false },
          { canal: 'WHATSAPP',  totalEnviados: 0, totalFallidos: 0, contactosExitosos: 0, efectividadPct: 0, canalMayorRecuperacion: false },
        ]);
        this.isLoadingEffectiveness.set(false);
      }
    });
  }

  getChannelColor(canal: string): string {
    const map: Record<string, string> = {
      SMS: '#10989B',
      EMAIL: '#055177',
      LLAMADA: '#0A3B4E',
      WHATSAPP: '#25D366',
      PHONE: '#0A3B4E',
    };
    return map[canal.toUpperCase()] ?? '#6b7280';
  }

  canalLabel(canal: string): string {
    const map: Record<string, string> = {
      SMS: 'SMS',
      EMAIL: 'Email',
      LLAMADA: 'Llamada',
      WHATSAPP: 'WhatsApp',
      PHONE: 'Llamada',
    };
    return map[canal.toUpperCase()] ?? canal;
  }
}
