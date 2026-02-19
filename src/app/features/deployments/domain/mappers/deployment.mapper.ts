import { Deployment, DeploymentAuditEntry, DeploymentLog, DeploymentStep } from '../models/deployment.model';
import { DeploymentAuditDTO, DeploymentDTO, DeploymentLogDTO, DeploymentStepDTO } from '../dto/deployment.dto';

export class DeploymentMapper {
  static toDomain(dto: DeploymentDTO): Deployment {
    return {
      id: dto.id,
      name: dto.name,
      service: dto.service,
      version: dto.version,
      status: dto.status,
      progress: dto.progress,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      steps: dto.steps.map(this.stepToDomain),
      logs: dto.logs.map(this.logToDomain),
      audit: dto.audit.map(this.auditToDomain)
    };
  }

  static toDomainList(dtos: DeploymentDTO[]): Deployment[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  private static stepToDomain(step: DeploymentStepDTO): DeploymentStep {
    return { ...step };
  }

  private static logToDomain(log: DeploymentLogDTO): DeploymentLog {
    return { ...log, at: new Date(log.at) };
  }

  private static auditToDomain(entry: DeploymentAuditDTO): DeploymentAuditEntry {
    return { ...entry, at: new Date(entry.at) };
  }
}
