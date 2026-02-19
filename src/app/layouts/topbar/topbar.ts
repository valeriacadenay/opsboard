import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ErrorWidgetComponent } from '../../shared/ui/organisms/error-widget/error-widget.component';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../features/auth/store/auth.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ErrorWidgetComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);

  logout(): void {
    this.authStore.logout();
    this.authService.logout();
  }

}
