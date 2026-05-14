import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  LucideAngularModule,
  ShieldCheck,
  Phone,
  Mail,
  MessageSquare,
  UserCheck,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  Edit2,
  FileText,
  Settings
} from 'lucide-angular';
import { ContactRulesService, ContactRule, PlantillaOption, PlantillaMensaje } from './contact-rules.service';
import { PlantillaEditorComponent } from './plantilla-editor/plantilla-editor';
import { ScoringConfigService } from '../settings/scoring-config.service';

@Component({
  selector: 'app-contact-rules',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MatDialogModule],
  templateUrl: './contact-rules.html',
  styleUrl: './contact-rules.css'
})
export class ContactRulesComponent implements OnInit {
  private service = inject(ContactRulesService);
  private scoringService = inject(ScoringConfigService);
  private dialog = inject(MatDialog);

  readonly ShieldCheckIcon   = ShieldCheck;
  readonly PhoneIcon         = Phone;
  readonly MailIcon          = Mail;
  readonly MessageSquareIcon = MessageSquare;
  readonly UserCheckIcon     = UserCheck;
  readonly RefreshCwIcon     = RefreshCw;
  readonly SaveIcon          = Save;
  readonly AlertCircleIcon   = AlertCircle;
  readonly CheckCircle2Icon  = CheckCircle2;
  readonly Edit2Icon         = Edit2;
  readonly FileTextIcon      = FileText;
  readonly SettingsIcon      = Settings;

  activeTab = signal<'reglas' | 'plantillas'>('reglas');

  rules = signal<ContactRule[]>([]);
  plantillas = signal<PlantillaOption[]>([]);
  plantillasCompletas = signal<PlantillaMensaje[]>([]);
  isLoading = signal(false);
  isLoadingPlantillas = signal(false);
  isSaving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  modelVersion = signal('v1.0');
  editingIndex = signal<number | null>(null);

  readonly channelOptions = ['SMS', 'EMAIL', 'LLAMADA', 'WHATSAPP', 'ESCALAMIENTO'];

  readonly riskColors: Record<string, string> = {
    BAJO: '#10b981',
    MEDIO: '#f59e0b',
    ALTO: '#ef4444',
    CRITICO: '#7c3aed',
  };

  readonly riskIcons: Record<string, any> = {};

  ngOnInit() {
    this.scoringService.getActiveModel().subscribe({
      next: model => {
        this.modelVersion.set(model.modelVersion ?? 'v1.0');
        this.loadRules();
      },
      error: () => this.loadRules()
    });
    this.service.getPlantillas().subscribe({
      next: list => this.plantillas.set(list),
      error: () => {}
    });
  }

  setTab(tab: 'reglas' | 'plantillas') {
    this.activeTab.set(tab);
    if (tab === 'plantillas' && this.plantillasCompletas().length === 0) {
      this.loadPlantillasCompletas();
    }
  }

  loadPlantillasCompletas() {
    this.isLoadingPlantillas.set(true);
    this.service.getPlantillasCompletas().subscribe({
      next: list => {
        this.plantillasCompletas.set(list);
        this.isLoadingPlantillas.set(false);
      },
      error: () => this.isLoadingPlantillas.set(false)
    });
  }

  editarPlantilla(plantilla: PlantillaMensaje) {
    const ref = this.dialog.open(PlantillaEditorComponent, {
      data: { plantilla },
      maxWidth: '100vw',
      panelClass: 'pe-dialog-panel',
    });
    ref.afterClosed().subscribe(updated => {
      if (updated) {
        this.plantillasCompletas.update(list =>
          list.map(p => p.id === updated.id ? updated : p)
        );
        this.successMessage.set('Plantilla actualizada correctamente');
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }

  loadRules() {
    this.isLoading.set(true);
    this.service.getContactRules(this.modelVersion()).subscribe({
      next: rules => {
        this.rules.set(rules);
        this.isLoading.set(false);
      },
      error: err => {
        this.errorMessage.set('Error al cargar reglas de contacto');
        this.isLoading.set(false);
      }
    });
  }

  toggleEdit(index: number) {
    this.editingIndex.set(this.editingIndex() === index ? null : index);
  }

  save() {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.service.updateContactRules(this.modelVersion(), this.rules()).subscribe({
      next: updated => {
        this.rules.set(updated);
        this.isSaving.set(false);
        this.editingIndex.set(null);
        this.successMessage.set('Reglas de contacto guardadas correctamente');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Error al guardar las reglas');
      }
    });
  }

  getRuleColor(riskLevel: string): string {
    return this.riskColors[riskLevel] ?? '#6b7280';
  }

  getChannelLabel(channel: string): string {
    const map: Record<string, string> = {
      SMS: 'SMS preventivo',
      EMAIL: 'Email preventivo',
      LLAMADA: 'Llamada directa',
      WHATSAPP: 'WhatsApp',
      ESCALAMIENTO: 'Escalamiento a agente humano',
    };
    return map[channel] ?? channel;
  }

  plantillasFiltradas(canal: string): PlantillaOption[] {
    return this.plantillas().filter(p =>
      p.canal.toUpperCase() === canal.toUpperCase() ||
      canal === 'LLAMADA' ||
      canal === 'ESCALAMIENTO'
    );
  }

  getCanalLabel(canal: string): string {
    const map: Record<string, string> = { EMAIL: 'Email', SMS: 'SMS', WHATSAPP: 'WhatsApp' };
    return map[canal] ?? canal;
  }

  getCanalClass(canal: string): string {
    const map: Record<string, string> = { EMAIL: 'canal-email', SMS: 'canal-sms', WHATSAPP: 'canal-wa' };
    return map[canal] ?? 'canal-default';
  }

  tieneZonas(p: PlantillaMensaje): boolean {
    return !!(p.saludo || p.mensajePrincipal || p.textoBoton || p.plantillaSms);
  }
}
