import { Routes } from '@angular/router';
import { deploymentsResolver, deploymentDetailResolver } from '../application/resolvers/deployments.resolver';
import { DeploymentsPageComponent } from './pages/deployments.page';
import { DeploymentsListComponent } from './components/deployments-list/deployments-list.component';
import { DeploymentDetailComponent } from './components/deployment-detail/deployment-detail.component';
import { roleGuard } from '../../../core/guards/role.guard';

export const DEPLOYMENTS_ROUTES: Routes = [
  {
    path: '',
    component: DeploymentsPageComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: '',
        component: DeploymentsListComponent,
        resolve: { ready: deploymentsResolver }
      },
      {
        path: ':id',
        component: DeploymentDetailComponent,
        resolve: { ready: deploymentDetailResolver }
      }
    ]
  }
];
