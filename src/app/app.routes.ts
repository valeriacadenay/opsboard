import { Routes } from '@angular/router';
import { Shell } from './layouts/shell/shell';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: 'incidents',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/incidents/presentation/incidents.routes').then(
            (m) => m.INCIDENTS_ROUTES
          ),
      },
      {
        path: 'deployments',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/deployments/presentation/deployments.routes').then(
            (m) => m.DEPLOYMENTS_ROUTES
          ),
      },
      {
        path: 'logs',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/logs/presentation/logs.routes').then(
            (m) => m.LOGS_ROUTES
          ),
      },
      {
        path: 'audit',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/audit/presentation/audit.routes').then(
            (m) => m.AUDIT_ROUTES
          ),
      },
      {
        path: '',
        redirectTo: 'incidents',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
