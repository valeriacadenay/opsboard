/**
 * HTTP Error Interceptor - Intercepta y maneja errores HTTP
 */

import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerService } from '../logging/logger.service';
import { CorrelationIdService } from '../logging/correlation-id.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private readonly logger = inject(LoggerService);
  private readonly correlationId = inject(CorrelationIdService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const correlationId = this.correlationId.get();
        
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMessage = `Client Error: ${error.error.message}`;
        } else {
          // Error del servidor
          errorMessage = `Server Error: ${error.status} - ${error.message}`;
        }

        this.logger.error(
          errorMessage,
          {
            url: req.url,
            method: req.method,
            status: error.status,
            statusText: error.statusText,
            error: error.error
          },
          correlationId || undefined
        );

        return throwError(() => error);
      })
    );
  }
}
