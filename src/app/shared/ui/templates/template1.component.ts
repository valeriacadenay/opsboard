import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Feature Container Template - Layout wrapper con slots header/footer
 */
@Component({
  selector: 'app-feature-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="feature-container">
      <header class="feature-header">
        <ng-content select="[header]"></ng-content>
      </header>
      <main class="feature-body">
        <ng-content></ng-content>
      </main>
      <footer class="feature-footer">
        <ng-content select="[footer]"></ng-content>
      </footer>
    </section>
  `,
  styles: [`
    .feature-container { display: flex; flex-direction: column; gap: 1rem; background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
    .feature-header { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.75rem; }
    .feature-body { min-height: 200px; }
    .feature-footer { border-top: 1px solid #e5e7eb; padding-top: 0.75rem; color: #6b7280; font-size: 0.9rem; }
  `]
})
export class FeatureContainerComponent {}
