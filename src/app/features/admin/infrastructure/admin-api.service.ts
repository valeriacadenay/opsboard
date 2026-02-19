import { Injectable } from '@angular/core';
import { AdminMapper } from '../domain/mappers/admin.mapper';
import { AdminStateDTO, UserDTO, RoleDTO, FeatureFlagDTO } from '../domain/dto/admin.dto';
import { AdminStateModel, FeatureFlag, Role, User } from '../domain/models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly key = 'opsboard:admin:state';
  private state: AdminStateDTO;

  constructor() {
    const stored = this.load();
    if (stored) {
      this.state = stored;
    } else {
      this.state = this.seed();
      this.persist();
    }
  }

  getState(): AdminStateModel {
    return AdminMapper.toDomain(this.state);
  }

  upsertUser(user: User): AdminStateModel {
    const dto: UserDTO = { ...user };
    const users = this.state.users.some(u => u.id === user.id)
      ? this.state.users.map(u => u.id === user.id ? dto : u)
      : [...this.state.users, dto];
    this.state = { ...this.state, users, currentUser: this.state.currentUser || dto };
    this.persist();
    return this.getState();
  }

  deleteUser(id: string): AdminStateModel {
    this.state = { ...this.state, users: this.state.users.filter(u => u.id !== id) };
    this.persist();
    return this.getState();
  }

  upsertRole(role: Role): AdminStateModel {
    const dto: RoleDTO = { ...role };
    const roles = this.state.roles.some(r => r.id === role.id)
      ? this.state.roles.map(r => r.id === role.id ? dto : r)
      : [...this.state.roles, dto];
    this.state = { ...this.state, roles };
    this.persist();
    return this.getState();
  }

  upsertFlag(flag: FeatureFlag): AdminStateModel {
    const dto: FeatureFlagDTO = { ...flag };
    const featureFlags = this.state.featureFlags.some(f => f.key === flag.key)
      ? this.state.featureFlags.map(f => f.key === flag.key ? dto : f)
      : [...this.state.featureFlags, dto];
    this.state = { ...this.state, featureFlags };
    this.persist();
    return this.getState();
  }

  private load(): AdminStateDTO | null {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) as AdminStateDTO : null;
    } catch (error) {
      console.warn('Failed to load admin state', error);
      return null;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to persist admin state', error);
    }
  }

  private seed(): AdminStateDTO {
    const adminRole: RoleDTO = {
      id: 'role-admin',
      name: 'Admin',
      permissions: [
        { resource: 'incidents', actions: ['read', 'write'] },
        { resource: 'deployments', actions: ['read', 'write'] },
        { resource: 'logs', actions: ['read'] },
        { resource: 'users', actions: ['read', 'write'] },
        { resource: 'roles', actions: ['read', 'write'] },
        { resource: 'featureFlags', actions: ['read', 'write'] }
      ]
    };

    const viewerRole: RoleDTO = {
      id: 'role-viewer',
      name: 'Viewer',
      permissions: [
        { resource: 'incidents', actions: ['read'] },
        { resource: 'deployments', actions: ['read'] },
        { resource: 'logs', actions: ['read'] }
      ]
    };

    const featureFlags: FeatureFlagDTO[] = [
      { key: 'admin', enabled: true, description: 'Admin console' },
      { key: 'incidents', enabled: true },
      { key: 'deployments', enabled: true },
      { key: 'logs', enabled: true }
    ];

    const users: UserDTO[] = [
      {
        id: 'user-1',
        name: 'Alice Ops',
        email: 'alice@example.com',
        roles: ['Admin'],
        features: ['admin', 'incidents', 'deployments', 'logs'],
        preferences: { theme: 'light', language: 'en' }
      },
      {
        id: 'user-2',
        name: 'Bob Viewer',
        email: 'bob@example.com',
        roles: ['Viewer'],
        features: ['incidents', 'logs'],
        preferences: { theme: 'dark', language: 'es' }
      }
    ];

    return {
      users,
      roles: [adminRole, viewerRole],
      featureFlags,
      currentUser: users[0]
    };
  }
}
