import { Routes } from '@angular/router';
import { Shell } from './layouts/shell/shell';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/routes').then(m => m.DASHBOARD_ROUTES),
      },
    ],
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/routes').then(m => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: 'dashboard' },
];
