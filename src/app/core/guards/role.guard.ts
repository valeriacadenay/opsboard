/**
 * Role Guard - Verifica roles del usuario
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { LoggerService } from '../logging/logger.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const logger = inject(LoggerService);

  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // TODO: Obtener roles del usuario desde auth.store
  const userRoles = ['admin']; // Mock

  const hasRole = requiredRoles.some(role => userRoles.includes(role));

  if (hasRole) {
    return true;
  }

  logger.warn('Access denied - Insufficient permissions', { requiredRoles, userRoles });
  router.navigate(['/unauthorized']);
  return false;
};
