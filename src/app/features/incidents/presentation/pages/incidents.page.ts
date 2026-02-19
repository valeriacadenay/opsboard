import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeatureContainerComponent } from '../../../../shared/ui/templates/template1.component';

@Component({
  selector: 'app-incidents-page',
  standalone: true,
  imports: [RouterOutlet, FeatureContainerComponent],
  template: `
    <app-feature-container>
      <div header>
        <h1>Incident Management</h1>
        <p>Enterprise-grade operations board for reliability teams.</p>
      </div>
      <router-outlet />
      <div footer>
        <small>Data persisted locally for demo purposes.</small>
      </div>
    </app-feature-container>
  `,
  styles: [`
    h1 { margin: 0; font-size: 1.6rem; }
    p { margin: 0; color: #4b5563; }
    small { color: #6b7280; }
  `]
})
export class IncidentsPageComponent {}
