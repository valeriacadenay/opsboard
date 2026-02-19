/**
 * Incidents Container - Smart Component Principal
 * Punto de entrada de la feature
 */

import { Component } from '@angular/core';
import { FeatureContainerComponent } from '../../shared/ui/templates/template1.component';
import { IncidentsListComponent } from './components/incidents-list.component';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [FeatureContainerComponent, IncidentsListComponent],
  template: `
    <app-feature-container>
      <div header>
        <h1>Incident Management</h1>
        <p>Monitor and manage system incidents</p>
      </div>
      
      <app-incidents-list />
      
      <div footer>
        <p>Total incidents managed: {{ totalCount }}</p>
      </div>
    </app-feature-container>
  `,
  styles: [`
    h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
    }
    p {
      margin: 0;
      color: #666;
    }
  `]
})
export class IncidentsComponent {
  protected totalCount = 0; // TODO: Obtener del facade
}
