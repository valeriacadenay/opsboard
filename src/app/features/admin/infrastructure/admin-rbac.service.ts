import { Injectable, inject } from '@angular/core';
import { AdminApiService } from './admin-api.service';
import { Permission } from '../domain/models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminRbacService {
  private readonly api = inject(AdminApiService);

  can(resource: string, action: string): boolean {
    const state = this.api.getState();
    const user = state.currentUser;
    if (!user) return false;
    const roles = state.roles.filter(r => user.roles.includes(r.name));
    const permissions = roles.flatMap(r => r.permissions) as Permission[];
    return permissions.some(p => p.resource === resource && p.actions.includes(action));
  }
}
