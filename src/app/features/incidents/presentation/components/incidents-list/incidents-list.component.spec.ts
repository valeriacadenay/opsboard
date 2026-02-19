import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IncidentsListComponent } from './incidents-list.component';
import { IncidentsFacade } from '../../../application/facade/incidents.facade';
import { IncidentFilters, IncidentStatus } from '../../../domain/models/incident.model';

describe('IncidentsListComponent', () => {
  let component: IncidentsListComponent;
  let fixture: ComponentFixture<IncidentsListComponent>;
  let facade: any;
  let router: Router;

  const baseFilters: IncidentFilters = {
    search: 'latency',
    status: ['open' as IncidentStatus],
    severity: ['high'],
    service: 'payments'
  };

  beforeEach(async () => {
    facade = {
      updateFilters: vi.fn(),
      resetFilters: vi.fn(),
      refresh: vi.fn(),
      createIncident: vi.fn(),
      deleteIncident: vi.fn(),
      changePage: vi.fn(),
      changeSort: vi.fn(),
      selectIncident: vi.fn(),
      incidents$: signal([]),
      loading$: signal(false),
      pagination$: signal({ page: 1, pageSize: 10, total: 0 }),
      filters$: signal(baseFilters)
    } as unknown as IncidentsFacade;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, IncidentsListComponent],
      providers: [{ provide: IncidentsFacade, useValue: facade }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentsListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should patch filter form with persisted filters on init', () => {
    expect(component['filterForm'].value.search).toBe(baseFilters.search);
    expect(component['filterForm'].value.service).toBe(baseFilters.service);
    expect(component['filterForm'].value.status).toEqual(baseFilters.status);
  });

  it('applyFilters should call facade.updateFilters and refresh', () => {
    component['filterForm'].patchValue({ service: 'auth' });
    component.applyFilters();
    expect(facade.updateFilters).toHaveBeenCalled();
    expect(facade.refresh).toHaveBeenCalled();
  });

  it('resetFilters should reset form and call facade.resetFilters', () => {
    component.resetFilters();
    expect(facade.resetFilters).toHaveBeenCalled();
    expect(component['filterForm'].value.service).toBe('');
  });

  it('onSortChange should ignore null direction', () => {
    component.onSortChange({ field: 'createdAt', direction: null });
    expect(facade.changeSort).not.toHaveBeenCalled();
  });

  it('onSortChange should call changeSort when direction is provided', () => {
    component.onSortChange({ field: 'createdAt', direction: 'asc' });
    expect(facade.changeSort).toHaveBeenCalledWith('createdAt', 'asc');
  });

  it('onPageChange should call facade.changePage', () => {
    component.onPageChange(2);
    expect(facade.changePage).toHaveBeenCalledWith(2);
  });

  it('onView should navigate to detail and select incident', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onView({ id: '123' } as any);
    expect(facade.selectIncident).toHaveBeenCalledWith('123');
    expect(navigateSpy).toHaveBeenCalled();
  });
});
