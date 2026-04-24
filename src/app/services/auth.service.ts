import { Injectable, signal } from '@angular/core';
import { User } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSignal = signal<User | null>(null);

  user = this.userSignal.asReadonly();

  login(email: string, pass: string): boolean {
    if (email === 'admin@fintra.co' && pass === 'admin123') {
      this.userSignal.set({
        name: 'Camilo Cantor',
        email: 'admin@fintra.co',
        role: 'Administrador'
      });
      return true;
    }
    return false;
  }

  logout() {
    this.userSignal.set(null);
  }
}
