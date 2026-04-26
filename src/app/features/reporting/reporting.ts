import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  BarChart3,
  PieChart as PieIcon,
  Download,
  Calendar,
  History,
  ShieldCheck
} from 'lucide-angular';
import { AdminService } from '../../services/admin.service';
import { DashboardService } from '../../services/dashboard.service';
import { AuditLog } from '../../models/types';

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

  readonly BarChart3Icon = BarChart3;
  readonly PieIcon = PieIcon;
  readonly DownloadIcon = Download;
  readonly CalendarIcon = Calendar;
  readonly HistoryIcon = History;
  readonly ShieldCheckIcon = ShieldCheck;

  realAuditLogs = signal<AuditLog[]>([]);
  dailyCollections = signal<any[]>([]);

  channelEffectiveness = [
    { name: 'WhatsApp', value: 75, color: '#10989B' },
    { name: 'Llamada', value: 62, color: '#055177' },
    { name: 'Email', value: 45, color: '#0A3B4E' },
    { name: 'SMS', value: 38, color: '#001822' },
  ];

  dailyRecoveryData = computed(() => {
    const data = this.dailyCollections();
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      day: item.label || item.date,
      amount: item.amount
    }));
  });

  ngOnInit() {
    this.adminService.getAuditLogs().subscribe(logs => {
      this.realAuditLogs.set(logs);
    });
    this.dashboardService.getDailyCollections().subscribe(data => {
      this.dailyCollections.set(data);
    });
  }
}
