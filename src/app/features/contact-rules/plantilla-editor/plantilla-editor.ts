import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { LucideAngularModule, Save, X, Eye, Mail, MessageSquare, Info } from 'lucide-angular';
import { ContactRulesService, PlantillaMensaje, PlantillaZonas } from '../contact-rules.service';

export interface PlantillaEditorData {
  plantilla: PlantillaMensaje;
}

interface ZonaField {
  key: keyof PlantillaZonas;
  label: string;
  hint: string;
  multiline: boolean;
  rows?: number;
  maxLength?: number;
  canales: string[];
}

const MOCK_VARS: Record<string, string> = {
  nombre_cliente:    'Juan Pérez García',
  numero_obligacion: 'OBL-2024-00123',
  valor_obligacion:  '$ 1.850.000 COP',
  dias_mora:         '45',
  fecha_vencimiento: '15/01/2024',
  link_pago:         '#',
};

@Component({
  selector: 'app-plantilla-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatChipsModule,
    LucideAngularModule,
  ],
  templateUrl: './plantilla-editor.html',
  styleUrl: './plantilla-editor.css',
})
export class PlantillaEditorComponent implements OnInit {
  readonly SaveIcon   = Save;
  readonly XIcon      = X;
  readonly EyeIcon    = Eye;
  readonly MailIcon   = Mail;
  readonly SmsIcon    = MessageSquare;
  readonly InfoIcon   = Info;

  isSaving  = signal(false);
  errorMsg  = signal('');
  successMsg = signal('');

  zonas: PlantillaZonas = {
    asunto:           '',
    saludo:           '',
    mensajePrincipal: '',
    textoAntesBoton:  '',
    textoBoton:       '',
    despedida:        '',
    footer:           '',
    avisoLegal:       '',
    plantillaSms:     '',
  };

  readonly emailFields: ZonaField[] = [
    { key: 'asunto',           label: 'Asunto del correo',        hint: 'Línea de asunto que verá el cliente en su bandeja de entrada', multiline: false, maxLength: 150, canales: ['EMAIL'] },
    { key: 'saludo',           label: 'Saludo',                   hint: 'Ej: Estimado/a {{nombre_cliente}}', multiline: false, maxLength: 200, canales: ['EMAIL'] },
    { key: 'mensajePrincipal', label: 'Mensaje principal',        hint: 'Cuerpo del correo. Puede usar {{nombre_cliente}}, {{valor_obligacion}}, {{dias_mora}}, {{fecha_vencimiento}}', multiline: true, rows: 5, canales: ['EMAIL'] },
    { key: 'textoAntesBoton',  label: 'Texto antes del botón',    hint: 'Llamada a la acción antes del botón de pago', multiline: true, rows: 2, canales: ['EMAIL'] },
    { key: 'textoBoton',       label: 'Texto del botón de pago',  hint: 'Ej: Pagar ahora', multiline: false, maxLength: 60, canales: ['EMAIL'] },
    { key: 'despedida',        label: 'Despedida',                hint: 'Ej: Atentamente, el equipo de cobranza', multiline: true, rows: 2, canales: ['EMAIL'] },
    { key: 'footer',           label: 'Pie de página',            hint: 'Información de contacto, dirección, etc.', multiline: true, rows: 2, canales: ['EMAIL'] },
    { key: 'avisoLegal',       label: 'Aviso legal',              hint: 'Texto de privacidad y uso del correo', multiline: true, rows: 2, canales: ['EMAIL'] },
  ];

  readonly variablesDisponibles = [
    { var: '{{nombre_cliente}}',    desc: 'Nombre completo' },
    { var: '{{numero_obligacion}}', desc: 'No. obligación' },
    { var: '{{valor_obligacion}}',  desc: 'Valor a pagar' },
    { var: '{{dias_mora}}',         desc: 'Días en mora' },
    { var: '{{fecha_vencimiento}}', desc: 'Fecha límite' },
    { var: '{{link_pago}}',         desc: 'Link de pago' },
  ];

  // Strings con llaves que Angular interpretaría como bindings si estuvieran en el HTML
  readonly smsPlaceholder = 'BankVision: Hola {{nombre_cliente}}, tiene una obligación vencida...';
  readonly smsHint        = 'Máx. 160 caracteres. Use {{nombre_cliente}}, {{valor_obligacion}}, {{link_pago}}';

  get previewSaludo()           { return this.renderMock(this.zonas.saludo || 'Estimado/a cliente'); }
  get previewMensaje()          { return this.renderMock(this.zonas.mensajePrincipal || 'Le informamos que tiene una obligación pendiente de pago con nosotros.'); }
  get previewTextoAntesBoton()  { return this.renderMock(this.zonas.textoAntesBoton || 'Haga clic en el botón para realizar su pago de forma segura.'); }
  get previewTextoBoton()       { return this.zonas.textoBoton || 'Pagar ahora'; }
  get previewDespedida()        { return this.renderMock(this.zonas.despedida || 'Atentamente,'); }
  get previewFooter()           { return this.renderMock(this.zonas.footer || 'BankVision · Sistema de Gestión de Cartera'); }
  get previewAvisoLegal()       { return this.renderMock(this.zonas.avisoLegal || 'Este mensaje es confidencial y está dirigido únicamente a su destinatario.'); }
  get previewSms()              { return this.renderMock(this.zonas.plantillaSms || 'BankVision: Hola {{nombre_cliente}}, tiene una obligación vencida por {{valor_obligacion}}. Pague: {{link_pago}}'); }
  get isEmail()                 { return this.data.plantilla.canal === 'EMAIL'; }
  get isSms()                   { return this.data.plantilla.canal === 'SMS'; }

  constructor(
    public dialogRef: MatDialogRef<PlantillaEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlantillaEditorData,
    private service: ContactRulesService,
  ) {}

  ngOnInit() {
    const p = this.data.plantilla;
    this.zonas = {
      asunto:           p.asunto           ?? '',
      saludo:           p.saludo           ?? '',
      mensajePrincipal: p.mensajePrincipal ?? '',
      textoAntesBoton:  p.textoAntesBoton  ?? '',
      textoBoton:       p.textoBoton       ?? '',
      despedida:        p.despedida        ?? '',
      footer:           p.footer           ?? '',
      avisoLegal:       p.avisoLegal       ?? '',
      plantillaSms:     p.plantillaSms     ?? '',
    };
  }

  guardar() {
    this.isSaving.set(true);
    this.errorMsg.set('');
    this.service.actualizarZonas(this.data.plantilla.id, this.zonas).subscribe({
      next: updated => {
        this.isSaving.set(false);
        this.successMsg.set('Plantilla guardada correctamente');
        setTimeout(() => this.dialogRef.close(updated), 1200);
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMsg.set(err?.error?.message || 'Error al guardar la plantilla');
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  insertVar(field: ZonaField, variable: string) {
    const key = field.key as keyof PlantillaZonas;
    this.zonas[key] = ((this.zonas[key] as string) || '') + variable;
  }

  private renderMock(text: string): string {
    let result = text;
    for (const [k, v] of Object.entries(MOCK_VARS)) {
      result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    }
    return result;
  }
}
