import { Incident, CreateIncidentPayload, UpdateIncidentPayload, IncidentTimelineEvent, SlaStatus } from '../models/incident.model';
import { IncidentDTO, CreateIncidentDTO, UpdateIncidentDTO } from '../dto/incident.dto';

const SLA_RISK_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

export class IncidentMapper {
  static toDomain(dto: IncidentDTO): Incident {
    const slaDueAt = dto.sla_due_at ? new Date(dto.sla_due_at) : undefined;
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      status: dto.status,
      service: dto.service,
      affectedSystems: dto.affected_systems,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      slaDueAt,
      slaStatus: dto.sla_status ?? computeSlaStatus(dto, slaDueAt),
      assignedTo: dto.assigned_to,
      tags: dto.tags || [],
      timeline: dto.timeline.map(this.toDomainTimeline)
    };
  }

  static toDomainList(dtos: IncidentDTO[]): Incident[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  static toDomainTimeline(dto: { id: string; type: string; message: string; at: string; actor: string; meta?: Record<string, unknown>; }): IncidentTimelineEvent {
    return {
      id: dto.id,
      type: dto.type as IncidentTimelineEvent['type'],
      message: dto.message,
      at: new Date(dto.at),
      actor: dto.actor,
      meta: dto.meta
    };
  }

  static toCreateDTO(payload: CreateIncidentPayload): CreateIncidentDTO {
    return {
      title: payload.title,
      description: payload.description,
      severity: payload.severity,
      service: payload.service,
      affected_systems: payload.affectedSystems,
      sla_due_at: payload.slaDueAt ? new Date(payload.slaDueAt).toISOString() : undefined,
      tags: payload.tags,
      assigned_to: payload.assignedTo
    };
  }

  static toUpdateDTO(payload: UpdateIncidentPayload): UpdateIncidentDTO {
    return {
      title: payload.title,
      description: payload.description,
      severity: payload.severity,
      status: payload.status,
      service: payload.service,
      affected_systems: payload.affectedSystems,
      sla_due_at: payload.slaDueAt ? new Date(payload.slaDueAt).toISOString() : undefined,
      assigned_to: payload.assignedTo,
      tags: payload.tags
    };
  }
}

function computeSlaStatus(dto: IncidentDTO, slaDueAt?: Date): SlaStatus {
  if (!slaDueAt) return 'ok';
  const due = slaDueAt.getTime();
  const now = Date.now();

  const isClosed = dto.status === 'resolved' || dto.status === 'closed';
  const reference = isClosed ? new Date(dto.updated_at).getTime() : now;

  if (reference > due) return 'breached';

  if (isClosed) return 'ok';

  const timeLeft = due - now;
  return timeLeft <= SLA_RISK_THRESHOLD_MS ? 'risk' : 'ok';
}
