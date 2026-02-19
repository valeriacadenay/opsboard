import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

import { AuditEntry, AuditFilters } from '../../domain/models/audit.model';
import { AuditService } from '../../infrastructure/audit.service';
import { LoggerService } from '../../../../core/logging/logger.service';

interface AuditState {
  entries: AuditEntry[];
  filters: AuditFilters;
  loading: boolean;
  error: string | null;
}

const initialFilters: AuditFilters = {
  user: '',
  action: '',
  resource: '',
  dateFrom: '',
  dateTo: ''
};

const initialState: AuditState = {
  entries: [],
  filters: initialFilters,
  loading: false,
  error: null
};

const matchesFilters = (entry: AuditEntry, filters: AuditFilters): boolean => {
  const matchesUser = filters.user ? entry.user.toLowerCase().includes(filters.user.toLowerCase()) : true;
  const matchesAction = filters.action ? entry.action.toLowerCase().includes(filters.action.toLowerCase()) : true;
  const matchesResource = filters.resource ? entry.resource.toLowerCase().includes(filters.resource.toLowerCase()) : true;

  const ts = new Date(entry.timestamp).getTime();
  const afterFrom = filters.dateFrom ? ts >= new Date(filters.dateFrom).getTime() : true;
  const beforeTo = filters.dateTo ? ts <= new Date(filters.dateTo).getTime() : true;

  return matchesUser && matchesAction && matchesResource && afterFrom && beforeTo;
};

export const AuditStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state) => ({
    filteredEntries: computed(() =>
      [...state.entries()].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .filter(entry => matchesFilters(entry, state.filters()))
    )
  })),

  withMethods((store,
    auditService = inject(AuditService),
    logger = inject(LoggerService)
  ) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => auditService.list().pipe(
          tap(entries => patchState(store, { entries, loading: false })),
          catchError(error => {
            logger.error('Failed to load audit log', error);
            patchState(store, { loading: false, error: 'Failed to load audit log' });
            return of(null);
          })
        ))
      )
    ),

    updateFilters(filters: Partial<AuditFilters>) {
      patchState(store, { filters: { ...store.filters(), ...filters } });
    },

    clearFilters() {
      patchState(store, { filters: initialFilters });
    }
  }))
);
