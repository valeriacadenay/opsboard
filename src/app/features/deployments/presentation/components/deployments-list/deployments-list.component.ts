import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent, DataColumn, DataItem } from '../../../../../shared/ui';
import { DeploymentsFacade } from '../../../application/facade/deployments.facade';
import { Deployment } from '../../../domain/models/deployment.model';

@Component({
  selector: 'app-deployments-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <app-data-table
      title="Deployments"
      [items]="items()"
      [columns]="columns"
      [loading]="loading()"
      [allowAdd]="false"
      [allowDelete]="false"
      (itemClicked)="onView($event)"
      (refresh)="onRefresh()"
    />
  `
})
export class DeploymentsListComponent implements OnInit {
  private readonly facade = inject(DeploymentsFacade);
  private readonly router = inject(Router);

  protected readonly deployments = this.facade.deployments$;
  protected readonly loading = this.facade.loading$;

  protected readonly statusBadgeMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    pending: 'warning',
    approved: 'info',
    running: 'warning',
    success: 'success',
    failed: 'error'
  };

  protected readonly columns: DataColumn[] = [
    { key: 'name', label: 'Name', sortable: false },
    { key: 'service', label: 'Service', sortable: false },
    { key: 'version', label: 'Version', sortable: false },
    { key: 'status', label: 'Status', type: 'badge', badgeMap: this.statusBadgeMap, sortable: false },
    { key: 'progress', label: 'Progress', sortable: false }
  ];

  protected readonly items = computed<DataItem[]>(() =>
    this.deployments().map((d: Deployment) => ({
      id: d.id,
      name: d.name,
      service: d.service,
      version: d.version,
      status: d.status,
      progress: `${d.progress}%`
    }))
  );

  ngOnInit(): void {
    this.facade.initialize();
  }

  onRefresh(): void {
    this.facade.initialize();
  }

  onView(item: DataItem): void {
    this.facade.select(item.id);
    this.router.navigate(['./', item.id]);
  }
}
