/**
 * Auth Interceptor - Agrega token de autenticación a requests
 */

import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

// TODO: Implementar TokenService real
class TokenService {
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly tokenService = new TokenService(); // TODO: inject real service

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // No agregar token a requests de autenticación
    if (req.url.includes('/auth/')) {
      return next.handle(req);
    }

    const token = this.tokenService.getAccessToken();

    if (token) {
      const clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(clonedRequest);
    }

    return next.handle(req);
  }
}
