import { Injectable, inject } from '@angular/core';
import { AuthStore } from './auth.store';
import { Credentials, MFARequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authStore = inject(AuthStore);

  // Selectors
  user$ = this.authStore.user$;
  isAuthenticated$ = this.authStore.isAuthenticated$;
  loading$ = this.authStore.loading$;
  error$ = this.authStore.error$;
  mfaPending$ = this.authStore.mfaPending$;
  accessToken$ = this.authStore.accessToken$;
  refreshToken$ = this.authStore.refreshToken$;

  login(credentials: Credentials): void {
    this.authStore.login(credentials);
  }

  verifyMFA(email: string, code: string): void {
    this.authStore.verifyMFA({ email, code });
  }

  logout(): void {
    this.authStore.logout();
  }

  refreshToken(refreshToken: string): void {
    this.authStore.refreshAuthToken(refreshToken);
  }
}
