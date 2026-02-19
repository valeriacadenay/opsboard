import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { AuthApi } from '../auth/services/auth.api';
import { TokenService } from '../auth/services/token.service';
import { CorrelationIdService } from '../logging/correlation-id.service';
import { LoggerService } from '../logging/logger.service';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const authApi = inject(AuthApi);
  const correlation = inject(CorrelationIdService);
  const logger = inject(LoggerService);

  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/mfa')) {
    return next(req);
  }

  const accessToken = tokenService.getAccessToken();
  const authReq = accessToken ? attachToken(req, accessToken) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);

      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        tokenService.clear();
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshSubject.pipe(
          filter((token): token is string => !!token),
          take(1),
          switchMap((token) => next(attachToken(req, token)))
        );
      }

      isRefreshing = true;
      refreshSubject.next(null);

      logger.info('Refreshing access token', undefined, correlation.get() ?? correlation.generate());

      return authApi.refreshToken(refreshToken).pipe(
        switchMap((response) => {
          tokenService.setTokens(response.accessToken, response.refreshToken);
          refreshSubject.next(response.accessToken);
          return next(attachToken(req, response.accessToken));
        }),
        catchError((refreshError) => {
          tokenService.clear();
          refreshSubject.next(null);
          return throwError(() => refreshError);
        }),
        finalize(() => {
          isRefreshing = false;
        })
      );
    })
  );
};

function attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}
