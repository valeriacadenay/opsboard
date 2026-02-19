import { Injectable, inject } from '@angular/core';
import { LoggerService, LogLevel } from './logger.service';

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'apikey', 'api_key'];

@Injectable({ providedIn: 'root' })
export class SecureLoggerService {
  private readonly logger = inject(LoggerService);

  debug(message: string, data?: unknown, correlationId?: string): void {
    this.logger.debug(message, this.mask(data), correlationId);
  }

  info(message: string, data?: unknown, correlationId?: string): void {
    this.logger.info(message, this.mask(data), correlationId);
  }

  warn(message: string, data?: unknown, correlationId?: string): void {
    this.logger.warn(message, this.mask(data), correlationId);
  }

  error(message: string, data?: unknown, correlationId?: string): void {
    this.logger.error(message, this.mask(data), correlationId);
  }

  fatal(message: string, data?: unknown, correlationId?: string): void {
    this.logger.fatal(message, this.mask(data), correlationId);
  }

  setLogLevel(level: LogLevel): void {
    this.logger.setLogLevel(level);
  }

  getLogs(level?: LogLevel) {
    return this.logger.getLogs(level);
  }

  clearLogs() {
    this.logger.clearLogs();
  }

  private mask(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(item => this.mask(item));

    const clone: Record<string, unknown> = {};
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        clone[key] = '***redacted***';
      } else if (typeof value === 'object' && value !== null) {
        clone[key] = this.mask(value);
      } else {
        clone[key] = value;
      }
    });
    return clone;
  }
}
