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
        <div class="logo-card">
          <div class="brand-logo-text">
            <span class="l-hostel">Hostel</span><span class="l-hub">Hub</span><span class="l-icon">🏠</span>
          </div>
          <div class="logo-tagline">— From Concept to Comfort —</div>
        </div>
        <h2 class="welcome-text">Welcome Back! 👋</h2>
        <p class="welcome-subtext">Login to manage and raise hostel complaints instantly</p>
      </div>

      <!-- White Rounded Form Card -->
      <div class="auth-form-card">
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <!-- Email Input Field -->
          <div class="field-container">
            <span class="field-label">Email Address</span>
            <div class="input-row">
              <div class="pink-icon-badge">
                <span>✉️</span>
              </div>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-input-box" 
                placeholder="e.g. abhinav@gmail.com"
                [(ngModel)]="email" 
                required 
                email
              />
            </div>
          </div>

          <!-- Password Input Field -->
          <div class="field-container">
            <span class="field-label">Password</span>
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

          <div class="forgot-wrapper">
            <a routerLink="/student/forgot-password" class="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" class="btn btn-crimson" [disabled]="!loginForm.form.valid || loading">
            <span *ngIf="!loading">➔ SIGN IN</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </form>

        <div class="divider-row">
          <span class="divider-line"></span>
          <span class="divider-text">OR</span>
          <span class="divider-line"></span>
        </div>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/student/register" class="signup-link">Sign up</a>
        </div>
      </div>

      <!-- Bottom Feature Pillars -->
      <div class="bottom-features">
        <div class="feature-col">
          <div class="feature-icon">🛡️</div>
          <div class="feature-title">Secure & Safe</div>
          <div class="feature-desc">Your data is 100% protected</div>
        </div>
        <div class="feature-col">
          <div class="feature-icon">⚡</div>
          <div class="feature-title">Instant Access</div>
          <div class="feature-desc">Quick login to streamline your workflow</div>
        </div>
        <div class="feature-col">
          <div class="feature-icon">🔔</div>
          <div class="feature-title">Real-time Alerts</div>
          <div class="feature-desc">Stay updated with all complaints</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      background: linear-gradient(180deg, #70091b 0%, #4a0412 60%, #31020b 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
      padding: 30px 16px 20px;
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
      padding: 14px 28px;
      border-radius: 24px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 18px;
    }

    .brand-logo-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      font-family: 'Outfit', sans-serif;
    }
    .l-hostel { color: #1e293b; }
    .l-hub { color: #b31031; }
    .l-icon { font-size: 20px; margin-left: 2px; }

    .logo-tagline {
      font-size: 9.5px;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-top: 2px;
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
      max-width: 280px;
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
      font-size: 11.5px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
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
      background: #fdf2f4;
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
      border-color: #b31031;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(179, 16, 49, 0.1);
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

    .forgot-wrapper {
      text-align: right;
      margin-top: -6px;
      margin-bottom: 20px;
    }
    .forgot-link {
      font-size: 12px;
      color: #b31031;
      font-weight: 700;
      text-decoration: none;
    }

    .btn-crimson {
      width: 100%;
      background: linear-gradient(135deg, #8a0d24 0%, #b31031 100%);
      color: #ffffff;
      border: none;
      height: 46px;
      font-size: 14px;
      font-weight: 800;
      border-radius: 14px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(138, 13, 36, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-crimson:disabled {
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
      font-size: 10.5px;
      font-weight: 700;
      color: #94a3b8;
    }

    .auth-footer {
      text-align: center;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .signup-link {
      color: #b31031;
      text-decoration: none;
      font-weight: 800;
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
      background: rgba(255, 255, 255, 0.15);
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
