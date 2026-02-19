import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

import {
  Incident,
  IncidentFilters,
  IncidentSortField,
  IncidentStatus,
  Pagination,
  CreateIncidentPayload,
  UpdateIncidentPayload,
  SortDirection
} from '../../domain/models/incident.model';
import { IncidentListResponseDTO } from '../../domain/dto/incident.dto';
import { IncidentMapper } from '../../domain/mappers/incident.mapper';
import { IncidentsApiService } from '../../infrastructure/api/incidents-api.service';
import { IncidentFilterStorage } from '../../infrastructure/persistence/incident-filter.storage';
import { LoggerService } from '../../../../core/logging/logger.service';
import { AuditService } from '../../../audit/infrastructure/audit.service';

export interface IncidentsState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  loading: boolean;
  error: string | null;
  filters: IncidentFilters;
  pagination: Pagination;
}

const defaultFilters: IncidentFilters = {
  sort: {
    field: 'createdAt',
    direction: 'desc'
  }
};

const initialState: IncidentsState = {
  incidents: [],
  selectedIncident: null,
  loading: false,
  error: null,
  filters: defaultFilters,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0
  }
};

const isValidTransition = (current: IncidentStatus, next: IncidentStatus): boolean => {
  const allowed: Record<IncidentStatus, IncidentStatus[]> = {
    open: ['investigating', 'mitigated', 'resolved'],
    investigating: ['mitigated', 'resolved'],
    mitigated: ['resolved', 'closed'],
    resolved: ['closed'],
    closed: []
  };
  return allowed[current]?.includes(next) ?? false;
};

export const IncidentsStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state) => ({
    totalPages: computed(() => Math.max(1, Math.ceil(state.pagination().total / state.pagination().pageSize))),
    isLoading: computed(() => state.loading()),
    hasActiveFilters: computed(() => {
      const { filters } = state;
      const current = filters();
      return Boolean(
        current.search ||
        current.service ||
        current.status?.length ||
        current.severity?.length ||
        current.dateFrom ||
        current.dateTo
      );
    })
  })),

  withMethods((store,
    api = inject(IncidentsApiService),
    storage = inject(IncidentFilterStorage),
    logger = inject(LoggerService),
    audit = inject(AuditService)
  ) => ({
    hydrateFromStorage() {
      const persisted = storage.load();
      if (Object.keys(persisted).length) {
        patchState(store, { filters: { ...defaultFilters, ...persisted } });
      }
    },

    loadIncidents: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const request = {
            page: store.pagination().page,
            pageSize: store.pagination().pageSize,
            filters: store.filters(),
            sort: store.filters().sort
          };
          return api.getIncidents(request).pipe(
            tap(response => handleListResponse(store, response)),
            catchError(error => {
              logger.error('Failed to load incidents', error);
              patchState(store, { loading: false, error: 'Failed to load incidents' });
              return of(null);
            })
          );
        })
      )
    ),

    loadIncident: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) => api.getIncidentById(id).pipe(
          tap(response => {
            const incident = IncidentMapper.toDomain(response);
            patchState(store, { selectedIncident: incident, loading: false });
          }),
          catchError(error => {
            logger.error('Failed to load incident', error);
            patchState(store, { loading: false, error: 'Incident not found' });
            return of(null);
          })
        ))
      )
    ),

    createIncident: rxMethod<CreateIncidentPayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(payload => api.createIncident(IncidentMapper.toCreateDTO(payload)).pipe(
          tap(response => {
            const incident = IncidentMapper.toDomain(response);
            const pagination = store.pagination();
            patchState(store, {
              incidents: [incident, ...store.incidents()],
              pagination: { ...pagination, total: pagination.total + 1 },
              loading: false
            });
            audit.record({ action: 'create_incident', resource: 'incident', metadata: { incidentId: incident.id } });
            logger.info('Incident created', { id: incident.id });
          }),
          catchError(error => {
            logger.error('Failed to create incident', error);
            patchState(store, { loading: false, error: 'Failed to create incident' });
            return of(null);
          })
        ))
      )
    ),

    updateIncident: rxMethod<{ id: string; payload: UpdateIncidentPayload }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, payload }) => api.updateIncident(id, IncidentMapper.toUpdateDTO(payload)).pipe(
          tap(response => {
            const updated = IncidentMapper.toDomain(response);
            patchState(store, {
              incidents: store.incidents().map(i => i.id === id ? updated : i),
              selectedIncident: store.selectedIncident()?.id === id ? updated : store.selectedIncident(),
              loading: false
            });
            logger.info('Incident updated', { id });
            audit.record({ action: 'update_incident', resource: 'incident', metadata: { incidentId: id } });
          }),
          catchError(error => {
            logger.error('Failed to update incident', error);
            patchState(store, { loading: false, error: 'Failed to update incident' });
            return of(null);
          })
        ))
      )
    ),

    deleteIncident: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) => api.deleteIncident(id).pipe(
          tap(() => {
            const pagination = store.pagination();
            const remaining = store.incidents().filter(i => i.id !== id);
            patchState(store, {
              incidents: remaining,
              pagination: { ...pagination, total: Math.max(0, pagination.total - 1) },
              loading: false
            });
            logger.info('Incident deleted', { id });
            audit.record({ action: 'delete_incident', resource: 'incident', metadata: { incidentId: id } });
          }),
          catchError(error => {
            logger.error('Failed to delete incident', error);
            patchState(store, { loading: false, error: 'Failed to delete incident' });
            return of(null);
          })
        ))
      )
    ),

    assignIncident: rxMethod<{ id: string; userId: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, userId }) => api.assignIncident(id, userId).pipe(
          tap(response => {
            const updated = IncidentMapper.toDomain(response);
            patchState(store, {
              incidents: store.incidents().map(i => i.id === id ? updated : i),
              selectedIncident: store.selectedIncident()?.id === id ? updated : store.selectedIncident(),
              loading: false
            });
            logger.info('Incident assigned', { id, userId });
            audit.record({ action: 'assign_incident', resource: 'incident', metadata: { incidentId: id, assignee: userId } });
          }),
          catchError(error => {
            logger.error('Failed to assign incident', error);
            patchState(store, { loading: false, error: 'Failed to assign incident' });
            return of(null);
          })
        ))
      )
    ),

    changeStatus: rxMethod<{ id: string; status: IncidentStatus }>(
      pipe(
        tap(({ id, status }) => {
          const current = store.incidents().find(i => i.id === id) || store.selectedIncident();
          if (current && !isValidTransition(current.status, status)) {
            patchState(store, { error: 'Invalid status transition' });
            throw new Error('Invalid status transition');
          }
          patchState(store, { loading: true, error: null });
        }),
        switchMap(({ id, status }) => api.changeStatus(id, status).pipe(
          tap(response => {
            const updated = IncidentMapper.toDomain(response);
            patchState(store, {
              incidents: store.incidents().map(i => i.id === id ? updated : i),
              selectedIncident: store.selectedIncident()?.id === id ? updated : store.selectedIncident(),
              loading: false
            });
            logger.info('Incident status changed', { id, status });
            audit.record({ action: 'change_incident_status', resource: 'incident', metadata: { incidentId: id, status } });
          }),
          catchError(error => {
            logger.error('Failed to change incident status', error);
            patchState(store, { loading: false, error: 'Failed to change status' });
            return of(null);
          })
        ))
      )
    ),

    updateFilters(filters: Partial<IncidentFilters>) {
      const merged = { ...store.filters(), ...filters };
      patchState(store, {
        filters: merged,
        pagination: { ...store.pagination(), page: 1 }
      });
      storage.save(merged);
    },

    changePage(page: number) {
      patchState(store, { pagination: { ...store.pagination(), page } });
    },

    changePageSize(pageSize: number) {
      patchState(store, { pagination: { ...store.pagination(), pageSize, page: 1 } });
    },

    changeSort(field: IncidentSortField, direction: SortDirection) {
      const next = { ...store.filters(), sort: { field, direction } };
      patchState(store, { filters: next, pagination: { ...store.pagination(), page: 1 } });
      storage.save(next);
    },

    selectIncident(id: string | null) {
      const incident = id ? store.incidents().find(i => i.id === id) || null : null;
      patchState(store, { selectedIncident: incident });
    },

    resetFilters() {
      patchState(store, { filters: defaultFilters, pagination: { ...store.pagination(), page: 1 } });
      storage.clear();
    },

    addComment: rxMethod<{ id: string; message: string; actor?: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, message, actor }) => api.addTimelineEvent(id, message, actor || 'user').pipe(
          tap(response => {
            const updated = IncidentMapper.toDomain(response);
            patchState(store, {
              incidents: store.incidents().map(i => i.id === id ? updated : i),
              selectedIncident: store.selectedIncident()?.id === id ? updated : store.selectedIncident(),
              loading: false
            });
            audit.record({ action: 'comment_incident', resource: 'incident', metadata: { incidentId: id } });
          }),
          catchError(error => {
            logger.error('Failed to add comment', error);
            patchState(store, { loading: false, error: 'Failed to add comment' });
            return of(null);
          })
        ))
      )
    ),

    clearError() {
      patchState(store, { error: null });
    },

    resetState() {
      patchState(store, initialState);
    }
  }))
);

function handleListResponse(store: any, response: IncidentListResponseDTO) {
  const incidents = IncidentMapper.toDomainList(response.incidents);
  patchState(store, {
    incidents,
    pagination: {
      page: response.page,
      pageSize: response.pageSize,
      total: response.total
    },
    loading: false
  });
}
