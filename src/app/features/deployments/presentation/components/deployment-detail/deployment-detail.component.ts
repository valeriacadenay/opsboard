import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DeploymentsFacade } from '../../../application/facade/deployments.facade';

@Component({
  selector: 'app-deployment-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="deployment(); else empty">
      <div class="header">
        <div>
          <button class="ghost" (click)="back()">← Back</button>
          <h2>{{ deployment()?.name }}</h2>
          <p>{{ deployment()?.service }} · {{ deployment()?.version }}</p>
          <div class="status-line">
            <span class="chip" [class]="'chip-' + deployment()?.status">{{ deployment()?.status }}</span>
            <span class="chip">Progress: {{ deployment()?.progress }}%</span>
          </div>
          <div class="progress">
            <div class="bar" [style.width.%]="deployment()?.progress"></div>
          </div>
        </div>
        <div class="actions">
          <button *ngIf="isPending()" (click)="approve()" [disabled]="loading()">Approve</button>
          <button *ngIf="isApproved()" (click)="start()" [disabled]="loading()">Start</button>
          <button *ngIf="isRunning()" class="ghost" (click)="fail()" [disabled]="loading()">Mark failed</button>
        </div>
      </div>

      <section>
        <h3>Steps</h3>
        <ul class="steps">
          <li *ngFor="let step of deployment()?.steps">
            <span class="chip" [class]="'chip-' + step.status">{{ step.status }}</span>
            <strong>{{ step.title }}</strong>
            <small>{{ step.log }}</small>
          </li>
        </ul>
      </section>

      <section>
        <h3>Logs</h3>
        <ul class="logs">
          <li *ngFor="let log of deployment()?.logs">
            <span class="log-meta">{{ log.at | date:'shortTime' }} · {{ log.actor }}</span>
            <span>{{ log.message }}</span>
          </li>
        </ul>
      </section>

      <section>
        <h3>Audit trail</h3>
        <ul class="audit">
          <li *ngFor="let entry of deployment()?.audit">
            <span>{{ entry.at | date:'short' }}</span>
            <span>{{ entry.actor }}</span>
            <span>{{ entry.from || 'none' }} → {{ entry.to }}</span>
          </li>
        </ul>
      </section>
    </ng-container>
    <ng-template #empty>
      <div class="empty">Deployment not found</div>
    </ng-template>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
    .actions { display: flex; gap: 0.5rem; }
    button { padding: 0.6rem 1rem; border: none; border-radius: 6px; background: #111827; color: white; cursor: pointer; }
    button.ghost { background: transparent; color: #111827; border: 1px solid #d1d5db; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .chip { padding: 0.2rem 0.6rem; border-radius: 999px; background: #e5e7eb; font-size: 0.85rem; text-transform: capitalize; }
    .chip-pending { background: #fff7e6; color: #b45309; }
    .chip-approved { background: #e0f2fe; color: #0369a1; }
    .chip-running { background: #fef9c3; color: #92400e; }
    .chip-success { background: #ecfdf3; color: #15803d; }
    .chip-failed { background: #fef2f2; color: #b91c1c; }
    .progress { width: 260px; height: 10px; background: #e5e7eb; border-radius: 999px; margin-top: 0.5rem; overflow: hidden; }
    .bar { height: 100%; background: linear-gradient(90deg, #0ea5e9, #10b981); }
    .steps, .logs, .audit { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .steps li, .logs li, .audit li { padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; display: flex; gap: 0.6rem; align-items: center; }
    .logs .log-meta { color: #6b7280; font-size: 0.85rem; min-width: 120px; }
    h3 { margin: 1rem 0 0.25rem; }
    .empty { padding: 1rem; color: #6b7280; }
  `]
})
export class DeploymentDetailComponent {
  private readonly facade = inject(DeploymentsFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly actor = 'admin';

  protected readonly deployment = this.facade.selectedDeployment$;
  protected readonly loading = this.facade.loading$;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facade.select(id);
    }
  }

  back(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  approve(): void {
    const current = this.deployment();
    if (!current) return;
    this.facade.approve(current.id, this.actor);
  }

  start(): void {
    const current = this.deployment();
    if (!current) return;
    this.facade.start(current.id, this.actor);
  }

  fail(): void {
    const current = this.deployment();
    if (!current) return;
    this.facade.fail(current.id, this.actor);
  }

  isPending(): boolean {
    return this.deployment()?.status === 'pending';
  }

  isApproved(): boolean {
    return this.deployment()?.status === 'approved';
  }

  isRunning(): boolean {
    return this.deployment()?.status === 'running';
  }
}
