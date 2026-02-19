import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardHeaderComponent } from '../molecules/molecule1.component';

export interface DataItem {
  id: string;
  [key: string]: unknown;
}

export interface DataColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'badge' | 'date';
  badgeMap?: Record<string, 'success' | 'warning' | 'error' | 'info'>;
}

/**
 * Data Table Organism - Tabla de datos completa
 * Smart: No | Stateless: Sí | Presentation Component
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, CardHeaderComponent],
  template: `
    <div class="data-table-container">
      <app-card-header
        [title]="title()"
        [badge]="items().length.toString()"
        [showRefresh]="true"
        [showAdd]="allowAdd()"
        (refresh)="refresh.emit()"
        (add)="add.emit()" />
      
      <div class="table-wrapper">
        @if (loading()) {
          <div class="loading">Loading...</div>
        } @else if (items().length === 0) {
          <div class="empty">No items found</div>
        } @else {
          <table class="table">
            <thead>
              <tr>
                @for (column of columns(); track column.key) {
                  <th (click)="onSort(column)" [class.sortable]="column.sortable">
                    {{ column.label }}
                    @if (isSorted(column.key, 'asc')) {<span>↑</span>}
                    @if (isSorted(column.key, 'desc')) {<span>↓</span>}
                  </th>
                }
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr>
                  @for (column of columns(); track column.key) {
                    <td>
                      @switch (column.type) {
                        @case ('badge') {
                          <span class="badge" [class]="'badge-' + getBadge(column, item)">{{ item[column.key] }}</span>
                        }
                        @case ('date') {
                          {{ formatDate(item[column.key]) | date:'short' }}
                        }
                        @default {
                          {{ item[column.key] }}
                        }
                      }
                    </td>
                  }
                  <td class="actions-cell">
                    <button class="btn-link" (click)="itemClicked.emit(item)">View</button>
                    @if (allowDelete()) {
                      <button class="btn-danger" (click)="delete.emit(item)">Delete</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }

        <div class="pagination" *ngIf="total() > pageSize()">
          <button (click)="changePage(-1)" [disabled]="page() === 1">Prev</button>
          <span>Page {{ page() }} of {{ totalPages }}</span>
          <button (click)="changePage(1)" [disabled]="page() >= totalPages">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .data-table-container { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .table-wrapper { padding: 1rem; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
    .table th { font-weight: 600; background: #f5f5f5; cursor: default; }
    .table th.sortable { cursor: pointer; }
    .badge { padding: 0.2rem 0.45rem; border-radius: 6px; font-size: 0.85rem; text-transform: capitalize; }
    .badge-success { background: #e8f5e9; color: #2e7d32; }
    .badge-warning { background: #fff7e6; color: #f57c00; }
    .badge-error { background: #fdecea; color: #c62828; }
    .badge-info { background: #e3f2fd; color: #1565c0; }
    .actions-cell { display: flex; gap: 0.5rem; }
    .btn-link { background: none; border: none; color: #1976d2; cursor: pointer; text-decoration: underline; padding: 0; }
    .btn-danger { background: #b91c1c; color: white; border: none; border-radius: 4px; padding: 0.35rem 0.55rem; cursor: pointer; }
    .loading, .empty { text-align: center; padding: 2rem; color: #666; }
    .pagination { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; }
    .pagination button { padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid #d1d5db; background: #111827; color: white; cursor: pointer; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class DataTableComponent {
  title = input.required<string>();
  items = input.required<DataItem[]>();
  columns = input.required<DataColumn[]>();
  loading = input<boolean>(false);
  allowAdd = input<boolean>(true);
  allowDelete = input<boolean>(false);
  page = input<number>(1);
  pageSize = input<number>(10);
  total = input<number>(0);
  sort = input<{ field?: string; direction?: 'asc' | 'desc' | null } | undefined>({ direction: null });
  // format date values safely for the date pipe
  formatDate(value: unknown): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  refresh = output<void>();
  add = output<void>();
  itemClicked = output<DataItem>();
  delete = output<DataItem>();
  pageChange = output<number>();
  sortChange = output<{ field: string; direction: 'asc' | 'desc' | null }>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize()));
  }

  changePage(delta: number): void {
    const target = this.page() + delta;
    if (target < 1 || target > this.totalPages) return;
    this.pageChange.emit(target);
  }

  onSort(column: DataColumn): void {
    if (!column.sortable) return;
    const current = this.sort();
    let direction: 'asc' | 'desc' | null = 'asc';
    if (current && current.field === column.key) {
      direction = current.direction === 'asc' ? 'desc' : current.direction === 'desc' ? null : 'asc';
    }
    this.sortChange.emit({ field: column.key, direction });
  }

  isSorted(field: string, direction: 'asc' | 'desc'): boolean {
    return this.sort()?.field === field && this.sort()?.direction === direction;
  }

  getBadge(column: DataColumn, item: DataItem): string {
    const value = (item as any)[column.key] as string;
    const badge = column.badgeMap?.[value] || 'info';
    return badge;
  }
}
