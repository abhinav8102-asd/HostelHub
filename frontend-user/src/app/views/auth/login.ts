import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-header">
        <div class="logo">🏨 HostelHub</div>
        <h2>Welcome Back</h2>
        <p>Login to manage and raise hostel complaints instantly</p>
      </div>

      <div class="auth-form-card">
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="e.g. student@hostelhub.com"
              [(ngModel)]="email" 
              required 
              email
              #emailInput="ngModel"
            />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" for="password" style="margin-bottom: 0;">Password</label>
              <a routerLink="/student/forgot-password" style="font-size: 12px; color: var(--primary); text-decoration: none; font-weight: 600;">Forgot password?</a>
            </div>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input" 
              placeholder="••••••••"
              [(ngModel)]="password" 
              required
            />
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="!loginForm.form.valid || loading">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Logging in...</span>
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/student/register">Register here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      padding: 24px;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: center;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 12px;
    }
    h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--neutral-900);
      margin-bottom: 6px;
    }
    p {
      font-size: 14px;
      color: var(--neutral-600);
    }
    .auth-form-card {
      background-color: var(--white);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--neutral-100);
    }
    .alert {
      padding: 12px;
      border-radius: var(--radius-md);
      font-size: 14px;
      margin-bottom: 16px;
      font-weight: 500;
    }
    .alert-danger {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    .alert-success {
      background-color: #d1fae5;
      color: #047857;
    }
    .auth-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: var(--neutral-600);
    }
    .auth-footer a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = 'Login Successful!';
        this.cdr.detectChanges();
        // Redirect to matching role dashboard
        setTimeout(() => {
          this.router.navigate([`/${res.user.role}`]);
        }, 800);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.cdr.detectChanges();
      }
    });
  }
}
