import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Badge Atom - Componente atómico para badges/etiquetas
 * Smart: No | Stateless: Sí
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'badge badge-' + variant()">
      {{ text() }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-success {
      background: #4caf50;
      color: white;
    }
    .badge-warning {
      background: #ff9800;
      color: white;
    }
    .badge-error {
      background: #f44336;
      color: white;
    }
    .badge-info {
      background: #2196f3;
      color: white;
    }
  `]
})
export class BadgeComponent {
  text = input.required<string>();
  variant = input<'success' | 'warning' | 'error' | 'info'>('info');
}
