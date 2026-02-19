import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { DeploymentsFacade } from '../facade/deployments.facade';

export const deploymentsResolver: ResolveFn<boolean> = () => {
  const facade = inject(DeploymentsFacade);
  facade.initialize();
  return of(true);
};

export const deploymentDetailResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const facade = inject(DeploymentsFacade);
  const id = route.paramMap.get('id');
  facade.initialize();
  if (id) facade.select(id);
  return of(true);
};
