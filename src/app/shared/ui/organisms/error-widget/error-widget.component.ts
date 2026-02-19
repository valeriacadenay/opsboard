import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { LoggerService, LogEntry, LogLevel } from '../../../../core/logging/logger.service';

@Component({
  selector: 'app-error-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="error-widget">
      <header>
        <div>
          <p class="eyebrow">Observability</p>
          <h3>Latest errors</h3>
        </div>
        <span class="badge">{{ errors.length }}</span>
      </header>
      <ul>
        <li *ngFor="let err of errors">
          <div class="meta">
            <span class="level">{{ levelLabel(err.level) }}</span>
            <span class="time">{{ err.timestamp | date: 'shortTime' }}</span>
          </div>
          <p class="message">{{ err.message }}</p>
          <p class="details" *ngIf="err.correlationId">Corr ID: {{ err.correlationId }}</p>
        </li>
        <li *ngIf="errors.length === 0" class="empty">No recent errors</li>
      </ul>
    </section>
  `,
  styles: [`
    .error-widget { background: #0b1021; color: #e5e7eb; border: 1px solid #1f2937; border-radius: 12px; padding: 1rem; width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.7rem; color: #9ca3af; margin: 0; }
    h3 { margin: 0; font-size: 1.1rem; }
    .badge { background: #111827; color: #fbbf24; padding: 0.15rem 0.6rem; border-radius: 999px; font-size: 0.75rem; }
    ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.55rem; max-height: 240px; overflow: auto; }
    li { padding: 0.35rem 0.5rem; background: #111827; border-radius: 8px; border: 1px solid #1f2937; }
    .meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #9ca3af; }
    .message { margin: 0.2rem 0; font-size: 0.9rem; }
    .details { margin: 0; font-size: 0.75rem; color: #d1d5db; }
    .empty { text-align: center; color: #9ca3af; background: transparent; border: 1px dashed #1f2937; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorWidgetComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  protected errors: LogEntry[] = [];

  ngOnInit(): void {
    this.errors = this.logger.getRecentErrors();
    this.logger.recentErrors$.subscribe(errors => this.errors = errors);
  }

  protected levelLabel(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR: return 'ERROR';
      case LogLevel.FATAL: return 'FATAL';
      case LogLevel.WARN: return 'WARN';
      default: return 'INFO';
    }
  }
}
