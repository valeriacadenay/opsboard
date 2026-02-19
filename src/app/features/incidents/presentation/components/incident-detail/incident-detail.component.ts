import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IncidentsFacade } from '../../../application/facade/incidents.facade';
import { IncidentStatus } from '../../../domain/models/incident.model';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <ng-container *ngIf="incident(); else empty">
      <div class="header">
        <div>
          <button class="ghost" (click)="back()">← Back</button>
          <h2>{{ incident()?.title }}</h2>
          <p>{{ incident()?.description }}</p>
          <div class="meta">
            <span class="chip severity">Severity: {{ incident()?.severity }}</span>
            <span class="chip status">Status: {{ incident()?.status }}</span>
            <span class="chip">Service: {{ incident()?.service }}</span>
            <span class="chip">Assignee: {{ incident()?.assignedTo || 'Unassigned' }}</span>
            <span class="chip" [class.sla-ok]="incident()?.slaStatus === 'ok'" [class.sla-risk]="incident()?.slaStatus === 'risk'" [class.sla-breached]="incident()?.slaStatus === 'breached'">
              SLA: {{ incident()?.slaStatus || 'ok' }}
              <ng-container *ngIf="incident()?.slaDueAt"> · due {{ incident()?.slaDueAt | date:'short' }}</ng-container>
            </span>
          </div>
        </div>
        <div class="actions">
          <form [formGroup]="statusForm" (ngSubmit)="changeStatus()">
            <label>
              Change status
              <select formControlName="status">
                <option *ngFor="let status of statusOptions" [value]="status">{{ status }}</option>
              </select>
            </label>
            <button type="submit">Update</button>
          </form>
          <form [formGroup]="assignForm" (ngSubmit)="assign()">
            <label>
              Assign to user
              <input type="text" formControlName="assignee" placeholder="user id" />
            </label>
            <button type="submit">Assign</button>
          </form>
        </div>
      </div>

      <section>
        <h3>Timeline</h3>
        <ul class="timeline">
          <li *ngFor="let event of timeline()">
            <div class="badge">{{ event.type }}</div>
            <div>
              <div class="message">{{ event.message }}</div>
              <small>{{ event.actor }} · {{ event.at | date:'short' }}</small>
            </div>
          </li>
        </ul>
        <form class="comment" [formGroup]="commentForm" (ngSubmit)="addComment()">
          <label>
            Add comment
            <textarea rows="2" formControlName="comment" placeholder="What changed?"></textarea>
          </label>
          <div class="actions inline">
            <button type="submit" [disabled]="commentForm.invalid">Post</button>
          </div>
        </form>
      </section>
    </ng-container>
    <ng-template #empty>
      <div class="empty">Incident not found</div>
    </ng-template>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
    .actions { display: flex; gap: 1rem; }
    form { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.9rem; color: #374151; }
    select, input, button { padding: 0.5rem; border-radius: 6px; border: 1px solid #d1d5db; }
    button { background: #111827; color: white; border: none; cursor: pointer; }
    button.ghost { background: transparent; color: #111827; border: 1px solid #d1d5db; }
    .meta { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.25rem; }
    .chip { padding: 0.2rem 0.5rem; border-radius: 999px; background: #e5e7eb; font-size: 0.85rem; }
    .chip.sla-ok { background: #ecfdf3; color: #166534; }
    .chip.sla-risk { background: #fffbeb; color: #92400e; }
    .chip.sla-breached { background: #fef2f2; color: #991b1b; }
    .timeline { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .timeline li { display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
    .badge { background: #111827; color: white; padding: 0.3rem 0.6rem; border-radius: 6px; text-transform: capitalize; font-size: 0.8rem; }
    .message { font-weight: 600; }
    .empty { padding: 1rem; color: #6b7280; }
    .comment { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    textarea { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; }
    .actions.inline { justify-content: flex-end; }
  `]
})
export class IncidentDetailComponent {
  private readonly facade = inject(IncidentsFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly incident = this.facade.selectedIncident$;

  protected readonly statusOptions: IncidentStatus[] = ['open', 'investigating', 'mitigated', 'resolved', 'closed'];

  protected readonly statusForm = this.fb.group({
    status: ['open']
  });

  protected readonly assignForm = this.fb.group({
    assignee: ['']
  });

  protected readonly commentForm = this.fb.group({
    comment: ['']
  });

  protected readonly timeline = computed(() => this.incident()?.timeline ?? []);

  constructor() {
    const currentId = this.route.snapshot.paramMap.get('id');
    if (currentId) {
      this.facade.selectIncident(currentId);
    }

    effect(() => {
      const current = this.incident();
      if (current) {
        this.statusForm.patchValue({ status: current.status }, { emitEvent: false });
        this.assignForm.patchValue({ assignee: current.assignedTo || '' }, { emitEvent: false });
      }
    });
  }

  back(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  changeStatus(): void {
    const status = this.statusForm.value.status as IncidentStatus | null;
    const current = this.incident();
    if (!status || !current) return;
    this.facade.changeStatus(current.id, status);
  }

  assign(): void {
    const userId = this.assignForm.value.assignee || '';
    const current = this.incident();
    if (!userId || !current) return;
    this.facade.assignIncident(current.id, userId);
  }

  addComment(): void {
    const message = this.commentForm.value.comment?.trim();
    const current = this.incident();
    if (!message || !current) return;
    this.facade.addComment(current.id, message);
    this.commentForm.reset({ comment: '' });
  }
}
