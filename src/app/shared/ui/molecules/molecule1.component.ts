import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../atoms/atom1.component';
import { BadgeComponent } from '../atoms/atom2.component';

/**
 * Card Header Molecule - Combina título, badge y acciones
 * Smart: No | Stateless: Sí
 */
@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent],
  template: `
    <div class="card-header">
      <div class="header-left">
        <h3 class="title">{{ title() }}</h3>
        @if (badge()) {
          <app-badge [text]="badge()!" [variant]="badgeVariant()" />
        }
      </div>
      <div class="header-actions">
        @if (showRefresh()) {
          <app-button 
            label="Refresh" 
            variant="secondary" 
            (clicked)="refresh.emit()" />
        }
        @if (showAdd()) {
          <app-button 
            label="Add" 
            variant="primary" 
            (clicked)="add.emit()" />
        }
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .header-actions {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class CardHeaderComponent {
  title = input.required<string>();
  badge = input<string>();
  badgeVariant = input<'success' | 'warning' | 'error' | 'info'>('info');
  showRefresh = input<boolean>(false);
  showAdd = input<boolean>(false);
  refresh = output<void>();
  add = output<void>();
}
