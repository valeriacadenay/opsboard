/**
 * Correlation ID Interceptor - Agrega Correlation ID a todos los requests
 */

import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorrelationIdService } from '../logging/correlation-id.service';

@Injectable()
export class CorrelationIdInterceptor implements HttpInterceptor {
  private readonly correlationIdService = inject(CorrelationIdService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let correlationId = this.correlationIdService.get();
    
    if (!correlationId) {
      correlationId = this.correlationIdService.generate();
    }

    const clonedRequest = req.clone({
      headers: req.headers.set('X-Correlation-ID', correlationId)
    });

    return next.handle(clonedRequest);
  }
}
