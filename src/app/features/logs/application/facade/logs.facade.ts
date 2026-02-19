import { Injectable, inject } from '@angular/core';
import { LogsStore } from '../state/logs.store';
import { LogFilters } from '../../domain/models/log-entry.model';

@Injectable({ providedIn: 'root' })
export class LogsFacade {
  private readonly store = inject(LogsStore);

  readonly logs$ = this.store.logs;
  readonly streaming$ = this.store.streaming;
  readonly filters$ = this.store.filters;
  readonly error$ = this.store.error;

  start(): void {
    this.store.startStreaming();
  }

  stop(): void {
    this.store.stopStreaming();
  }

  toggle(): void {
    this.store.toggleStreaming();
  }

  updateFilters(filters: Partial<LogFilters>): void {
    this.store.updateFilters(filters);
  }

  clear(): void {
    this.store.clearLogs();
  }
}
