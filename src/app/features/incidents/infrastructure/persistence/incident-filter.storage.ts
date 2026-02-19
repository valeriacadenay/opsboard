import { Injectable } from '@angular/core';
import { IncidentFilters, IncidentSortField, SortDirection } from '../../domain/models/incident.model';

interface PersistedFilters {
  status?: string[];
  severity?: string[];
  service?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: {
    field: IncidentSortField;
    direction: SortDirection;
  };
}

@Injectable({ providedIn: 'root' })
export class IncidentFilterStorage {
  private readonly key = 'opsboard:incidents:filters';

  load(): IncidentFilters {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as PersistedFilters;
      return {
        status: parsed.status as IncidentFilters['status'],
        severity: parsed.severity as IncidentFilters['severity'],
        service: parsed.service,
        dateFrom: parsed.dateFrom,
        dateTo: parsed.dateTo,
        search: parsed.search,
        sort: parsed.sort
      };
    } catch (error) {
      console.warn('Failed to load incident filters from storage', error);
      return {};
    }
  }

  save(filters: IncidentFilters): void {
    try {
      const payload: PersistedFilters = {
        status: filters.status,
        severity: filters.severity,
        service: filters.service,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        search: filters.search,
        sort: filters.sort
      };
      localStorage.setItem(this.key, JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to persist incident filters', error);
    }
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}
