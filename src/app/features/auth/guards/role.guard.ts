import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../store/auth.facade';
import { User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class RoleGuardService {
  private readonly facade = inject(AuthFacade);
  private readonly router = inject(Router);

  canActivate(requiredRoles: string[]) {
    return this.facade.user$.pipe(
      map((user: User | null) => user?.roles ?? []),
      map((roles) => {
        const hasRole = requiredRoles.some((role) => roles.includes(role));
        if (!hasRole) {
          this.router.navigate(['/unauthorized']);
        }
        return hasRole;
      })
    );
  }
}

export const roleGuard =
  (requiredRoles: string[]): CanActivateFn =>
  () => {
    return inject(RoleGuardService).canActivate(requiredRoles);
  };
