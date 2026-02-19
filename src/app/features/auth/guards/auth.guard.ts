import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { AuthFacade } from '../store/auth.facade';

@Injectable({ providedIn: 'root' })
export class AuthGuardService {
  private readonly facade = inject(AuthFacade);
  private readonly router = inject(Router);

  canActivate() {
    return this.facade.isAuthenticated$.pipe(
      tap((isAuth) => {
        if (!isAuth) {
          this.router.navigate(['/auth/login']);
        }
      }),
      map((isAuth) => !!isAuth)
    );
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return inject(AuthGuardService).canActivate();
};
