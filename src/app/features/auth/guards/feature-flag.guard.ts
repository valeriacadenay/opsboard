import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { AuthFacade } from '../store/auth.facade';
import { User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class FeatureFlagGuardService {
  private readonly facade = inject(AuthFacade);
  private readonly router = inject(Router);

  canActivate(requiredFeatures: string[]) {
    return this.facade.user$.pipe(
      map((user: User | null) => user?.features ?? []),
      map((features) => {
        const hasFeature = requiredFeatures.every((feature) => features.includes(feature));
        if (!hasFeature) {
          this.router.navigate(['/feature-unavailable']);
        }
        return hasFeature;
      })
    );
  }
}

export const featureFlagGuard =
  (requiredFeatures: string[]): CanActivateFn =>
  () => {
    return inject(FeatureFlagGuardService).canActivate(requiredFeatures);
  };
