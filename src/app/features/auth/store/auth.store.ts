import { ComponentStore, OnStoreInit } from '@ngrx/component-store';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthState, initialAuthState, Credentials, MFARequest, TokenResponse } from '../models/auth.models';
import { AuthMockService } from '../services/auth-mock.service';
import { AuditService } from '../../audit/infrastructure/audit.service';

@Injectable({ providedIn: 'root' })
export class AuthStore extends ComponentStore<AuthState> implements OnStoreInit {
  private readonly authService = inject(AuthMockService);
  private readonly auditService = inject(AuditService);

  ngrxOnStoreInit(): void {
    this.loadPersistedAuth();
  }

  // ===== Updaters =====
  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading,
  }));

  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error,
  }));

  readonly setMFAPending = this.updater((state, mfaPending: boolean) => ({
    ...state,
    mfaPending,
  }));

  readonly setAuthState = this.updater((state, auth: TokenResponse) => ({
    ...state,
    user: auth.user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    isAuthenticated: true,
    mfaPending: false,
    error: null,
    loading: false,
  }));

  readonly clearAuth = this.updater(() => initialAuthState);

  // ===== Effects =====
  readonly login = this.effect((credentials$: Observable<Credentials>) =>
    credentials$.pipe(
      tap(() => this.setLoading(true)),
      tap((credentials) => {
        this.authService.login(credentials).subscribe({
          next: () => {
            this.setMFAPending(true);
            this.setLoading(false);
          },
          error: (err) => {
            this.setError(err.message);
            this.setLoading(false);
          },
        });
      })
    )
  );

  readonly verifyMFA = this.effect((request$: Observable<MFARequest>) =>
    request$.pipe(
      tap(() => this.setLoading(true)),
      tap((request) => {
        this.authService.verifyMFA(request).subscribe({
          next: (auth) => {
            this.setAuthState(auth);
            this.persistAuth(auth);
            this.auditService.record({
              user: auth.user.email,
              action: 'login',
              resource: 'auth',
              metadata: { userId: auth.user.id }
            });
          },
          error: (err) => {
            this.setError(err.message);
            this.setLoading(false);
          },
        });
      })
    )
  );

  readonly refreshAuthToken = this.effect(
    (refreshToken$: Observable<string>) =>
      refreshToken$.pipe(
        tap((refreshToken) => {
          this.authService.refreshToken(refreshToken).subscribe({
            next: (auth) => this.setAuthState(auth),
            error: (err) => {
              this.setError(err.message);
              this.clearAuth();
            },
          });
        })
      )
  );

  readonly logout = this.updater(() => {
    localStorage.removeItem('auth-state');
    return initialAuthState;
  });

  // ===== Selectors =====
  readonly user$ = this.select((state) => state.user);
  readonly isAuthenticated$ = this.select((state) => state.isAuthenticated);
  readonly loading$ = this.select((state) => state.loading);
  readonly error$ = this.select((state) => state.error);
  readonly mfaPending$ = this.select((state) => state.mfaPending);
  readonly accessToken$ = this.select((state) => state.accessToken);
  readonly refreshToken$ = this.select((state) => state.refreshToken);

  constructor() {
    super(initialAuthState);
  }

  private persistAuth(auth: TokenResponse): void {
    // WARNING: Storing tokens in localStorage is not secure!
    // This should only be used for demo/development purposes.
    // For production, use httpOnly cookies or secure session storage.
    // Risks: XSS attacks can steal tokens, lack of CSRF protection
    localStorage.setItem(
      'auth-state',
      JSON.stringify({
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        user: auth.user,
      })
    );
  }

  private loadPersistedAuth(): void {
    try {
      const persisted = localStorage.getItem('auth-state');
      if (persisted) {
        const auth = JSON.parse(persisted);
        this.patchState({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          user: auth.user,
          isAuthenticated: !!auth.user,
        });
      }
    } catch (e) {
      console.error('Failed to load persisted auth', e);
    }
  }
}
