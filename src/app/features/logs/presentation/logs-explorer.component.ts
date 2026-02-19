import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, effect, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LogsFacade } from '../application/facade/logs.facade';
import { LogLevel } from '../domain/models/log-entry.model';

@Component({
  selector: 'app-logs-explorer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScrollingModule],
  template: `
    <section class="controls">
      <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
        <input type="text" formControlName="search" placeholder="Search text" />
        <select formControlName="service">
          <option value="">All services</option>
          <option *ngFor="let s of services" [value]="s">{{ s }}</option>
        </select>
        <select formControlName="levels" multiple>
          <option *ngFor="let l of levels" [value]="l">{{ l }}</option>
        </select>
        <label>From <input type="date" formControlName="dateFrom" /></label>
        <label>To <input type="date" formControlName="dateTo" /></label>
        <button type="submit">Apply</button>
        <button type="button" class="ghost" (click)="clearFilters()">Reset</button>
      </form>
      <div class="actions">
        <button (click)="toggleStreaming()">{{ streaming() ? 'Stop' : 'Start' }} streaming</button>
        <button class="ghost" (click)="clearLogs()">Clear logs</button>
        <span class="badge" [class.streaming]="streaming()">{{ streaming() ? 'Streaming' : 'Stopped' }}</span>
      </div>
    </section>

    <section class="table">
      <cdk-virtual-scroll-viewport itemSize="48" class="viewport">
        <div *cdkVirtualFor="let log of logs(); trackBy: trackLog" class="row">
          <span class="timestamp">{{ log.timestamp | date:'shortTime' }}</span>
          <span class="level" [class]="'level-' + log.level">{{ log.level }}</span>
          <span class="service">{{ log.service }}</span>
          <span class="message">{{ log.message }}</span>
        </div>
      </cdk-virtual-scroll-viewport>
    </section>
  `,
  styles: [`
    .controls { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    form { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    input, select, button { padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid #d1d5db; }
    button { background: #111827; color: #fff; cursor: pointer; }
    button.ghost { background: transparent; color: #111827; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 999px; background: #e5e7eb; }
    .badge.streaming { background: #ecfdf3; color: #15803d; }
    .table { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .viewport { height: 420px; width: 100%; }
    .row { display: grid; grid-template-columns: 110px 80px 130px 1fr; gap: 0.5rem; align-items: center; padding: 0.5rem 0.75rem; border-bottom: 1px solid #f3f4f6; }
    .row:nth-child(2n) { background: #fafafa; }
    .timestamp { color: #6b7280; font-size: 0.9rem; }
    .level { text-transform: uppercase; font-weight: 600; }
    .level-debug { color: #6b7280; }
    .level-info { color: #2563eb; }
    .level-warn { color: #d97706; }
    .level-error { color: #b91c1c; }
    .service { font-weight: 600; color: #111827; }
    .message { color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  `]
})
export class LogsExplorerComponent implements OnInit, OnDestroy {
  private readonly facade = inject(LogsFacade);
  private readonly fb = inject(FormBuilder);

  protected readonly logs = this.facade.logs$;
  protected readonly streaming = this.facade.streaming$;

  protected readonly levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  protected readonly services = ['auth', 'payments', 'search', 'deployments', 'notifications'];

  protected readonly filtersForm = this.fb.group({
    search: [''],
    service: [''],
    levels: [[] as LogLevel[]],
    dateFrom: [''],
    dateTo: ['']
  });

  protected readonly logsCount = computed(() => this.logs().length);

  ngOnInit(): void {
    this.facade.start();
    effect(() => {
      const filters = this.facade.filters$();
      this.filtersForm.patchValue({
        search: filters.search || '',
        service: filters.service || '',
        levels: filters.levels || [],
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || ''
      }, { emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.facade.stop();
  }

  applyFilters(): void {
    const value = this.filtersForm.value;
    this.facade.updateFilters({
      search: value.search || undefined,
      service: value.service || undefined,
      levels: (value.levels as LogLevel[]) || [],
      dateFrom: value.dateFrom || undefined,
      dateTo: value.dateTo || undefined
    });
  }

  clearFilters(): void {
    this.filtersForm.reset({ search: '', service: '', levels: [], dateFrom: '', dateTo: '' });
    this.facade.updateFilters({ search: undefined, service: undefined, levels: [], dateFrom: undefined, dateTo: undefined });
  }

  toggleStreaming(): void {
    this.facade.toggle();
  }

  clearLogs(): void {
    this.facade.clear();
  }

  trackLog = (_: number, log: { id: string }) => log.id;
}
