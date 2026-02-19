import { Injectable, inject } from '@angular/core';
import { AuditStore } from '../state/audit.store';
import { AuditFilters } from '../../domain/models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditFacade {
  private readonly store = inject(AuditStore);

  readonly entries$ = this.store.filteredEntries;
  readonly loading$ = this.store.loading;
  readonly filters$ = this.store.filters;

  initialize(): void {
    this.store.load();
  }

  updateFilters(filters: Partial<AuditFilters>): void {
    this.store.updateFilters(filters);
  }

  clearFilters(): void {
    this.store.clearFilters();
  }
}
