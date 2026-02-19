import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/auth-container.component').then(
        (m) => m.AuthContainerComponent
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./components/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
