import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Credentials, MFARequest, TokenResponse, User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthMockService {
  private readonly MOCK_MFA_CODE = '123456';

  private readonly mockUsers: Record<string, { password: string; user: User }> = {
    'admin@test.com': {
      password: 'admin123',
      user: {
        id: 'user-1',
        email: 'admin@test.com',
        name: 'Admin User',
        roles: ['admin', 'user'],
        features: ['incidents', 'dashboard', 'settings'],
      },
    },
    'user@test.com': {
      password: 'user123',
      user: {
        id: 'user-2',
        email: 'user@test.com',
        name: 'Regular User',
        roles: ['user'],
        features: ['incidents', 'dashboard'],
      },
    },
  };

  /**
   * Simulates first auth step - validates credentials
   */
  login(credentials: Credentials): Observable<{ mfaRequired: boolean }> {
    const user = this.mockUsers[credentials.email];
    if (user && user.password === credentials.password) {
      return of({ mfaRequired: true }).pipe(delay(1000));
    }
    return throwError(() => new Error('Invalid credentials'));
  }

  /**
   * Simulates MFA validation - expects code 123456
   */
  verifyMFA(request: MFARequest): Observable<TokenResponse> {
    if (request.code !== this.MOCK_MFA_CODE) {
      return throwError(() => new Error('Invalid MFA code'));
    }

    const user = this.mockUsers[request.email];
    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    const response: TokenResponse = {
      accessToken: this.generateMockToken('access', user.user),
      refreshToken: this.generateMockToken('refresh', user.user),
      expiresIn: 3600,
      user: user.user,
    };

    return of(response).pipe(delay(1000));
  }

  /**
   * Simulates token refresh
   */
  refreshToken(refreshToken: string): Observable<TokenResponse> {
    // In real scenario, validate token against backend
    const mockEmail = 'admin@test.com'; // Simplified mock
    const user = this.mockUsers[mockEmail];

    if (!user) {
      return throwError(() => new Error('Refresh failed'));
    }

    const response: TokenResponse = {
      accessToken: this.generateMockToken('access', user.user),
      refreshToken: this.generateMockToken('refresh', user.user),
      expiresIn: 3600,
      user: user.user,
    };

    return of(response).pipe(delay(500));
  }

  private generateMockToken(type: 'access' | 'refresh', user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        type,
        iat: Date.now(),
      })
    );
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }
}
