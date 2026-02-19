import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Button Atom - Componente atómico reutilizable
 * Smart: No | Stateless: Sí
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type()" 
      [disabled]="disabled()" 
      [class]="'btn btn-' + variant()"
      (click)="clicked.emit($event)">
      {{ label() }}
    </button>
  `,
  styles: [`
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      background: #1976d2;
      color: white;
    }
    .btn-secondary {
      background: #424242;
      color: white;
    }
    .btn-danger {
      background: #d32f2f;
      color: white;
    }
  `]
})
export class ButtonComponent {
  label = input.required<string>();
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  disabled = input<boolean>(false);
  clicked = output<Event>();
}
