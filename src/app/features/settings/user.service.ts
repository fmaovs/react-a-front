import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, UserCreateRequest, UserUpdateRequest, RoleOption } from '../../models/types';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getRoles(): Observable<RoleOption[]> {
    return this.http.get<RoleOption[]>(`${this.apiUrl}/roles`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: UserCreateRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
