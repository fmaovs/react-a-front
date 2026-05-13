import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, LoginResponse } from '../../models/types';
import { environment } from '../../../environments/environment';
import { tap, catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private userSignal = signal<User | null>(null);
  private mustChangePasswordSignal = signal(false);

  user = this.userSignal.asReadonly();
  mustChangePassword = this.mustChangePasswordSignal.asReadonly();

  constructor() {
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
        this.mustChangePasswordSignal.set(res.mustChangePassword ?? false);
      }),
      map(() => true),
      catchError(err => {
        console.error('Login failed', err);
        return throwError(() => err);
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<string> {
    return this.http.post(
      `${environment.apiUrl}/auth/change-password`,
      { oldPassword, newPassword },
      { responseType: 'text' }
    ).pipe(
      tap(() => this.mustChangePasswordSignal.set(false)),
      catchError(err => throwError(() => err))
    );
  }

  logout() {
    this.userSignal.set(null);
    this.mustChangePasswordSignal.set(false);
    localStorage.removeItem('bv_user');
  }
}
