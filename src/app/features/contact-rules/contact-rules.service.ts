import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactRule {
  riskLevel: string;
  riskLabel: string;
  contactChannel: string;
  priority: number;
  frequencyPerWeek: number;
  emailEveryDays: number;
  intensityLabel: string;
  description: string;
  plantillaId: number | null;
  plantillaNombre: string | null;
}

export interface PlantillaOption {
  id: number;
  nombre: string;
  canal: string;
}

@Injectable({ providedIn: 'root' })
export class ContactRulesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/scoring/config`;

  getContactRules(version: string): Observable<ContactRule[]> {
    return this.http.get<ContactRule[]>(`${this.base}/models/${version}/contact-rules`);
  }

  updateContactRules(version: string, rules: ContactRule[]): Observable<ContactRule[]> {
    return this.http.put<ContactRule[]>(`${this.base}/models/${version}/contact-rules`, rules);
  }

  getPlantillas(): Observable<PlantillaOption[]> {
    return this.http.get<PlantillaOption[]>(`${environment.apiUrl}/cobranza/plantillas`);
  }
}
