import { Injectable, inject } from '@angular/core';
import { Observable, interval, map, share, bufferTime, filter } from 'rxjs';
import { LogDTO } from '../domain/dto/log.dto';
import { LogLevel } from '../domain/models/log-entry.model';
import { SecureLoggerService } from '../../../core/logging/secure-logger.service';

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const SERVICES = ['auth', 'payments', 'search', 'deployments', 'notifications'];

@Injectable({ providedIn: 'root' })
export class LogStreamService {
  private readonly logger = inject(SecureLoggerService);

  stream(filters?: { levels?: LogLevel[]; service?: string; search?: string }): Observable<LogDTO[]> {
    const source = interval(500).pipe(
      map(idx => this.makeLog(idx)),
      map(log => this.applyFilters(log, filters)),
      filter((log): log is LogDTO => !!log),
      share()
    );

    // bufferTime to batch logs for UI updates
    return source.pipe(bufferTime(800), map(batch => batch.filter(Boolean) as LogDTO[]));
  }

  private makeLog(idx: number): LogDTO {
    const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const message = this.randomMessage(level, service, idx);
    const context = this.maskContext({
      requestId: this.uuid(),
      user: Math.random() > 0.5 ? 'alice' : 'service-account',
      password: 'super-secret',
      token: 'abc123'
    });
    return {
      id: this.uuid(),
      timestamp: new Date().toISOString(),
      level,
      message,
      service,
      context
    };
  }

  private applyFilters(log: LogDTO, filters?: { levels?: LogLevel[]; service?: string; search?: string }): LogDTO | null {
    if (!log) return null;
    if (filters?.levels?.length && !filters.levels.includes(log.level)) return null;
    if (filters?.service && log.service !== filters.service) return null;
    if (filters?.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) return null;
    return log;
  }

  private randomMessage(level: LogLevel, service: string, idx: number): string {
    const base = {
      debug: 'Debugging step',
      info: 'Operation succeeded',
      warn: 'Latency high',
      error: 'Unhandled exception'
    };
    return `${base[level]} - ${service} - #${idx}`;
  }

  private maskContext(context: Record<string, unknown>) {
    const sensitiveKeys = ['password', 'token', 'authorization', 'secret'];
    const clone: Record<string, unknown> = {};
    Object.entries(context).forEach(([key, value]) => {
      clone[key] = sensitiveKeys.includes(key.toLowerCase()) ? '***redacted***' : value;
    });
    this.logger.debug('Masking log context', clone);
    return clone;
  }

  private uuid(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  }
}
