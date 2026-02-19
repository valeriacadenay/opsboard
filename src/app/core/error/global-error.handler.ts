/**
 * Error Handler Service - Manejo centralizado de errores
 */

import { Injectable, ErrorHandler, inject } from '@angular/core';
import { LoggerService } from '../logging/logger.service';
import { CorrelationIdService } from '../logging/correlation-id.service';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);
  private readonly correlationId = inject(CorrelationIdService);

  handleError(error: Error | unknown): void {
    const correlationId = this.correlationId.get() || this.correlationId.generate();

    if (error instanceof Error) {
      this.logger.error(
        `Uncaught Error: ${error.message}`,
        {
          name: error.name,
          stack: error.stack,
          error
        },
        correlationId
      );
    } else {
      this.logger.error(
        'Unknown error occurred',
        { error },
        correlationId
      );
    }

    // TODO: Mostrar notificación al usuario
    console.error('💥 Global Error Handler:', error);
  }
}
