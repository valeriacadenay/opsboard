/**
 * Config Service - Maneja configuración de la aplicación
 */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  apiUrl: string;
  production: boolean;
  enableDebugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  features: {
    enableMfa: boolean;
    enableAuditLog: boolean;
    enableAnalytics: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: AppConfig = {
    apiUrl: '/api',
    production: false,
    enableDebugMode: true,
    logLevel: 'debug',
    features: {
      enableMfa: true,
      enableAuditLog: true,
      enableAnalytics: false
    }
  };

  /**
   * Obtiene la configuración completa
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Obtiene un valor de configuración
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * Actualiza configuración
   */
  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Verifica si una feature está habilitada
   */
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }
}
