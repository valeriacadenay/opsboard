/**
 * Facade Pattern - Abstrae la complejidad del store
 * Proporciona una API simple para los componentes
 */

import { Injectable, inject } from '@angular/core';
import { IncidentsStore } from './incidents.store';
import { CreateIncidentPayload, UpdateIncidentPayload } from '../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentsFacade {
  private readonly store = inject(IncidentsStore);

  // Selectores
  readonly incidents$ = this.store.incidents;
  readonly selectedIncident$ = this.store.selectedIncident;
  readonly loading$ = this.store.loading;
  readonly error$ = this.store.error;
  readonly criticalIncidents$ = this.store.criticalIncidents;
  readonly openIncidents$ = this.store.openIncidents;
  readonly pagination$ = this.store.pagination;
  readonly totalPages$ = this.store.totalPages;

  /**
   * Carga incidentes
   */
  loadIncidents(): void {
    this.store.loadIncidents();
  }

  /**
   * Crea un nuevo incidente
   */
  createIncident(payload: CreateIncidentPayload): void {
    this.store.createIncident(payload);
  }

  /**
   * Actualiza un incidente
   */
  updateIncident(id: string, payload: UpdateIncidentPayload): void {
    this.store.updateIncident({ id, payload });
  }

  /**
   * Selecciona un incidente
   */
  selectIncident(id: string): void {
    const incident = this.store.incidents().find(i => i.id === id);
    this.store.selectIncident(incident || null);
  }

  /**
   * Deselecciona incidente
   */
  deselectIncident(): void {
    this.store.selectIncident(null);
  }

  /**
   * Aplica filtros
   */
  applyFilters(filters: { severity?: string; status?: string; search?: string }): void {
    this.store.updateFilters(filters);
    this.loadIncidents();
  }

  /**
   * Cambia de página
   */
  goToPage(page: number): void {
    this.store.changePage(page);
    this.loadIncidents();
  }

  /**
   * Limpia errores
   */
  clearError(): void {
    this.store.clearError();
  }
}
