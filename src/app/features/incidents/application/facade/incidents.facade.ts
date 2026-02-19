import { Injectable, inject } from '@angular/core';
import { IncidentsStore } from '../state/incidents.store';
import { CreateIncidentPayload, IncidentFilters, IncidentSortField, IncidentStatus, SortDirection, UpdateIncidentPayload } from '../../domain/models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentsFacade {
  private readonly store = inject(IncidentsStore);

  readonly incidents$ = this.store.incidents;
  readonly selectedIncident$ = this.store.selectedIncident;
  readonly loading$ = this.store.loading;
  readonly error$ = this.store.error;
  readonly filters$ = this.store.filters;
  readonly pagination$ = this.store.pagination;
  readonly totalPages$ = this.store.totalPages;
  readonly hasActiveFilters$ = this.store.hasActiveFilters;

  initialize(): void {
    this.store.hydrateFromStorage();
    this.store.loadIncidents();
  }

  refresh(): void {
    this.store.loadIncidents();
  }

  loadIncident(id: string): void {
    this.store.loadIncident(id);
  }

  selectIncident(id: string | null): void {
    this.store.selectIncident(id);
  }

  createIncident(payload: CreateIncidentPayload): void {
    this.store.createIncident(payload);
  }

  updateIncident(id: string, payload: UpdateIncidentPayload): void {
    this.store.updateIncident({ id, payload });
  }

  deleteIncident(id: string): void {
    this.store.deleteIncident(id);
  }

  assignIncident(id: string, userId: string): void {
    this.store.assignIncident({ id, userId });
  }

  changeStatus(id: string, status: IncidentStatus): void {
    this.store.changeStatus({ id, status });
  }

  addComment(id: string, message: string, actor?: string): void {
    this.store.addComment({ id, message, actor });
  }

  updateFilters(filters: Partial<IncidentFilters>): void {
    this.store.updateFilters(filters);
  }

  changeSort(field: IncidentSortField, direction: SortDirection): void {
    this.store.changeSort(field, direction);
    this.store.loadIncidents();
  }

  changePage(page: number): void {
    this.store.changePage(page);
    this.store.loadIncidents();
  }

  changePageSize(pageSize: number): void {
    this.store.changePageSize(pageSize);
    this.store.loadIncidents();
  }

  resetFilters(): void {
    this.store.resetFilters();
    this.store.loadIncidents();
  }

  clearError(): void {
    this.store.clearError();
  }
}
