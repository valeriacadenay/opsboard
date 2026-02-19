import { inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { AuthApi } from '../services/auth.api';
import { TokenService } from '../services/token.service';
import { LoginRequestDTO } from '../models/auth.dto';
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
      async login(dto: LoginRequestDTO) {
        store.patchState({ loading: true });

        const res = await firstValueFrom(api.login(dto));

        if (res.mfaRequired) {
          store.patchState({
            loading: false,
            mfaRequired: true
          });
          return;
        }

        tokenService.setTokens(res.accessToken, res.refreshToken);

        store.patchState({
          authenticated: true,
          loading: false,
          user: mockUser(dto.username),
          mfaRequired: false
        });
      },

      async completeMfa(code: string) {
        store.patchState({ loading: true });

        await firstValueFrom(api.verifyMfa(code));

        store.patchState({
          authenticated: true,
          loading: false,
          mfaRequired: false,
          user: mockUser('admin')
        });
      },

      logout() {
        tokenService.clear();
        store.setState(initialState);
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
