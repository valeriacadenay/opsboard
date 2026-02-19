import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { DeploymentDTO, DeploymentListResponseDTO, DeploymentAuditDTO, DeploymentLogDTO, DeploymentStepDTO } from '../../domain/dto/deployment.dto';
import { DeploymentStatus } from '../../domain/models/deployment.model';

@Injectable({ providedIn: 'root' })
export class DeploymentsApiService {
  private readonly storageKey = 'opsboard:deployments:data';
  private deployments: DeploymentDTO[] = [];

  constructor() {
    this.deployments = this.loadFromStorage();
    if (this.deployments.length === 0) {
      this.deployments = this.seed();
      this.persist();
    }
  }

  list(): Observable<DeploymentListResponseDTO> {
    return of({ deployments: this.clone(this.deployments), total: this.deployments.length });
  }

  get(id: string): Observable<DeploymentDTO> {
    const found = this.deployments.find(d => d.id === id);
    if (!found) return throwError(() => new Error('Deployment not found'));
    return of(this.clone(found));
  }

  approve(id: string, actor: string): Observable<DeploymentDTO> {
    const deployment = this.require(id);
    if (deployment.status !== 'pending') return throwError(() => new Error('Invalid state'));
    const updated = {
      ...deployment,
      status: 'approved' as DeploymentStatus,
      updated_at: new Date().toISOString(),
      audit: [...deployment.audit, this.auditEntry(deployment.status, 'approved', actor)],
      logs: [...deployment.logs, this.log(`Approved by ${actor}`)]
    };
    this.replace(updated);
    return of(this.clone(updated));
  }

  start(id: string, actor: string): Observable<DeploymentDTO> {
    const deployment = this.require(id);
    if (deployment.status !== 'approved') return throwError(() => new Error('Invalid state'));
    const steps = deployment.steps.map((step, index) => ({
      ...step,
      status: index === 0 ? 'running' as const : 'idle' as const
    }));
    const updated = {
      ...deployment,
      status: 'running' as DeploymentStatus,
      progress: 5,
      steps,
      updated_at: new Date().toISOString(),
      audit: [...deployment.audit, this.auditEntry(deployment.status, 'running', actor)],
      logs: [...deployment.logs, this.log(`Deployment started by ${actor}`)]
    };
    this.replace(updated);
    return of(this.clone(updated));
  }

  setProgress(id: string, progress: number, stepIndex: number, actor: string): Observable<DeploymentDTO> {
    const deployment = this.require(id);
    const steps = deployment.steps.map((step, idx) => {
      if (idx < stepIndex) return { ...step, status: 'done' as const };
      if (idx === stepIndex) {
        const nextStatus: DeploymentStepDTO['status'] = progress >= 100 ? 'done' : 'running';
        return { ...step, status: nextStatus };
      }
      return step;
    });

    const updated = {
      ...deployment,
      progress,
      steps,
      updated_at: new Date().toISOString(),
      logs: [...deployment.logs, this.log(`Progress ${progress}%`, actor)]
    };
    this.replace(updated);
    return of(this.clone(updated));
  }

  finish(id: string, status: 'success' | 'failed', actor: string): Observable<DeploymentDTO> {
    const deployment = this.require(id);
    const updated = {
      ...deployment,
      status,
      progress: status === 'success' ? 100 : deployment.progress,
      steps: deployment.steps.map(step => ({ ...step, status: status === 'success' ? 'done' : step.status })),
      updated_at: new Date().toISOString(),
      audit: [...deployment.audit, this.auditEntry(deployment.status, status, actor)],
      logs: [...deployment.logs, this.log(`Deployment ${status}`, actor)]
    };
    this.replace(updated);
    return of(this.clone(updated));
  }

  private require(id: string): DeploymentDTO {
    const found = this.deployments.find(d => d.id === id);
    if (!found) throw new Error('Deployment not found');
    return found;
  }

  private replace(next: DeploymentDTO): void {
    this.deployments = this.deployments.map(d => d.id === next.id ? next : d);
    this.persist();
  }

  private log(message: string, actor = 'system'): DeploymentLogDTO {
    return { at: new Date().toISOString(), message, level: 'info' as const, actor };
  }

  private auditEntry(from: DeploymentStatus | null, to: DeploymentStatus, actor: string): DeploymentAuditDTO {
    return { at: new Date().toISOString(), actor, from, to };
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.deployments));
    } catch (error) {
      console.warn('Persist deployments failed', error);
    }
  }

  private loadFromStorage(): DeploymentDTO[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      return JSON.parse(raw) as DeploymentDTO[];
    } catch (error) {
      console.warn('Load deployments failed', error);
      return [];
    }
  }

  private seed(): DeploymentDTO[] {
    const now = new Date();
    const makeSteps = (service: string): DeploymentStepDTO[] => [
      { id: this.uuid(), title: `Build ${service}`, status: 'idle' as const, log: '' },
      { id: this.uuid(), title: `Deploy ${service}`, status: 'idle' as const, log: '' },
      { id: this.uuid(), title: 'Smoke tests', status: 'idle' as const, log: '' }
    ];

    return [
      {
        id: this.uuid(),
        name: 'Payments rollout',
        service: 'payments',
        version: 'v2.3.1',
        status: 'pending',
        progress: 0,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        steps: makeSteps('payments'),
        logs: [this.log('Deployment created', 'alice')],
        audit: [{ at: now.toISOString(), actor: 'alice', from: null, to: 'pending' }]
      },
      {
        id: this.uuid(),
        name: 'Auth hotfix',
        service: 'auth',
        version: 'v1.9.5',
        status: 'approved',
        progress: 0,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        steps: makeSteps('auth'),
        logs: [this.log('Approved by ops'), this.log('Ready to run')],
        audit: [
          { at: now.toISOString(), actor: 'ops', from: null, to: 'pending' },
          { at: now.toISOString(), actor: 'ops', from: 'pending', to: 'approved' }
        ]
      }
    ];
  }

  private clone<T>(value: T): T {
    return structuredClone(value);
  }

  private uuid(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  }
}
