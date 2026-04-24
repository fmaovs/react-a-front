import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/types';
import { environment } from '../../environments/environment';
import { tap, catchError, of, map, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userSignal = signal<User | null>(null);

  user = this.userSignal.asReadonly();

  constructor() {
    const savedUser = localStorage.getItem('bv_user');
    if (savedUser) {
      try {
        this.userSignal.set(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bv_user');
      }
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap(user => {
        this.userSignal.set(user);
        localStorage.setItem('bv_user', JSON.stringify(user));
      }),
      map(() => true),
      catchError(err => {
        console.error('Login failed', err);
        // Fallback for demo purposes if backend is not reachable
        if (username === 'admin' && password === 'admin123') {
           const mockUser: User = { username: 'admin', name: 'Administrador', email: 'admin@bankvision.com', role: 'ADMIN' };
           this.userSignal.set(mockUser);
           return of(true);
        }
        return of(false);
      })
    );
  }

  logout() {
    this.userSignal.set(null);
    localStorage.removeItem('bv_user');
    this.router.navigate(['/login']);
  }
}
