import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { DataTableComponent, DataColumn, DataItem } from '../../../../../shared/ui';
import { IncidentsFacade } from '../../../application/facade/incidents.facade';
import { IncidentSeverity, IncidentStatus, SortDirection, SlaStatus } from '../../../domain/models/incident.model';

@Component({
  selector: 'app-incidents-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent],
  template: `
    <section class="filters">
      <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
        <div class="row">
          <label>
            Status
            <select formControlName="status" multiple>
              <option *ngFor="let status of statusOptions" [value]="status">{{ status }}</option>
            </select>
          </label>
          <label>
            Severity
            <select formControlName="severity" multiple>
              <option *ngFor="let severity of severityOptions" [value]="severity">{{ severity }}</option>
            </select>
          </label>
          <label>
            Service
            <input type="text" formControlName="service" placeholder="auth, payments..." />
          </label>
          <label>
            Date from
            <input type="date" formControlName="dateFrom" />
          </label>
          <label>
            Date to
            <input type="date" formControlName="dateTo" />
          </label>
          <label class="grow">
            Search
            <input type="text" formControlName="search" placeholder="Title or description" />
          </label>
        </div>
        <div class="actions">
          <button type="submit">Apply filters</button>
          <button type="button" class="ghost" (click)="resetFilters()">Reset</button>
        </div>
      </form>
    </section>

    <section class="table-section">
      <app-data-table
        title="Incidents"
        [items]="tableItems()"
        [columns]="columns"
        [loading]="loading()"
        [allowAdd]="true"
        [allowDelete]="true"
        [page]="pagination().page"
        [pageSize]="pagination().pageSize"
        [total]="pagination().total"
        [sort]="filters().sort"
        (refresh)="onRefresh()"
        (add)="toggleCreate()"
        (itemClicked)="onView($event)"
        (delete)="onDelete($event)"
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)" />
    </section>

    <section class="creation" *ngIf="showCreate">
      <h3>New incident</h3>
      <form [formGroup]="createForm" (ngSubmit)="onCreate()">
        <div class="row">
          <label>
            Title
            <input type="text" formControlName="title" />
          </label>
          <label>
            Severity
            <select formControlName="severity">
              <option *ngFor="let severity of severityOptions" [value]="severity">{{ severity }}</option>
            </select>
          </label>
          <label>
            Service
            <input type="text" formControlName="service" />
          </label>
          <label>
            SLA due
            <input type="datetime-local" formControlName="slaDueAt" />
          </label>
        </div>
        <label>
          Description
          <textarea formControlName="description" rows="3"></textarea>
        </label>
        <div class="actions">
          <button type="submit" [disabled]="createForm.invalid">Create</button>
          <button type="button" class="ghost" (click)="toggleCreate()">Cancel</button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .filters, .creation, .table-section { margin-bottom: 1rem; }
    form { display: flex; flex-direction: column; gap: 0.75rem; }
    .row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    label { display: flex; flex-direction: column; font-size: 0.9rem; color: #374151; }
    input, select, textarea { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; }
    select[multiple] { min-width: 8rem; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    button { padding: 0.6rem 1rem; border: none; border-radius: 6px; background: #111827; color: white; cursor: pointer; }
    button.ghost { background: transparent; color: #111827; border: 1px solid #d1d5db; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .grow { flex: 1; }
    .creation h3 { margin: 0 0 0.5rem 0; }
  `]
})
export class IncidentsListComponent implements OnInit {
  private readonly facade = inject(IncidentsFacade);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loading = this.facade.loading$;
  protected readonly pagination = this.facade.pagination$;
  protected readonly filters = this.facade.filters$;
  protected readonly incidents = this.facade.incidents$;

  protected readonly statusOptions: IncidentStatus[] = ['open', 'investigating', 'mitigated', 'resolved', 'closed'];
  protected readonly severityOptions: IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];

  protected showCreate = false;

  protected readonly severityBadgeMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success'
  };

  protected readonly statusBadgeMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    open: 'error',
    investigating: 'warning',
    mitigated: 'info',
    resolved: 'success',
    closed: 'info'
  };

  protected readonly slaBadgeMap: Record<SlaStatus, 'success' | 'warning' | 'error'> = {
    ok: 'success',
    risk: 'warning',
    breached: 'error'
  };

  protected readonly columns: DataColumn[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'severity', label: 'Severity', type: 'badge', sortable: true, badgeMap: this.severityBadgeMap },
    { key: 'status', label: 'Status', type: 'badge', sortable: true, badgeMap: this.statusBadgeMap },
    { key: 'service', label: 'Service', sortable: true },
    { key: 'slaStatus', label: 'SLA', type: 'badge', sortable: false, badgeMap: this.slaBadgeMap },
    { key: 'slaDueAt', label: 'SLA Due', type: 'date', sortable: false },
    { key: 'assignedTo', label: 'Assignee', sortable: false },
    { key: 'createdAt', label: 'Created', type: 'date', sortable: true }
  ];

  protected readonly filterForm = this.fb.group({
    status: [[] as IncidentStatus[]],
    severity: [[] as IncidentSeverity[]],
    service: [''],
    dateFrom: [''],
    dateTo: [''],
    search: ['']
  });

  protected readonly createForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(4)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    severity: ['medium', Validators.required],
    service: ['', Validators.required],
    affectedSystems: this.fb.control<string[]> (['core']),
    tags: this.fb.control<string[]>([]),
    slaDueAt: ['']
  });

  protected readonly tableItems = computed<DataItem[]>(() => this.incidents().map(incident => ({
    id: incident.id,
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    service: incident.service,
    slaStatus: incident.slaStatus ?? 'ok',
    slaDueAt: incident.slaDueAt,
    assignedTo: incident.assignedTo || 'Unassigned',
    createdAt: incident.createdAt
  })));

  ngOnInit(): void {
    const storedFilters = this.filters();
    this.filterForm.patchValue({
      status: storedFilters.status || [],
      severity: storedFilters.severity || [],
      service: storedFilters.service || '',
      dateFrom: storedFilters.dateFrom || '',
      dateTo: storedFilters.dateTo || '',
      search: storedFilters.search || ''
    }, { emitEvent: false });
  }

  applyFilters(): void {
    const value = this.filterForm.value;
    this.facade.updateFilters({
      status: value.status || [],
      severity: value.severity || [],
      service: value.service || undefined,
      dateFrom: value.dateFrom || undefined,
      dateTo: value.dateTo || undefined,
      search: value.search || undefined
    });
    this.facade.refresh();
  }

  resetFilters(): void {
    this.filterForm.reset({ status: [], severity: [], service: '', dateFrom: '', dateTo: '', search: '' });
    this.facade.resetFilters();
  }

  onRefresh(): void {
    this.facade.refresh();
  }

  toggleCreate(): void {
    this.showCreate = !this.showCreate;
    if (!this.showCreate) {
      this.createForm.reset({ severity: 'medium' });
    }
  }

  onCreate(): void {
    if (this.createForm.invalid) return;
    const value = this.createForm.value;
    this.facade.createIncident({
      title: value.title!,
      description: value.description!,
      severity: value.severity as IncidentSeverity,
      service: value.service!,
      affectedSystems: value.affectedSystems || [],
      tags: value.tags || [],
      slaDueAt: value.slaDueAt || undefined
    });
    this.toggleCreate();
  }

  onView(item: DataItem): void {
    this.facade.selectIncident(item.id);
    this.router.navigate(['./', item.id]);
  }

  onDelete(item: DataItem): void {
    this.facade.deleteIncident(item.id);
  }

  onPageChange(page: number): void {
    this.facade.changePage(page);
  }

  onSortChange(sort: { field: string; direction: SortDirection | null }): void {
    if (!sort.direction) return;
    this.facade.changeSort(sort.field as any, sort.direction);
  }
}
