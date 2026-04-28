import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/types';
import { environment } from '../../environments/environment';
import { tap, catchError, map, Observable, throwError } from 'rxjs';
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
    // La sesión es efímera: no se restaura desde almacenamiento persistente.
    localStorage.removeItem('bv_user');
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap(user => {
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
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }
}
