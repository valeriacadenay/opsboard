/**
 * Domain Models - Modelos de dominio para la aplicación
 */

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedSystems: string[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  tags: string[];
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  severity: IncidentSeverity;
  affectedSystems: string[];
  tags?: string[];
}

export interface UpdateIncidentPayload {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  affectedSystems?: string[];
  assignedTo?: string;
  tags?: string[];
}
