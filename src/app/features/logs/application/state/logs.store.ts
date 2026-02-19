import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Subscription } from 'rxjs';
import { LogEntry, LogFilters, LogLevel } from '../../domain/models/log-entry.model';
import { LogStreamService } from '../../infrastructure/log-stream.service';
import { LogMapper } from '../../domain/mappers/log.mapper';
import { SecureLoggerService } from '../../../../core/logging/secure-logger.service';

interface LogsState {
  logs: LogEntry[];
  streaming: boolean;
  filters: LogFilters;
  error: string | null;
}

const initialState: LogsState = {
  logs: [],
  streaming: false,
  filters: { levels: ['info', 'warn', 'error'] },
  error: null
};

export const LogsStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withMethods((store,
    stream = inject(LogStreamService),
    logger = inject(SecureLoggerService)
  ) => {
    let streamSub: Subscription | null = null;

    const applyDateFilter = (entries: LogEntry[], filters: LogFilters) => {
      const from = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
      const to = filters.dateTo ? new Date(filters.dateTo).getTime() : null;
      return entries.filter(e => {
        const ts = e.timestamp.getTime();
        return (!from || ts >= from) && (!to || ts <= to);
      });
    };

    const appendLogs = (incoming: LogEntry[]) => {
      const filtered = applyDateFilter(incoming, store.filters());
      const next = [...filtered, ...store.logs()].slice(0, 2000); // keep recent
      patchState(store, { logs: next });
    };

    return {
      startStreaming() {
        if (store.streaming()) return;
        patchState(store, { streaming: true, error: null });
        const filters = store.filters();
        streamSub = stream.stream({
          levels: filters.levels,
          service: filters.service,
          search: filters.search
        }).subscribe({
          next: batch => {
            const entries = LogMapper.toDomainList(batch);
            appendLogs(entries);
          },
          error: err => {
            logger.error('Log stream failed', err);
            patchState(store, { streaming: false, error: 'Stream error' });
          }
        });
      },

      stopStreaming() {
        streamSub?.unsubscribe();
        streamSub = null;
        patchState(store, { streaming: false });
      },

      toggleStreaming() {
        store.streaming() ? this.stopStreaming() : this.startStreaming();
      },

      updateFilters(filters: Partial<LogFilters>) {
        const merged = { ...store.filters(), ...filters };
        patchState(store, { filters: merged });
        if (store.streaming()) {
          this.stopStreaming();
          this.startStreaming();
        }
      },

      clearLogs() {
        patchState(store, { logs: [] });
      }
    };
  })
);
