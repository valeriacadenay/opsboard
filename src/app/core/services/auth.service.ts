/**
 * Auth Service - Servicio de autenticación
 * TODO: Integrar con auth.store.ts existente
 */

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '../logging/logger.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Obtiene el token del storage
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Verifica si el token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.logger.info('User logged out');
    this.router.navigate(['/auth/login']);
  }
}
