/**
 * Mappers - Transforman DTOs a Domain Models y viceversa
 */

import { Incident, CreateIncidentPayload, UpdateIncidentPayload } from '../models/incident.model';
import { IncidentDTO, CreateIncidentDTO, UpdateIncidentDTO } from '../models/incident.dto';

export class IncidentMapper {
  /**
   * Convierte DTO de API a modelo de dominio
   */
  static toDomain(dto: IncidentDTO): Incident {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      status: dto.status,
      affectedSystems: dto.affected_systems,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      assignedTo: dto.assigned_to,
      tags: dto.tags || []
    };
  }

  /**
   * Convierte array de DTOs a modelos de dominio
   */
  static toDomainList(dtos: IncidentDTO[]): Incident[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Convierte payload de creación a DTO de API
   */
  static toCreateDTO(payload: CreateIncidentPayload): CreateIncidentDTO {
    return {
      title: payload.title,
      description: payload.description,
      severity: payload.severity,
      affected_systems: payload.affectedSystems,
      tags: payload.tags
    };
  }

  /**
   * Convierte payload de actualización a DTO de API
   */
  static toUpdateDTO(payload: UpdateIncidentPayload): UpdateIncidentDTO {
    return {
      title: payload.title,
      description: payload.description,
      severity: payload.severity,
      status: payload.status,
      affected_systems: payload.affectedSystems,
      assigned_to: payload.assignedTo,
      tags: payload.tags
    };
  }
}
