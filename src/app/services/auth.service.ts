import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, LoginResponse } from '../models/types';
import { environment } from '../../environments/environment';
import { tap, catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private userSignal = signal<User | null>(null);

  user = this.userSignal.asReadonly();

  constructor() {
    // Sesión efímera: se limpia al recargar la página.
    localStorage.removeItem('bv_user');
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap(res => {
        const user: User = {
          id: res.userId,
          username: res.username,
          email: res.email,
          fullName: res.username,
          roleName: res.role,
          role: res.role,
          status: 'ACTIVE',
          token: res.token
        };
        this.userSignal.set(user);
      }),
      map(() => true),
      catchError(err => {
        console.error('Login failed', err);
        return throwError(() => err);
      })
    );
  }

  logout() {
    // Limpiar signal → app.ts detecta user() === null y muestra LoginComponent.
    // No se necesita router.navigate porque el login es condicional en el template raíz.
    this.userSignal.set(null);
    localStorage.removeItem('bv_user');
  }
}
