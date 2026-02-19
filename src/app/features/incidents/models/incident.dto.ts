/**
 * DTOs - Data Transfer Objects para la API
 */

export interface IncidentDTO {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  affected_systems: string[];
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  tags?: string[];
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affected_systems: string[];
  tags?: string[];
}

export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  status?: 'open' | 'investigating' | 'resolved' | 'closed';
  affected_systems?: string[];
  assigned_to?: string;
  tags?: string[];
}

export interface IncidentListResponseDTO {
  incidents: IncidentDTO[];
  total: number;
  page: number;
  pageSize: number;
}
