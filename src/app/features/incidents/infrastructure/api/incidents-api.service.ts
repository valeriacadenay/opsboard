import { Injectable } from '@angular/core';
import { delay, of, throwError, Observable } from 'rxjs';
import { IncidentDTO, CreateIncidentDTO, UpdateIncidentDTO, IncidentListResponseDTO } from '../../domain/dto/incident.dto';
import { IncidentFilters, IncidentSortField, SortDirection, IncidentStatus, IncidentSeverity, SlaStatus } from '../../domain/models/incident.model';

interface GetIncidentsOptions {
  page: number;
  pageSize: number;
  filters?: IncidentFilters;
  sort?: {
    field: IncidentSortField;
    direction: SortDirection;
  };
}

@Injectable({ providedIn: 'root' })
export class IncidentsApiService {
  private readonly storageKey = 'opsboard:incidents:data';
  private incidents: IncidentDTO[] = [];

  constructor() {
    this.incidents = this.loadFromStorage();
    if (this.incidents.length === 0) {
      this.incidents = this.seedData();
      this.persist();
    }
  }

  getIncidents(options: GetIncidentsOptions): Observable<IncidentListResponseDTO> {
    const { page, pageSize, filters, sort } = options;
    let dataset = [...this.incidents];

    if (filters) {
      dataset = this.applyFilters(dataset, filters);
    }

    if (sort?.field && sort.direction) {
      dataset = this.applySort(dataset, sort.field, sort.direction);
    }

    const total = dataset.length;
    const start = (page - 1) * pageSize;
    const paged = dataset.slice(start, start + pageSize);

    return of({
      incidents: paged,
      total,
      page,
      pageSize
    }).pipe(delay(180));
  }

  getIncidentById(id: string): Observable<IncidentDTO> {
    const incident = this.incidents.find(i => i.id === id);
    if (!incident) {
      return throwError(() => new Error('Incident not found'));
    }
    return of(structuredClone(incident)).pipe(delay(150));
  }

  createIncident(dto: CreateIncidentDTO): Observable<IncidentDTO> {
    const now = new Date();
    const slaDueAt = dto.sla_due_at ? new Date(dto.sla_due_at) : new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const incident: IncidentDTO = {
      ...dto,
      id: this.uuid(),
      status: 'open',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      sla_due_at: slaDueAt.toISOString(),
      timeline: [
        {
          id: this.uuid(),
          type: 'comment',
          message: 'Incident created',
          at: now.toISOString(),
          actor: dto.assigned_to || 'system'
        }
      ],
      sla_status: this.computeSlaStatus({
        ...dto,
        id: '',
        status: 'open',
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        sla_due_at: slaDueAt.toISOString(),
        timeline: []
      } as IncidentDTO)
    };

    this.incidents = [incident, ...this.incidents];
    this.persist();

    return of(structuredClone(incident)).pipe(delay(120));
  }

  updateIncident(id: string, dto: UpdateIncidentDTO): Observable<IncidentDTO> {
    const existing = this.incidents.find(i => i.id === id);
    if (!existing) {
      return throwError(() => new Error('Incident not found'));
    }

    const now = new Date().toISOString();
    const nextTimeline = [...existing.timeline];

    if (dto.status && dto.status !== existing.status) {
      nextTimeline.push({
        id: this.uuid(),
        type: 'status-change',
        message: `Status changed to ${dto.status}`,
        at: now,
        actor: dto.assigned_to || existing.assigned_to || 'system'
      });
    }

    if (dto.assigned_to && dto.assigned_to !== existing.assigned_to) {
      nextTimeline.push({
        id: this.uuid(),
        type: 'assignment',
        message: `Assigned to ${dto.assigned_to}`,
        at: now,
        actor: dto.assigned_to
      });
    }

    const updated: IncidentDTO = {
      ...existing,
      ...dto,
      updated_at: now,
      sla_due_at: dto.sla_due_at ?? existing.sla_due_at,
      timeline: nextTimeline
    };

    updated.sla_status = this.computeSlaStatus(updated);

    this.incidents = this.incidents.map(i => i.id === id ? updated : i);
    this.persist();

    return of(structuredClone(updated)).pipe(delay(140));
  }

  deleteIncident(id: string): Observable<void> {
    this.incidents = this.incidents.filter(i => i.id !== id);
    this.persist();
    return of(void 0).pipe(delay(100));
  }

  changeStatus(id: string, status: IncidentStatus): Observable<IncidentDTO> {
    return this.updateIncident(id, { status });
  }

  assignIncident(id: string, userId: string): Observable<IncidentDTO> {
    return this.updateIncident(id, { assigned_to: userId });
  }

  addTimelineEvent(id: string, message: string, actor: string): Observable<IncidentDTO> {
    const incident = this.incidents.find(i => i.id === id);
    if (!incident) return throwError(() => new Error('Incident not found'));
    const now = new Date().toISOString();
    const updated: IncidentDTO = {
      ...incident,
      timeline: [
        ...incident.timeline,
        {
          id: this.uuid(),
          type: 'comment',
          message,
          at: now,
          actor
        }
      ],
      updated_at: now
    };
    this.incidents = this.incidents.map(i => i.id === id ? updated : i);
    this.persist();
    return of(structuredClone(updated)).pipe(delay(120));
  }

  private applyFilters(dataset: IncidentDTO[], filters: IncidentFilters): IncidentDTO[] {
    return dataset.filter(item => {
      const matchesStatus = !filters.status?.length || filters.status.includes(item.status);
      const matchesSeverity = !filters.severity?.length || filters.severity.includes(item.severity as IncidentSeverity);
      const matchesService = !filters.service || item.service.toLowerCase().includes(filters.service.toLowerCase());

      const createdAt = new Date(item.created_at).getTime();
      const from = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
      const to = filters.dateTo ? new Date(filters.dateTo).getTime() : null;
      const matchesDate = (!from || createdAt >= from) && (!to || createdAt <= to);

      const matchesSearch = !filters.search ||
        item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesSeverity && matchesService && matchesDate && matchesSearch;
    });
  }

  private applySort(dataset: IncidentDTO[], field: IncidentSortField, direction: SortDirection): IncidentDTO[] {
    const sortFactor = direction === 'asc' ? 1 : -1;
    return [...dataset].sort((a, b) => {
      if (field === 'severity') {
        const order: Record<IncidentSeverity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (order[a.severity as IncidentSeverity] - order[b.severity as IncidentSeverity]) * sortFactor;
      }
      if (field === 'status') {
        const order: Record<IncidentStatus, number> = { open: 5, investigating: 4, mitigated: 3, resolved: 2, closed: 1 };
        return (order[a.status as IncidentStatus] - order[b.status as IncidentStatus]) * sortFactor;
      }
      if (field === 'service') {
        return a.service.localeCompare(b.service) * sortFactor;
      }
      const aDate = field === 'createdAt' ? a.created_at : a.updated_at;
      const bDate = field === 'createdAt' ? b.created_at : b.updated_at;
      return (new Date(aDate).getTime() - new Date(bDate).getTime()) * sortFactor;
    });
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.incidents));
    } catch (error) {
      console.warn('Failed to persist incidents mock data', error);
    }
  }

  private loadFromStorage(): IncidentDTO[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as IncidentDTO[];
      return parsed;
    } catch (error) {
      console.warn('Failed to load incidents mock data', error);
      return [];
    }
  }

  private uuid(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  }

  private computeSlaStatus(dto: IncidentDTO): SlaStatus {
    if (!dto.sla_due_at) return 'ok';
    const due = new Date(dto.sla_due_at).getTime();
    const now = Date.now();
    const isClosed = dto.status === 'resolved' || dto.status === 'closed';
    const reference = isClosed ? new Date(dto.updated_at).getTime() : now;

    if (reference > due) return 'breached';
    if (isClosed) return 'ok';

    const riskThresholdMs = 2 * 60 * 60 * 1000;
    const timeLeft = due - now;
    return timeLeft <= riskThresholdMs ? 'risk' : 'ok';
  }

  private seedData(): IncidentDTO[] {
    const now = new Date();
    const base: IncidentDTO[] = [
      {
        id: this.uuid(),
        title: 'API latency in payments service',
        description: 'Increased latency observed in payment processing.',
        severity: 'high',
        status: 'investigating',
        service: 'payments',
        affected_systems: ['payments-api', 'payments-worker'],
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
        updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
        sla_due_at: new Date(now.getTime() + 1000 * 60 * 60 * 6).toISOString(),
        assigned_to: 'alice',
        tags: ['latency', 'p99'],
        timeline: [
          {
            id: this.uuid(),
            type: 'comment',
            message: 'Incident detected by monitoring',
            at: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
            actor: 'system'
          },
          {
            id: this.uuid(),
            type: 'assignment',
            message: 'Assigned to alice',
            at: new Date(now.getTime() - 1000 * 60 * 60 * 11).toISOString(),
            actor: 'alice'
          }
        ]
      },
      {
        id: this.uuid(),
        title: 'Error rate spike in auth service',
        description: '5xx error spike impacting login flow.',
        severity: 'critical',
        status: 'open',
        service: 'auth',
        affected_systems: ['auth-api'],
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
        updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
        sla_due_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        assigned_to: 'ops-bot',
        tags: ['errors'],
        timeline: [
          {
            id: this.uuid(),
            type: 'comment',
            message: 'Incident created from alert',
            at: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
            actor: 'system'
          }
        ]
      },
      {
        id: this.uuid(),
        title: 'Degraded search relevance',
        description: 'Search results are missing recent documents.',
        severity: 'medium',
        status: 'mitigated',
        service: 'search',
        affected_systems: ['search-api'],
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
        updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
        sla_due_at: new Date(now.getTime() + 1000 * 60 * 60 * 2).toISOString(),
        assigned_to: 'carol',
        tags: ['relevance'],
        timeline: [
          {
            id: this.uuid(),
            type: 'comment',
            message: 'Mitigation deployed',
            at: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
            actor: 'carol'
          }
        ]
      }
    ];

    return base.map(item => ({ ...item, updated_at: item.updated_at || item.created_at }));
  }
}
