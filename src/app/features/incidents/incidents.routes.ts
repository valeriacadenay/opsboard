/**
 * Incidents Routes - Lazy Loading Configuration
 */

import { Routes } from '@angular/router';

export const INCIDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./incidents.component').then(m => m.IncidentsComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/incidents-list.component').then(m => m.IncidentsListComponent)
      },
      // Más rutas aquí (detail, create, edit)
    ]
  }
];
