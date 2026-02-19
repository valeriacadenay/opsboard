import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { CorrelationIdService } from '../logging/correlation-id.service';
import { LoggerService } from '../logging/logger.service';

export const errorNormalizationInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const correlation = inject(CorrelationIdService);
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const correlationId = correlation.get() ?? correlation.generate();

      const normalized = {
        message: error.error?.message || error.statusText || 'Unexpected error',
        status: error.status || 0,
        code: error.error?.code || 'UNKNOWN',
        correlationId,
        timestamp: new Date().toISOString(),
        path: req.url,
        details: error.error?.errors ?? null
      };

      logger.error('HTTP error normalized', { normalized, original: error }, correlationId);

      const forwarded = new HttpErrorResponse({
        ...error,
        url: error.url ?? undefined,
        error: normalized
      });

      return throwError(() => forwarded);
    })
  );
};
