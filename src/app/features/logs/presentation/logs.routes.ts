import { Routes } from '@angular/router';
import { LogsExplorerComponent } from './logs-explorer.component';
import { authGuard } from '../../auth/guards/auth.guard';

export const LOGS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: LogsExplorerComponent
  }
];
