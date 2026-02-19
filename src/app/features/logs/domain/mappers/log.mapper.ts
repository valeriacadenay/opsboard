import { LogDTO } from '../dto/log.dto';
import { LogEntry } from '../models/log-entry.model';

export class LogMapper {
  static toDomain(dto: LogDTO): LogEntry {
    return {
      id: dto.id,
      timestamp: new Date(dto.timestamp),
      level: dto.level,
      message: dto.message,
      service: dto.service,
      context: dto.context
    };
  }

  static toDomainList(dtos: LogDTO[]): LogEntry[] {
    return dtos.map(this.toDomain);
  }
}
