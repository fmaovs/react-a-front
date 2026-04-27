import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/types';
import { environment } from '../../environments/environment';
import { tap, catchError, map, Observable, throwError, of } from 'rxjs';
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
        return throwError(() => err);
      })
    );
  }

  logout() {
    this.userSignal.set(null);
    localStorage.removeItem('bv_user');
    this.router.navigate(['/login']);
  }
}
