export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  service: string;
  context?: Record<string, unknown>;
}

export interface LogFilters {
  search?: string;
  levels?: LogLevel[];
  service?: string;
  dateFrom?: string;
  dateTo?: string;
  streaming?: boolean;
}
