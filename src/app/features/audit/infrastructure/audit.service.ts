import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuditEntry } from '../domain/models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly storageKey = 'audit-log';
  private readonly entries$ = new BehaviorSubject<AuditEntry[]>(this.load());

  list(): Observable<AuditEntry[]> {
    return this.entries$.asObservable();
  }

  record(input: { user?: string; action: string; resource: string; metadata?: Record<string, unknown> }): void {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      user: input.user ?? this.resolveCurrentUser(),
      action: input.action,
      resource: input.resource,
      timestamp: new Date().toISOString(),
      metadata: input.metadata
    };

    const next = [entry, ...this.entries$.value];
    this.entries$.next(next);
    this.persist(next);
  }

  private load(): AuditEntry[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as AuditEntry[] : [];
    } catch (error) {
      console.error('Failed to load audit log', error);
      return [];
    }
  }

  private persist(entries: AuditEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to persist audit log', error);
    }
  }

  private resolveCurrentUser(): string {
    try {
      const raw = localStorage.getItem('auth-state');
      if (!raw) return 'system';
      const parsed = JSON.parse(raw);
      return parsed.user?.email || parsed.user?.name || 'system';
    } catch {
      return 'system';
    }
  }
}
