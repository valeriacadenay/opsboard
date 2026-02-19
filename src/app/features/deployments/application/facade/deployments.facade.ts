import { Injectable, inject } from '@angular/core';
import { DeploymentsStore } from '../state/deployments.store';

@Injectable({ providedIn: 'root' })
export class DeploymentsFacade {
  private readonly store = inject(DeploymentsStore);

  readonly deployments$ = this.store.deployments;
  readonly selectedDeployment$ = this.store.selectedDeployment;
  readonly loading$ = this.store.loading;
  readonly error$ = this.store.error;

  initialize(): void {
    this.store.load();
  }

  select(id: string | null): void {
    this.store.select(id);
  }

  approve(id: string, actor: string): void {
    this.store.approve({ id, actor });
  }

  start(id: string, actor: string): void {
    this.store.start({ id, actor });
  }

  fail(id: string, actor: string): void {
    this.store.fail({ id, actor });
  }
}
