// Domain models for Incidents feature
// Encapsulates entities, value objects, and contracts used across layers

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed';
export type IncidentSortField = 'createdAt' | 'updatedAt' | 'severity' | 'status' | 'service';
export type SortDirection = 'asc' | 'desc';
export type SlaStatus = 'ok' | 'risk' | 'breached';

export interface IncidentTimelineEvent {
  id: string;
  type: 'status-change' | 'assignment' | 'comment' | 'update';
  message: string;
  at: Date;
  actor: string;
  meta?: Record<string, unknown>;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  service: string;
  affectedSystems: string[];
  createdAt: Date;
  updatedAt: Date;
  slaDueAt?: Date;
  slaStatus?: SlaStatus;
  assignedTo?: string;
  tags: string[];
  timeline: IncidentTimelineEvent[];
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  severity: IncidentSeverity;
  service: string;
  affectedSystems: string[];
  tags?: string[];
  assignedTo?: string;
  slaDueAt?: Date | string;
}

export interface UpdateIncidentPayload {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  service?: string;
  affectedSystems?: string[];
  assignedTo?: string;
  tags?: string[];
  slaDueAt?: Date | string;
}

export interface IncidentFilters {
  status?: IncidentStatus[];
  severity?: IncidentSeverity[];
  service?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: {
    field: IncidentSortField;
    direction: SortDirection;
  };
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface IncidentListResult {
  incidents: Incident[];
  total: number;
  page: number;
  pageSize: number;
}
