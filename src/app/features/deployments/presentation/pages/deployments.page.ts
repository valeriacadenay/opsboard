import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeatureContainerComponent } from '../../../../shared/ui/templates/template1.component';

@Component({
  selector: 'app-deployments-page',
  standalone: true,
  imports: [RouterOutlet, FeatureContainerComponent],
  template: `
    <app-feature-container>
      <div header>
        <h1>Deployments</h1>
        <p>Controlled rollout with approvals and audit.</p>
      </div>
      <router-outlet />
      <div footer>
        <small>Mock backend with simulated progress.</small>
      </div>
    </app-feature-container>
  `,
  styles: [`
    h1 { margin: 0; font-size: 1.6rem; }
    p { margin: 0; color: #4b5563; }
  `]
})
export class DeploymentsPageComponent {}
