import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { LucideAngularModule, Shield, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, MatButtonModule, MatInputModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = signal('');
  isLoading = signal(false);

  private authService = inject(AuthService);

  readonly ShieldIcon = Shield;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly ChevronRightIcon = ChevronRight;
  readonly AlertCircleIcon = AlertCircle;

  handleSubmit() {
    this.isLoading.set(true);
    this.error.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.isLoading.set(false);
        this.error.set('Credenciales incorrectas. Verifique su usuario y contraseña.');
      }
    });
  }
}
