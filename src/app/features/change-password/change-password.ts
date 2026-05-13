import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UiToastService } from '../../shared/services/ui-toast.service';
import {
  LucideAngularModule,
  Lock, Eye, EyeOff, Shield, CheckCircle2, XCircle, LogOut
} from 'lucide-angular';

interface PasswordRule {
  label: string;
  test: (p: string) => boolean;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private toast = inject(UiToastService);

  readonly LockIcon      = Lock;
  readonly EyeIcon       = Eye;
  readonly EyeOffIcon    = EyeOff;
  readonly ShieldIcon    = Shield;
  readonly CheckIcon     = CheckCircle2;
  readonly XCircleIcon   = XCircle;
  readonly LogOutIcon    = LogOut;

  currentPassword  = '';
  newPassword      = '';
  confirmPassword  = '';

  showCurrent  = signal(false);
  showNew      = signal(false);
  showConfirm  = signal(false);
  isLoading    = signal(false);
  error        = signal('');

  readonly rules: PasswordRule[] = [
    { label: 'Mínimo 8 caracteres',          test: p => p.length >= 8 },
    { label: 'Al menos una mayúscula',        test: p => /[A-Z]/.test(p) },
    { label: 'Al menos un número',            test: p => /[0-9]/.test(p) },
    { label: 'Al menos un carácter especial', test: p => /[@$!%*?&#^()_+\-=]/.test(p) },
  ];

  get strength(): number {
    return this.rules.filter(r => r.test(this.newPassword)).length;
  }

  get strengthLabel(): string {
    const s = this.strength;
    if (s === 0) return '';
    if (s <= 1)  return 'Muy débil';
    if (s === 2) return 'Débil';
    if (s === 3) return 'Aceptable';
    return 'Fuerte';
  }

  get strengthClass(): string {
    const s = this.strength;
    if (s <= 1)  return 'weak';
    if (s === 2) return 'fair';
    if (s === 3) return 'good';
    return 'strong';
  }

  get passwordsMatch(): boolean {
    return this.newPassword.length > 0 && this.newPassword === this.confirmPassword;
  }

  get canSubmit(): boolean {
    return (
      this.currentPassword.length > 0 &&
      this.strength === 4 &&
      this.passwordsMatch &&
      !this.isLoading()
    );
  }

  submit() {
    this.error.set('');
    if (!this.canSubmit) return;

    this.isLoading.set(true);
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Contraseña actualizada correctamente. Bienvenido al sistema.');
      },
      error: err => {
        this.isLoading.set(false);
        const msg = err?.error?.message || err?.error || 'Error al cambiar la contraseña.';
        this.error.set(typeof msg === 'string' ? msg : 'Error al cambiar la contraseña.');
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
