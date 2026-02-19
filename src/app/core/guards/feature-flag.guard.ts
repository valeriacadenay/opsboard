/**
 * Feature Flag Guard - Verifica si una feature está habilitada
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { LoggerService } from '../logging/logger.service';

export const featureFlagGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const configService = inject(ConfigService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  const requiredFeature = route.data['feature'] as string | undefined;

  if (!requiredFeature) {
    return true;
  }

  // TODO: Verificar contra lista de features habilitadas
  const config = configService.getConfig();
  const userFeatures = ['dashboard', 'incidents', 'deployments', 'audit', 'logs']; // Mock

  if (userFeatures.includes(requiredFeature)) {
    return true;
  }

  logger.warn('Access denied - Feature not enabled', { feature: requiredFeature });
  router.navigate(['/feature-disabled']);
  return false;
};
