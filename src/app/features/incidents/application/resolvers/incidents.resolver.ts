import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { IncidentsFacade } from '../facade/incidents.facade';

export const incidentsListResolver: ResolveFn<boolean> = () => {
  const facade = inject(IncidentsFacade);
  facade.initialize();
  return of(true);
};

export const incidentDetailResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const facade = inject(IncidentsFacade);
  const incidentId = route.paramMap.get('id');
  if (incidentId) {
    facade.loadIncident(incidentId);
    facade.selectIncident(incidentId);
  }
  return of(true);
};
