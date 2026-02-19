/**
 * Auth Guard - Protege rutas que requieren autenticación
 * Modernizado con functional guards de Angular
 */

import { inject, Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../logging/logger.service';

/**
 * Functional Guard (Moderno - Recomendado)
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  if (authService.isAuthenticated()) {
    return true;
  }

  logger.warn('Access denied - User not authenticated');
  router.navigate(['/auth/login']);
  return false;
};

/**
 * Class-based Guard (Legacy - Para compatibilidad)
 * @deprecated Use authGuard functional guard instead
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
