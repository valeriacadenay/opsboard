import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardHeaderComponent } from '../molecules/molecule1.component';

export interface DataItem {
  id: string;
  title: string;
  status: 'success' | 'warning' | 'error' | 'info';
  description: string;
}

/**
 * Data Table Organism - Tabla de datos completa
 * Smart: No | Stateless: Sí | Presentation Component
 */
@Component({
  selector: 'app-organism1',
  template: '<p>Organism 1</p>',
})
export class Organism1Component {}
