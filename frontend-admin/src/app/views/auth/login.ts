import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
        <div class="logo-card">
          <img src="assets/logo.png" alt="HostelHub Logo" class="brand-logo-img" />
        </div>
        <h2 class="welcome-text">Admin Portal 👑</h2>
        <p class="welcome-subtext">Sign in to manage hostel complaints & system operations</p>
      </div>

      <!-- White Rounded Form Card -->
      <div class="auth-form-card">
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <!-- Email Input Field -->
          <div class="field-container">
            <span class="field-label">EMAIL ADDRESS</span>
            <div class="input-row">
              <div class="pink-icon-badge">
                <span>✉️</span>
              </div>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input-box" 
                placeholder="e.g. admin@hostelhub.com"
                [(ngModel)]="email" 
                required 
                email
              />
            </div>
          </div>

          <!-- Password Input Field -->
          <div class="field-container">
            <span class="field-label">PASSWORD</span>
            <div class="input-row">
              <div class="pink-icon-badge">
                <span>🔒</span>
              </div>
              <div class="input-eye-wrapper">
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  id="password" 
                  name="password" 
                  class="form-input-box" 
                  placeholder="••••••••"
                  [(ngModel)]="password" 
                  required
                />
                <button type="button" class="eye-btn" (click)="togglePassword()">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-blue" [disabled]="!loginForm.form.valid || loading" style="margin-top: 10px;">
            <span *ngIf="!loading">➔ SIGN IN</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </form>

        <div class="divider-row">
          <span class="divider-line"></span>
          <span class="divider-text">HOSTEL SYSTEM</span>
          <span class="divider-line"></span>
        </div>

        <div class="auth-footer">
          Need an account? Contact the hostel administration.
        </div>
      </div>

      <!-- Bottom Feature Pillars -->
      <div class="bottom-features">
        <div class="feature-col">
          <div class="feature-icon">🛡️</div>
          <div class="feature-title">Admin Controls</div>
          <div class="feature-desc">Full system management</div>
        </div>
        <div class="feature-col">
          <div class="feature-icon">⚡</div>
          <div class="feature-title">Instant Access</div>
          <div class="feature-desc">Real-time Operations</div>
        </div>
        <div class="feature-col">
          <div class="feature-icon">🔔</div>
          <div class="feature-title">Live Alerts</div>
          <div class="feature-desc">Complaint Monitoring</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      background: linear-gradient(180deg, #1e3a8a 0%, #0f172a 60%, #090d16 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 44px 16px 24px;
      font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
    }
    
    .brand-header {
      text-align: center;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .logo-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 10px 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 18px;
    }
    .brand-logo-img {
      height: 48px;
      width: auto;
      object-fit: contain;
    }

    .welcome-text {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 6px 0;
    }

    .welcome-subtext {
      color: rgba(255, 255, 255, 0.8);
      font-size: 12.5px;
      max-width: 290px;
      margin: 0;
      line-height: 1.4;
    }

    /* White Rounded Form Card */
    .auth-form-card {
      background: #ffffff;
      border-radius: 28px;
      padding: 24px 20px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      width: 100%;
      max-width: 380px;
      box-sizing: border-box;
      margin-bottom: 24px;
    }

    .field-container {
      margin-bottom: 18px;
    }

    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 800;
      color: #475569;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pink-icon-badge {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .form-input-box {
      flex: 1;
      height: 42px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0 14px;
      font-size: 13.5px;
      color: #1e293b;
      background: #fafafa;
      outline: none;
      transition: all 0.2s;
      width: 100%;
      box-sizing: border-box;
    }
    .form-input-box:focus {
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .input-eye-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
    }
    .input-eye-wrapper .form-input-box {
      padding-right: 36px;
    }

    .eye-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 15px;
      color: #64748b;
    }

    .btn-blue {
      width: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      height: 46px;
      font-size: 14px;
      font-weight: 800;
      border-radius: 14px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-blue:disabled {
      background: #cbd5e1;
      box-shadow: none;
      cursor: not-allowed;
    }

    .divider-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 18px 0 14px 0;
    }
    .divider-line {
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }
    .divider-text {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.8px;
    }

    .auth-footer {
      text-align: center;
      font-size: 12.5px;
      color: #64748b;
      font-weight: 500;
      line-height: 1.4;
    }

    /* Bottom Features */
    .bottom-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      width: 100%;
      max-width: 380px;
    }
    .feature-col {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 12px 8px;
      text-align: center;
      color: #ffffff;
    }
    .feature-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.25);
      color: #60a5fa;
      margin: 0 auto 6px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    .feature-title {
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .feature-desc {
      font-size: 8.5px;
      opacity: 0.75;
      line-height: 1.2;
    }

    .alert {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 14px;
      line-height: 1.4;
    }
    .alert-danger {
      background: #fee2e2;
      color: #b91c1c;
    }
    .alert-success {
      background: #d1fae5;
      color: #047857;
    }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';
  showPassword = false;
  role: 'admin' | 'warden' | 'staff' | 'management' = 'admin';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.role = 'admin';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.user.role !== this.role && res.user.role !== 'management') {
          this.loading = false;
          this.error = `Access Denied: Invalid credentials for this portal.`;
          this.cdr.detectChanges();
          this.authService.logout();
          return;
        }
        this.loading = false;
        this.success = '✨ Login Successful!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate([`/${res.user.role}`]);
        }, 600);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.cdr.detectChanges();
      }
    });
  }
}
