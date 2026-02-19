import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { AuditFacade } from '../application/facade/audit.facade';
import { AuditEntry } from '../domain/models/audit.model';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="audit-header">
      <div>
        <h1>Audit Trail</h1>
        <p>Track authentication, incident, and deployment actions.</p>
      </div>
      <div class="header-actions">
        <button type="button" (click)="exportCsv()">Export CSV</button>
        <button type="button" class="ghost" (click)="resetFilters()">Clear filters</button>
      </div>
    </section>

    <section class="audit-filters">
      <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
        <div class="row">
          <label>
            User
            <input type="text" formControlName="user" placeholder="email or name" />
          </label>
          <label>
            Action
            <input type="text" formControlName="action" placeholder="login, create_incident..." />
          </label>
          <label>
            Resource
            <input type="text" formControlName="resource" placeholder="auth, incident, deployment" />
          </label>
          <label>
            From
            <input type="date" formControlName="dateFrom" />
          </label>
          <label>
            To
            <input type="date" formControlName="dateTo" />
          </label>
          <button type="submit">Apply</button>
        </div>
      </form>
    </section>

    <section class="audit-table" *ngIf="!loading()">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let entry of entries()">
            <td>{{ entry.user }}</td>
            <td>{{ entry.action }}</td>
            <td>{{ entry.resource }}</td>
            <td>{{ entry.timestamp | date: 'short' }}</td>
          </tr>
          <tr *ngIf="entries().length === 0">
            <td colspan="4" class="empty">No audit records for the current filters.</td>
          </tr>
        </tbody>
      </table>
    </section>
    <section class="loading" *ngIf="loading()">Loading audit log...</section>
  `,
  styles: [`
    :host { display: block; padding: 1.5rem; }
    .audit-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .audit-header h1 { margin: 0; font-size: 1.5rem; }
    .audit-header p { margin: 0.25rem 0 0 0; color: #4b5563; }
    .header-actions { display: flex; gap: 0.5rem; align-items: center; }
    button { padding: 0.6rem 1rem; border: none; border-radius: 6px; background: #111827; color: #fff; cursor: pointer; }
    button.ghost { background: transparent; color: #111827; border: 1px solid #d1d5db; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .audit-filters { margin-bottom: 1rem; }
    form { display: flex; flex-direction: column; gap: 0.75rem; }
    .row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-end; }
    label { display: flex; flex-direction: column; font-size: 0.9rem; color: #374151; }
    input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; min-width: 10rem; }
    table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-radius: 8px; overflow: hidden; }
    th, td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; text-align: left; }
    th { background: #f9fafb; font-weight: 600; font-size: 0.9rem; color: #111827; }
    td { font-size: 0.9rem; color: #1f2937; }
    .empty { text-align: center; color: #6b7280; }
    .loading { padding: 1rem; color: #4b5563; }
  `]
})
export class AuditComponent implements OnInit {
  private readonly facade = inject(AuditFacade);
  private readonly fb = inject(FormBuilder);

  protected readonly entries = this.facade.entries$;
  protected readonly loading = this.facade.loading$;

  protected readonly filtersForm = this.fb.group({
    user: [''],
    action: [''],
    resource: [''],
    dateFrom: [''],
    dateTo: ['']
  });

  ngOnInit(): void {
    this.facade.initialize();
    const current = this.facade.filters$();
    this.filtersForm.patchValue(current, { emitEvent: false });
  }

  applyFilters(): void {
    const value = this.filtersForm.value;
    this.facade.updateFilters({
      user: value.user || undefined,
      action: value.action || undefined,
      resource: value.resource || undefined,
      dateFrom: value.dateFrom || undefined,
      dateTo: value.dateTo || undefined
    });
  }

  resetFilters(): void {
    this.filtersForm.reset({ user: '', action: '', resource: '', dateFrom: '', dateTo: '' });
    this.facade.clearFilters();
  }

  exportCsv(): void {
    const entries = this.entries();
    if (!entries.length) return;

    const header = ['User', 'Action', 'Resource', 'Date'];
    const rows = entries.map(e => [e.user, e.action, e.resource, new Date(e.timestamp).toISOString()]);
    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
