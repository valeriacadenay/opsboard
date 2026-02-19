/**
 * Correlation ID Generator - Genera IDs únicos para rastreo de requests
 */

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CorrelationIdService {
  private currentId: string | null = null;

  /**
   * Genera un nuevo Correlation ID
   */
  generate(): string {
    this.currentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return this.currentId;
  }

  /**
   * Obtiene el Correlation ID actual
   */
  get(): string | null {
    return this.currentId;
  }

  /**
   * Limpia el Correlation ID actual
   */
  clear(): void {
    this.currentId = null;
  }
}
