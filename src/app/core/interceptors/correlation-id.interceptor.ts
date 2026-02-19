import { inject } from '@angular/core';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { CorrelationIdService } from '../logging/correlation-id.service';

export const correlationIdInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const correlation = inject(CorrelationIdService);
  const id = correlation.get() ?? correlation.generate();

  const cloned = req.clone({
    headers: req.headers.set('X-Correlation-ID', id)
  });

  return next(cloned);
};
