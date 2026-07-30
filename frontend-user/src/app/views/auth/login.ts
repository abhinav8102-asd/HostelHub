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
      <!-- Top Branding Section -->
      <div class="brand-header">
        <div class="logo-container">
          <div class="logo-badge">
            <img src="logo.png" alt="HostelHub Logo" class="logo-img" />
          </div>
        </div>
        <h2 class="welcome-text">Welcome Back</h2>
        <p class="welcome-subtext">Login to manage and raise hostel complaints instantly</p>
      </div>

      <!-- Rounded Bottom Form Card -->
      <div class="auth-form-card">
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <div class="form-group">
            <label class="form-label" for="email">Gmail</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="e.g. abhinav@gmail.com"
              [(ngModel)]="email" 
              required 
              email
              #emailInput="ngModel"
            />
          </div>

          <div class="form-group password-group">
            <label class="form-label" for="password">Password</label>
            <div class="input-with-eye">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                name="password" 
                class="form-input" 
                placeholder="••••••"
                [(ngModel)]="password" 
                required
              />
              <button type="button" class="eye-btn" (click)="togglePassword()">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="forgot-wrapper">
            <a routerLink="/student/forgot-password" class="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" class="btn btn-gradient" [disabled]="!loginForm.form.valid || loading">
            <span *ngIf="!loading">SIGN IN</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/student/register" class="signup-link">Sign up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      background: linear-gradient(180deg, #b31031 0%, #1a0208 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      padding-top: 40px;
    }
    
    /* Logo image branding */
    .brand-header {
      text-align: center;
      padding: 20px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }
    .logo-badge {
      background: #ffffff;
      padding: 10px 20px;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
      display: inline-flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 12px;
    }
    .logo-img {
      max-width: 180px;
      height: auto;
      object-fit: contain;
    }

    .welcome-text {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 10px 0 4px 0;
    }
    .welcome-subtext {
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
      max-width: 280px;
      margin: 0;
      line-height: 1.4;
    }

    /* Bottom white card panel */
    .auth-form-card {
      background: #ffffff;
      border-radius: 32px 32px 0 0;
      padding: 32px 24px 40px 24px;
      box-shadow: 0 -8px 24px rgba(0,0,0,0.15);
      width: 100%;
      box-sizing: border-box;
    }

    .form-group {
      margin-bottom: 24px;
      position: relative;
    }
    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #b31031;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Underline Input Style */
    .form-input {
      width: 100%;
      border: none;
      border-bottom: 1.5px solid #e2e8f0;
      padding: 8px 0;
      font-size: 15px;
      color: #1e293b;
      background: transparent;
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }
    .form-input:focus {
      border-color: #b31031;
    }
    .form-input::placeholder {
      color: #cbd5e1;
    }

    /* Input with eye toggle */
    .input-with-eye {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-with-eye .form-input {
      padding-right: 32px;
    }
    .eye-btn {
      position: absolute;
      right: 0;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 6px;
      color: #64748b;
      outline: none;
    }

    .forgot-wrapper {
      text-align: right;
      margin-top: -12px;
      margin-bottom: 28px;
    }
    .forgot-link {
      font-size: 12px;
      color: #64748b;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    .forgot-link:hover {
      color: #b31031;
    }

    /* Gradient Button */
    .btn-gradient {
      width: 100%;
      background: linear-gradient(135deg, #b31031 0%, #690518 100%);
      color: #ffffff;
      border: none;
      padding: 14px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 25px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(179, 16, 49, 0.25);
      transition: transform 0.2s, box-shadow 0.2s;
      outline: none;
      letter-spacing: 0.5px;
    }
    .btn-gradient:disabled {
      background: #cbd5e1;
      color: #94a3b8;
      box-shadow: none;
      cursor: not-allowed;
    }
    .btn-gradient:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(179, 16, 49, 0.35);
    }
    .btn-gradient:not(:disabled):active {
      transform: translateY(0);
    }

    .alert {
      padding: 12px;
      border-radius: 12px;
      font-size: 13.5px;
      margin-bottom: 20px;
      font-weight: 500;
      text-align: center;
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
      margin-top: 24px;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .signup-link {
      color: #b31031;
      text-decoration: none;
      font-weight: 700;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = 'Login Successful!';
        this.cdr.detectChanges();
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
