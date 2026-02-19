import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthFacade } from '../store/auth.facade';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>{{ (mfaStep$ | async) ? 'Enter MFA Code' : 'Sign In' }}</h1>

        @if (!(mfaStep$ | async)) {
          <form [formGroup]="credentialsForm" (ngSubmit)="onSubmitCredentials()">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="admin@test.com"
                class="form-control"
              />
              @if (credentialsForm.get('email')?.hasError('required')) {
                <span class="error">Email is required</span>
              }
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="admin123"
                class="form-control"
              />
              @if (credentialsForm.get('password')?.hasError('required')) {
                <span class="error">Password is required</span>
              }
            </div>

            <div class="form-group checkbox">
              <input
                id="rememberMe"
                type="checkbox"
                formControlName="rememberMe"
              />
              <label for="rememberMe">Remember me</label>
            </div>

            <button
              type="submit"
              [disabled]="credentialsForm.invalid || (loading$ | async)"
              class="btn-primary"
            >
              {{ (loading$ | async) ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        }

        @if (mfaStep$ | async) {
          <form [formGroup]="mfaForm" (ngSubmit)="onSubmitMFA()">
            <div class="form-group">
              <label for="mfaCode">MFA Code</label>
              <input
                id="mfaCode"
                type="text"
                formControlName="code"
                placeholder="123456"
                maxlength="6"
                class="form-control"
              />
              <small class="hint">Enter the code sent to your email (mock: 123456)</small>
              @if (mfaForm.get('code')?.hasError('required')) {
                <span class="error">Code is required</span>
              }
            </div>

            <button
              type="submit"
              [disabled]="mfaForm.invalid || (loading$ | async)"
              class="btn-primary"
            >
              {{ (loading$ | async) ? 'Verifying...' : 'Verify' }}
            </button>

            <button
              type="button"
              (click)="onBackToCredentials()"
              class="btn-secondary"
            >
              Back
            </button>
          </form>
        }

        @if (error$ | async; as error) {
          <div class="alert-error">{{ error }}</div>
        }

        <div class="help-text">
          <p>Demo credentials:</p>
          <p>admin@test.com / admin123</p>
          <p>user@test.com / user123</p>
          <p>MFA Code: 123456</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      margin-bottom: 1.5rem;
      text-align: center;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .checkbox {
      display: flex;
      align-items: center;
    }

    .checkbox input {
      width: auto;
      margin-right: 0.5rem;
    }

    .checkbox label {
      margin-bottom: 0;
    }

    .btn-primary, .btn-secondary {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s;
      margin-top: 1rem;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
      margin-top: 0.5rem;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e0e0e0;
    }

    .error {
      display: block;
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .hint {
      display: block;
      color: #999;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .alert-error {
      background: #ffe6e6;
      color: #e74c3c;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #e74c3c;
    }

    .help-text {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #666;
    }

    .help-text p {
      margin: 0.25rem 0;
    }
  `]
})
export class LoginComponent implements OnInit {
  private readonly facade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  credentialsForm!: FormGroup;
  mfaForm!: FormGroup;

  mfaStep$ = this.facade.mfaPending$;
  loading$ = this.facade.loading$;
  error$ = this.facade.error$;

  private currentEmail = '';

  ngOnInit(): void {
    this.initForms();
    this.subscribeToAuthSuccess();
  }

  private initForms(): void {
    this.credentialsForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.mfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  protected onSubmitCredentials(): void {
    if (this.credentialsForm.valid) {
      this.currentEmail = this.credentialsForm.value.email;
      this.facade.login(this.credentialsForm.value);
    }
  }

  protected onSubmitMFA(): void {
    if (this.mfaForm.valid) {
      this.facade.verifyMFA(this.currentEmail, this.mfaForm.value.code);
    }
  }

  protected onBackToCredentials(): void {
    this.mfaForm.reset();
  }

  private subscribeToAuthSuccess(): void {
    this.facade.isAuthenticated$.subscribe((isAuth: boolean) => {
      if (isAuth) {
        this.router.navigate(['/incidents']);
      }
    });
  }
}
