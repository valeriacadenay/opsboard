/**
 * Incidents List Component - Smart Component
 * Conecta con el store y maneja lógica de negocio
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DataItem } from '../../../shared/ui/index';
import { IncidentsFacade } from '../store/incidents.facade';

@Component({
  selector: 'app-incidents-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <app-data-table
      title="Incidents"
      [items]="tableItems()"
      [loading]="facade.loading$()"
      [allowAdd]="true"
      (refresh)="onRefresh()"
      (add)="onAdd()"
      (itemClicked)="onItemClick($event)" />
  `
})
export class IncidentsListComponent implements OnInit {
  protected readonly facade = inject(IncidentsFacade);

  ngOnInit(): void {
    this.facade.loadIncidents();
  }

  /**
   * Convierte incidentes a formato de tabla
   */
  protected tableItems(): DataItem[] {
    return this.facade.incidents$().map(incident => ({
      id: incident.id,
      title: incident.title,
      status: this.mapStatus(incident.status),
      description: incident.description
    }));
  }

  /**
   * Mapea status a colores de badge
   */
  private mapStatus(status: string): 'success' | 'warning' | 'error' | 'info' {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      'resolved': 'success',
      'investigating': 'warning',
      'open': 'error',
      'closed': 'info'
    };
    return statusMap[status] || 'info';
  }

  protected onRefresh(): void {
    this.facade.loadIncidents();
  }

  protected onAdd(): void {
    // TODO: Abrir diálogo de creación
    console.log('Add incident');
  }

  protected onItemClick(item: DataItem): void {
    this.facade.selectIncident(item.id);
    // TODO: Navegar a detalle o abrir modal
    console.log('View incident', item.id);
  }
}
