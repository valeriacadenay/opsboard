// DTO definitions used by infrastructure adapters

import { IncidentSeverity, IncidentStatus, IncidentSortField, SortDirection } from '../models/incident.model';
import { SlaStatus } from '../models/incident.model';

export interface IncidentDTO {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  service: string;
  affected_systems: string[];
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  sla_due_at?: string;
  sla_status?: SlaStatus;
  tags?: string[];
  timeline: IncidentTimelineEventDTO[];
}

export interface IncidentTimelineEventDTO {
  id: string;
  type: 'status-change' | 'assignment' | 'comment' | 'update';
  message: string;
  at: string;
  actor: string;
  meta?: Record<string, unknown>;
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  severity: IncidentSeverity;
  service: string;
  affected_systems: string[];
  sla_due_at?: string;
  tags?: string[];
  assigned_to?: string;
}

export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  service?: string;
  affected_systems?: string[];
  assigned_to?: string;
  tags?: string[];
  sla_due_at?: string;
  sla_status?: SlaStatus;
}

export interface IncidentListRequestDTO {
  page: number;
  pageSize: number;
  filters?: Record<string, unknown>;
  sort?: {
    field: IncidentSortField;
    direction: SortDirection;
  };
}

export interface IncidentListResponseDTO {
  incidents: IncidentDTO[];
  total: number;
  page: number;
  pageSize: number;
}
