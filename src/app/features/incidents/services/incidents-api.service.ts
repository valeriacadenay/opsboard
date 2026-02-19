/**
 * API Service - Maneja comunicación HTTP con el backend
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IncidentDTO, CreateIncidentDTO, UpdateIncidentDTO, IncidentListResponseDTO } from '../models/incident.dto';

@Injectable({ providedIn: 'root' })
export class IncidentsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/incidents';

  /**
   * Obtiene lista paginada de incidentes
   */
  getIncidents(page = 1, pageSize = 20, filters?: Record<string, string>): Observable<IncidentListResponseDTO> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params = params.set(key, value);
      });
    }

    return this.http.get<IncidentListResponseDTO>(this.baseUrl, { params });
  }

  /**
   * Obtiene un incidente por ID
   */
  getIncidentById(id: string): Observable<IncidentDTO> {
    return this.http.get<IncidentDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo incidente
   */
  createIncident(dto: CreateIncidentDTO): Observable<IncidentDTO> {
    return this.http.post<IncidentDTO>(this.baseUrl, dto);
  }

  /**
   * Actualiza un incidente existente
   */
  updateIncident(id: string, dto: UpdateIncidentDTO): Observable<IncidentDTO> {
    return this.http.patch<IncidentDTO>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * Elimina un incidente
   */
  deleteIncident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
