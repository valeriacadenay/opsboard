import { Routes } from '@angular/router';
import { IncidentsPageComponent } from './pages/incidents.page';
import { IncidentsListComponent } from './components/incidents-list/incidents-list.component';
import { IncidentDetailComponent } from './components/incident-detail/incident-detail.component';
import { incidentDetailResolver, incidentsListResolver } from '../application/resolvers/incidents.resolver';

export const INCIDENTS_ROUTES: Routes = [
  {
    path: '',
    component: IncidentsPageComponent,
    children: [
      {
        path: '',
        component: IncidentsListComponent,
        resolve: { ready: incidentsListResolver }
      },
      {
        path: ':id',
        component: IncidentDetailComponent,
        resolve: { ready: incidentDetailResolver }
      }
    ]
  }
];
