import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IncidentsStore } from './incidents.store';
import { IncidentsApiService } from '../../infrastructure/api/incidents-api.service';
import { IncidentFilterStorage } from '../../infrastructure/persistence/incident-filter.storage';
import { LoggerService } from '../../../../core/logging/logger.service';
import { IncidentStatus } from '../../domain/models/incident.model';

describe('IncidentsStore', () => {
  let store: any;
  let api: IncidentsApiService;
  let storage: IncidentFilterStorage;
  let logger: LoggerService;

  const sampleIncident = {
    id: '1',
    title: 'Test',
    description: 'Desc',
    severity: 'high',
    status: 'open' as IncidentStatus,
    service: 'auth',
    affectedSystems: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    timeline: []
  };

  beforeEach(() => {
    api = {
      getIncidents: vi.fn().mockReturnValue(of({ incidents: [], total: 0, page: 1, pageSize: 10 })),
      getIncidentById: vi.fn().mockReturnValue(of({
        ...sampleIncident,
        created_at: sampleIncident.createdAt.toISOString(),
        updated_at: sampleIncident.updatedAt.toISOString(),
        affected_systems: [],
        assigned_to: undefined,
        timeline: []
      })),
      createIncident: vi.fn().mockReturnValue(of({
        ...sampleIncident,
        created_at: sampleIncident.createdAt.toISOString(),
        updated_at: sampleIncident.updatedAt.toISOString(),
        affected_systems: [],
        assigned_to: undefined,
        timeline: []
      })),
      updateIncident: vi.fn().mockReturnValue(of({
        ...sampleIncident,
        created_at: sampleIncident.createdAt.toISOString(),
        updated_at: sampleIncident.updatedAt.toISOString(),
        affected_systems: [],
        assigned_to: undefined,
        timeline: []
      })),
      deleteIncident: vi.fn().mockReturnValue(of(void 0)),
      assignIncident: vi.fn().mockReturnValue(of({
        ...sampleIncident,
        assigned_to: 'user-x',
        created_at: sampleIncident.createdAt.toISOString(),
        updated_at: sampleIncident.updatedAt.toISOString(),
        affected_systems: [],
        timeline: []
      })),
      changeStatus: vi.fn().mockReturnValue(of({
        ...sampleIncident,
        status: 'resolved',
        created_at: sampleIncident.createdAt.toISOString(),
        updated_at: sampleIncident.updatedAt.toISOString(),
        affected_systems: [],
        timeline: []
      }))
    } as unknown as IncidentsApiService;

    storage = {
      load: vi.fn().mockReturnValue({ search: 'foo' }),
      save: vi.fn(),
      clear: vi.fn()
    } as unknown as IncidentFilterStorage;

    logger = {
      info: vi.fn(),
      error: vi.fn()
    } as unknown as LoggerService;

    TestBed.configureTestingModule({
      providers: [
        IncidentsStore,
        { provide: IncidentsApiService, useValue: api },
        { provide: IncidentFilterStorage, useValue: storage },
        { provide: LoggerService, useValue: logger }
      ]
    });

    store = TestBed.inject(IncidentsStore);
  });

  it('hydrates filters from storage and applies defaults', () => {
    store.hydrateFromStorage();
    expect(store.filters().search).toBe('foo');
    expect(store.filters().sort?.field).toBe('createdAt');
  });

  it('updates filters and persists them', () => {
    store.updateFilters({ service: 'auth' });
    expect(storage.save).toHaveBeenCalled();
    expect(store.filters().service).toBe('auth');
    expect(store.pagination().page).toBe(1); // resets page
  });

  it('prevents invalid status transitions and sets error', () => {
    patchState(store, {
      incidents: [{ ...sampleIncident, status: 'closed' as IncidentStatus }],
      selectedIncident: { ...sampleIncident, status: 'closed' as IncidentStatus }
    });

    expect(() => store.changeStatus({ id: '1', status: 'open' })).toThrow();
    expect(store.error()).toBe('Invalid status transition');
  });

  it('loads incidents from API and updates pagination', async () => {
    const response = { incidents: [], total: 25, page: 2, pageSize: 10 };
    (api.getIncidents as any).mockReturnValue(of(response as any));

    store.changePage(2);
    store.loadIncidents();

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(api.getIncidents).toHaveBeenCalled();
    expect(store.pagination().page).toBe(2);
    expect(store.pagination().total).toBe(25);
  });

  it('handles API errors by setting error state', async () => {
    (api.getIncidents as any).mockReturnValue(throwError(() => new Error('boom')));
    store.loadIncidents();

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(store.error()).toBe('Failed to load incidents');
    expect(store.loading()).toBe(false);
  });
});
