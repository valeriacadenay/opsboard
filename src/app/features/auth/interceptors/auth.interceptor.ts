import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, take, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../store/auth.facade';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const facade = inject(AuthFacade);

  return facade.accessToken$.pipe(
    take(1),
    switchMap((token) => {
      const bearer = token ?? '';
      const authedReq = bearer ? addToken(req, bearer) : req;
      return next(authedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            facade.logout();
          }
          return throwError(() => error);
        })
      );
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
