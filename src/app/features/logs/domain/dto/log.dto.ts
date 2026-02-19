import { LogLevel } from '../models/log-entry.model';

export interface LogDTO {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  context?: Record<string, unknown>;
}
