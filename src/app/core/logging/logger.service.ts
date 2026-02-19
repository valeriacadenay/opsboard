/**
 * Logger Service - Servicio de logging centralizado con niveles
 */

import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: unknown;
  correlationId?: string;
}

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private currentLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  /**
   * Configura el nivel mínimo de logging
   */
  setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Log nivel DEBUG
   */
  debug(message: string, data?: unknown, correlationId?: string): void {
    this.log(LogLevel.DEBUG, message, data, correlationId);
  }

  /**
   * Log nivel INFO
   */
  info(message: string, data?: unknown, correlationId?: string): void {
    this.log(LogLevel.INFO, message, data, correlationId);
  }

  /**
   * Log nivel WARN
   */
  warn(message: string, data?: unknown, correlationId?: string): void {
    this.log(LogLevel.WARN, message, data, correlationId);
  }

  /**
   * Log nivel ERROR
   */
  error(message: string, data?: unknown, correlationId?: string): void {
    this.log(LogLevel.ERROR, message, data, correlationId);
  }

  /**
   * Log nivel FATAL
   */
  fatal(message: string, data?: unknown, correlationId?: string): void {
    this.log(LogLevel.FATAL, message, data, correlationId);
  }

  /**
   * Método interno de logging
   */
  private log(level: LogLevel, message: string, data?: unknown, correlationId?: string): void {
    if (level < this.currentLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      correlationId
    };

    // Almacenar en memoria
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    this.outputToConsole(entry);

    // TODO: Enviar a backend/servicio externo si es ERROR o FATAL
    if (level >= LogLevel.ERROR) {
      this.sendToBackend(entry);
    }
  }

  /**
   * Output a consola con colores
   */
  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}]`;
    const correlationStr = entry.correlationId ? `[${entry.correlationId}]` : '';
    const fullMessage = `${prefix}${correlationStr} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(fullMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(fullMessage, entry.data);
        break;
      case LogLevel.FATAL:
        console.error(`🔥 FATAL: ${fullMessage}`, entry.data);
        break;
    }
  }

  /**
   * Envía logs críticos al backend
   */
  private sendToBackend(entry: LogEntry): void {
    // TODO: Implementar envío a backend
    console.log('📤 Sending log to backend:', entry);
  }

  /**
   * Obtiene logs almacenados
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Limpia logs almacenados
   */
  clearLogs(): void {
    this.logs = [];
  }
}
