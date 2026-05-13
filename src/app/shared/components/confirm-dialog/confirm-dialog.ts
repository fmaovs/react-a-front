import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { LucideAngularModule, AlertTriangle, RotateCcw, Trash2 } from 'lucide-angular';

export interface ConfirmDialogData {
  title: string;
  message: string;
  code?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, LucideAngularModule],
  template: `
    <div class="cd-container">
      <div class="cd-header">
        <div class="cd-icon-box" [class]="data.type ?? 'warning'">
          <lucide-icon [img]="AlertIcon" class="cd-icon"></lucide-icon>
        </div>
        <div class="cd-text">
          <h2 class="cd-title">{{ data.title }}</h2>
          <p class="cd-message">{{ data.message }}</p>
        </div>
      </div>
      @if (data.code) {
        <div class="cd-code-wrap">
          <span class="cd-code-label">Contraseña temporal</span>
          <div class="cd-code-box">
            <code class="cd-code">{{ data.code }}</code>
          </div>
          <p class="cd-code-hint">Comunícala al usuario de forma segura. Deberá cambiarla en su primer ingreso.</p>
        </div>
      }
      <mat-dialog-actions align="end" class="cd-actions">
        @if (data.cancelLabel) {
          <button mat-button (click)="cancel()" class="cd-cancel-btn">
            {{ data.cancelLabel }}
          </button>
        }
        <button mat-raised-button (click)="confirm()" class="cd-confirm-btn" [class]="data.type ?? 'warning'">
          {{ data.confirmLabel ?? 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .cd-container { padding: 1.75rem; max-width: 420px; }
    .cd-header { display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.25rem; }
    .cd-text { flex: 1; }
    .cd-icon-box {
      width: 2.75rem; height: 2.75rem; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .cd-icon-box.warning { background: #fffbeb; color: #d97706; }
    .cd-icon-box.danger  { background: #fef2f2; color: #dc2626; }
    .cd-icon-box.info    { background: #eff6ff; color: #2563eb; }
    .cd-icon { width: 1.375rem; height: 1.375rem; }
    .cd-title { font-size: 1.0625rem; font-weight: 800; color: #001822; margin: 0 0 0.3rem; letter-spacing: -0.02em; }
    .cd-message { font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.5; }
    .cd-code-wrap { margin-bottom: 1.25rem; }
    .cd-code-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: block; margin-bottom: 0.375rem; }
    .cd-code-box { background: #f1f5f9; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: center; }
    .cd-code { font-family: 'Courier New', monospace; font-size: 1.125rem; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; }
    .cd-code-hint { font-size: 0.75rem; color: #94a3b8; margin: 0.5rem 0 0; line-height: 1.4; }
    .cd-actions { padding: 0 !important; gap: 0.625rem !important; margin-top: 0.5rem !important; }
    .cd-cancel-btn  { font-weight: 600 !important; color: #64748b !important; border-radius: 8px !important; }
    .cd-confirm-btn { font-weight: 700 !important; color: white !important; border-radius: 8px !important; }
    .cd-confirm-btn.warning { background: #d97706 !important; }
    .cd-confirm-btn.danger  { background: #dc2626 !important; }
    .cd-confirm-btn.info    { background: #2563eb !important; }
  `]
})
export class ConfirmDialogComponent {
  readonly AlertIcon = AlertTriangle;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  confirm() { this.dialogRef.close(true); }
  cancel()  { this.dialogRef.close(false); }
}
