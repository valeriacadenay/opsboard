import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SanitizationService } from '../security/sanitization.service';

export const sanitizationInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const sanitizer = inject(SanitizationService);

  const cleanBody = typeof req.body === 'object' && req.body !== null
    ? sanitizer.sanitize(req.body)
    : req.body;

  const cleanParams = req.params;

  const safeRequest = req.clone({ body: cleanBody, params: cleanParams });
  return next(safeRequest);
};
