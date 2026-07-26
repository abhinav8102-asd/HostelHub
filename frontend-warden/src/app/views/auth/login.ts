import { Component, OnInit } from '@angular/core';
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
        <h2 style="text-transform: capitalize;">{{ role }} Portal</h2>
        <p>Sign in to manage and view hostel complaints</p>
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
              placeholder="e.g. {{ role }}@hostelhub.com"
              [(ngModel)]="email" 
              required 
              email
              #emailInput="ngModel"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
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
          Need an account? Contact the hostel administration.
        </div>

        <div class="demo-accounts-box">
          <p class="demo-title">🔑 Quick Demo Login</p>
          <div class="demo-grid">
            <button *ngIf="role === 'warden'" type="button" class="demo-btn" (click)="fillDemo('warden')">Warden</button>
            <button *ngIf="role === 'staff'" type="button" class="demo-btn" (click)="fillDemo('staff')">Electrician (Staff)</button>
            <button *ngIf="role === 'admin'" type="button" class="demo-btn" (click)="fillDemo('admin')">Admin</button>
          </div>
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
    .demo-accounts-box {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px dashed var(--neutral-200);
    }
    .demo-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--neutral-400);
      margin-bottom: 8px;
      text-align: center;
    }
    .demo-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
    }
    .demo-btn {
      background-color: var(--neutral-100);
      border: 1px solid var(--neutral-200);
      padding: 8px 12px;
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: center;
      transition: var(--transition-fast);
    }
    .demo-btn:hover, .demo-btn:active {
      background-color: var(--primary-light);
      border-color: var(--primary);
      color: var(--primary);
    }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';
  role: 'admin' | 'warden' | 'staff' = 'warden';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.role = 'warden';
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.user.role !== this.role) {
          this.loading = false;
          this.error = `Access Denied: This login page is only for ${this.role} accounts.`;
          this.authService.logout();
          return;
        }
        this.loading = false;
        this.success = 'Login Successful!';
        // Redirect to matching role dashboard
        setTimeout(() => {
          this.router.navigate([`/${res.user.role}`]);
        }, 800);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  fillDemo(role: string): void {
    if (role === 'warden') {
      this.email = 'warden@hostelhub.com';
      this.password = 'warden123';
    } else if (role === 'staff') {
      this.email = 'electrician@hostelhub.com';
      this.password = 'staff123';
    } else if (role === 'admin') {
      this.email = 'admin@hostelhub.com';
      this.password = 'admin123';
    }
  }
}

