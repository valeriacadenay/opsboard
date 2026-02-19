export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AuditFilters {
  user?: string;
  action?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
}
