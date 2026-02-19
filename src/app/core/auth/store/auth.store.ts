import { inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of } from 'rxjs';

import { AuthApi } from '../services/auth.api';
import { TokenService } from '../services/token.service';
import { LoginRequestDTO, LoginResponseDTO } from '../models/auth.dto';
import { User } from '../models/user.model';

export interface AuthState {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  mfaRequired: boolean;
}

const initialState: AuthState = {
  user: null,
  authenticated: false,
  loading: false,
  mfaRequired: false
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  
  withState<AuthState>(initialState),

  withComputed((store) => ({
    isAuthenticated: () => store.authenticated(),
    isAdmin: () => store.user()?.roles.includes('admin') ?? false
  })),

  withMethods(
    (
      store,
      api = inject(AuthApi),
      tokenService = inject(TokenService)
    ) => ({
      login: rxMethod<LoginRequestDTO>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((dto: LoginRequestDTO) =>
            api.login(dto).pipe(
              tap((res: LoginResponseDTO) => {
                if (res.mfaRequired) {
                  patchState(store, {
                    loading: false,
                    mfaRequired: true
                  });
                  return;
                }

                tokenService.setTokens(res.accessToken, res.refreshToken);

                patchState(store, {
                  authenticated: true,
                  loading: false,
                  user: mockUser(dto.username),
                  mfaRequired: false
                });
              }),
              catchError(error => {
                patchState(store, { loading: false });
                console.error('Login failed:', error);
                return of(null);
              })
            )
          )
        )
      ),

      completeMfa: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(code =>
            api.verifyMfa(code).pipe(
              tap(() => {
                patchState(store, {
                  authenticated: true,
                  loading: false,
                  mfaRequired: false,
                  user: mockUser('admin')
                });
              }),
              catchError(error => {
                patchState(store, { loading: false });
                console.error('MFA verification failed:', error);
                return of(null);
              })
            )
          )
        )
      ),

      logout() {
        tokenService.clear();
        patchState(store, initialState);
      }
    })
  )
);

/* 🔧 helpers mockeados (backend real los reemplaza) */
function mockUser(username: string): User {
  return {
    id: crypto.randomUUID(),
    username,
    roles: ['admin'],
    features: ['dashboard', 'incidents', 'deployments', 'audit', 'logs']
  };
}
