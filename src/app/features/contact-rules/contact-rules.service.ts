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

export interface PlantillaMensaje {
  id: number;
  nombre: string;
  canal: string;
  segmento: string | null;
  contenido: string;
  activa: boolean;
  // zonas editables
  asunto: string | null;
  saludo: string | null;
  mensajePrincipal: string | null;
  textoAntesBoton: string | null;
  textoBoton: string | null;
  despedida: string | null;
  footer: string | null;
  avisoLegal: string | null;
  plantillaSms: string | null;
}

export interface PlantillaZonas {
  asunto: string;
  saludo: string;
  mensajePrincipal: string;
  textoAntesBoton: string;
  textoBoton: string;
  despedida: string;
  footer: string;
  avisoLegal: string;
  plantillaSms: string;
}

@Injectable({ providedIn: 'root' })
export class ContactRulesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/scoring/config`;
  private cobranzaBase = `${environment.apiUrl}/cobranza`;

  getContactRules(version: string): Observable<ContactRule[]> {
    return this.http.get<ContactRule[]>(`${this.base}/models/${version}/contact-rules`);
  }

  updateContactRules(version: string, rules: ContactRule[]): Observable<ContactRule[]> {
    return this.http.put<ContactRule[]>(`${this.base}/models/${version}/contact-rules`, rules);
  }

  getPlantillas(): Observable<PlantillaOption[]> {
    return this.http.get<PlantillaOption[]>(`${this.cobranzaBase}/plantillas`);
  }

  getPlantillasCompletas(): Observable<PlantillaMensaje[]> {
    return this.http.get<PlantillaMensaje[]>(`${this.cobranzaBase}/plantillas`);
  }

  getPlantilla(id: number): Observable<PlantillaMensaje> {
    return this.http.get<PlantillaMensaje>(`${this.cobranzaBase}/plantillas/${id}`);
  }

  actualizarZonas(id: number, zonas: PlantillaZonas): Observable<PlantillaMensaje> {
    return this.http.put<PlantillaMensaje>(`${this.cobranzaBase}/plantillas/${id}/zonas`, zonas);
  }

  getPreview(id: number): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.cobranzaBase}/plantillas/${id}/preview`);
  }
}
