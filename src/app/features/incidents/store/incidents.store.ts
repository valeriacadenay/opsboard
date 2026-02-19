/**
 * Feature Store - Signal Store con @ngrx/signals
 * Gestiona el estado de la feature Incidents
 */

import { inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of } from 'rxjs';
import { computed } from '@angular/core';

import { Incident, CreateIncidentPayload, UpdateIncidentPayload } from '../models/incident.model';
import { IncidentsApiService } from '../services/incidents-api.service';
import { IncidentMapper } from '../mappers/incident.mapper';
import { LoggerService } from '../../../core/logging/logger.service';

export interface IncidentsState {
  incidents: Incident[];
  selectedIncident: Incident | null;
  loading: boolean;
  error: string | null;
  filters: {
    severity?: string;
    status?: string;
    search?: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: IncidentsState = {
  incidents: [],
  selectedIncident: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  }
};

export const IncidentsStore = signalStore(
  { providedIn: 'root' },
  
  withState<IncidentsState>(initialState),

  withComputed((state) => ({
    /**
     * Incidentes críticos
     */
    criticalIncidents: computed(() => 
      state.incidents().filter(i => i.severity === 'critical')
    ),

    /**
     * Incidentes abiertos
     */
    openIncidents: computed(() => 
      state.incidents().filter(i => i.status === 'open')
    ),

    /**
     * Total de páginas
     */
    totalPages: computed(() => 
      Math.ceil(state.pagination().total / state.pagination().pageSize)
    ),

    /**
     * Estado de carga
     */
    isLoading: computed(() => state.loading())
  })),

  withMethods((
    store,
    apiService = inject(IncidentsApiService),
    logger = inject(LoggerService)
  ) => ({
    /**
     * Carga incidentes con paginación y filtros
     */
    loadIncidents: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true, error: null });
          logger.info('Loading incidents');
        }),
        switchMap(() => {
          const { page, pageSize } = store.pagination();
          return apiService.getIncidents(page, pageSize, store.filters()).pipe(
            tap(response => {
              const incidents = IncidentMapper.toDomainList(response.incidents);
              patchState(store, {
                incidents,
                loading: false,
                pagination: {
                  ...store.pagination(),
                  total: response.total
                }
              });
              logger.info(`Loaded ${incidents.length} incidents`);
            }),
            catchError(error => {
              logger.error('Failed to load incidents', error);
              patchState(store, { 
                loading: false, 
                error: 'Failed to load incidents' 
              });
              return of(null);
            })
          );
        })
      )
    ),

    /**
     * Crea un nuevo incidente
     */
    createIncident: rxMethod<CreateIncidentPayload>(
      pipe(
        tap(() => {
          patchState(store, { loading: true, error: null });
          logger.info('Creating incident');
        }),
        switchMap(payload => {
          const dto = IncidentMapper.toCreateDTO(payload);
          return apiService.createIncident(dto).pipe(
            tap(response => {
              const incident = IncidentMapper.toDomain(response);
              patchState(store, {
                incidents: [...store.incidents(), incident],
                loading: false
              });
              logger.info('Incident created successfully', { id: incident.id });
            }),
            catchError(error => {
              logger.error('Failed to create incident', error);
              patchState(store, { 
                loading: false, 
                error: 'Failed to create incident' 
              });
              return of(null);
            })
          );
        })
      )
    ),

    /**
     * Actualiza un incidente existente
     */
    updateIncident: rxMethod<{ id: string; payload: UpdateIncidentPayload }>(
      pipe(
        tap(() => {
          patchState(store, { loading: true, error: null });
          logger.info('Updating incident');
        }),
        switchMap(({ id, payload }) => {
          const dto = IncidentMapper.toUpdateDTO(payload);
          return apiService.updateIncident(id, dto).pipe(
            tap(response => {
              const incident = IncidentMapper.toDomain(response);
              const updatedIncidents = store.incidents().map(i => 
                i.id === id ? incident : i
              );
              patchState(store, {
                incidents: updatedIncidents,
                selectedIncident: store.selectedIncident()?.id === id ? incident : store.selectedIncident(),
                loading: false
              });
              logger.info('Incident updated successfully', { id });
            }),
            catchError(error => {
              logger.error('Failed to update incident', error);
              patchState(store, { 
                loading: false, 
                error: 'Failed to update incident' 
              });
              return of(null);
            })
          );
        })
      )
    ),

    /**
     * Selecciona un incidente
     */
    selectIncident(incident: Incident | null) {
      patchState(store, { selectedIncident: incident });
    },

    /**
     * Actualiza filtros
     */
    updateFilters(filters: Partial<IncidentsState['filters']>) {
      patchState(store, { 
        filters: { ...store.filters(), ...filters },
        pagination: { ...store.pagination(), page: 1 }
      });
    },

    /**
     * Cambia de página
     */
    changePage(page: number) {
      patchState(store, { 
        pagination: { ...store.pagination(), page } 
      });
    },

    /**
     * Limpia errores
     */
    clearError() {
      patchState(store, { error: null });
    },

    /**
     * Reset del store
     */
    reset() {
      patchState(store, initialState);
    }
  }))
);
