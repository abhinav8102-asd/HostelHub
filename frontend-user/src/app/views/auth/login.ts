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
      <!-- Ambient Glowing Orbs -->
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>

      <div class="auth-container">
        <!-- Top Branding Section -->
        <div class="brand-header">
          <div class="logo-card">
            <img src="assets/logo.png" alt="HostelHub Logo" class="brand-logo-img" (error)="onImgError($event)" />
          </div>
          <h2 class="welcome-text">
            <span>Hostel</span><span class="highlight">Hub</span>
          </h2>
          <p class="welcome-subtext">Digital Hostel Operations & Maintenance Portal</p>
        </div>

        <!-- Role Selector Tabs -->
        <div class="role-selector-bar">
          <button type="button" class="role-pill" [class.active]="selectedRole === 'student'" (click)="setRole('student')">
            <span>🎓</span> Student
          </button>
          <button type="button" class="role-pill" [class.active]="selectedRole === 'warden'" (click)="setRole('warden')">
            <span>👨‍💼</span> Warden
          </button>
          <button type="button" class="role-pill" [class.active]="selectedRole === 'staff'" (click)="setRole('staff')">
            <span>🔧</span> Staff
          </button>
        </div>

        <!-- Royal Blue Cyber Glass Form Card -->
        <div class="auth-form-card animate-fade">
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
            <div *ngIf="success" class="alert alert-success">{{ success }}</div>

            <!-- Email Input Field -->
            <div class="field-container">
              <label class="field-label">EMAIL ADDRESS</label>
              <div class="input-row">
                <div class="icon-badge">
                  <span>✉️</span>
                </div>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-input-box" 
                  [placeholder]="selectedRole === 'student' ? 'e.g. rohan@student.com' : selectedRole === 'warden' ? 'e.g. warden@hostelhub.com' : 'e.g. electrician@hostelhub.com'"
                  [(ngModel)]="email" 
                  required 
                  email
                />
              </div>
            </div>

            <!-- Password Input Field -->
            <div class="field-container">
              <label class="field-label">PASSWORD</label>
              <div class="input-row">
                <div class="icon-badge">
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

            <button type="submit" class="btn btn-cyber-login" [disabled]="!loginForm.form.valid || loading">
              <span *ngIf="!loading">➔ SIGN IN TO PORTAL</span>
              <span *ngIf="loading">Signing in...</span>
            </button>
          </form>

          <!-- Quick Demo Credentials Helper Box -->
          <div class="demo-helper-card">
            <div class="demo-header">
              <span>⚡ Quick Fill Demo Accounts:</span>
            </div>
            <div class="demo-btn-row">
              <button type="button" class="demo-chip" (click)="fillDemo('student')">🎓 Student</button>
              <button type="button" class="demo-chip" (click)="fillDemo('warden')">👨‍💼 Warden</button>
              <button type="button" class="demo-chip" (click)="fillDemo('staff')">🔧 Staff</button>
            </div>
          </div>

          <div class="divider-row">
            <span class="divider-line"></span>
            <span class="divider-text">NEW USER?</span>
            <span class="divider-line"></span>
          </div>

          <div class="auth-footer">
            Don't have an account? <a routerLink="/student/register" class="signup-link">Sign Up as Student →</a>
          </div>
        </div>

        <!-- Bottom Feature Pillars -->
        <div class="bottom-features">
          <div class="feature-col">
            <div class="feature-icon">🛡️</div>
            <div class="feature-title">Role Isolation</div>
            <div class="feature-desc">100% Protected Data</div>
          </div>
          <div class="feature-col">
            <div class="feature-icon">⚡</div>
            <div class="feature-title">Instant Alerts</div>
            <div class="feature-desc">Real-time Socket.IO</div>
          </div>
          <div class="feature-col">
            <div class="feature-icon">📱</div>
            <div class="feature-title">Mobile Native</div>
            <div class="feature-desc">Capacitor APK</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      background: linear-gradient(135deg, #070a12 0%, #0d1322 50%, #151d33 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 24px 16px;
      position: relative;
      overflow: hidden;
      font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
      pointer-events: none;
    }
    .orb-1 {
      width: 300px;
      height: 300px;
      background: #2563eb;
      top: -50px;
      left: -50px;
    }
    .orb-2 {
      width: 320px;
      height: 320px;
      background: #1d4ed8;
      bottom: -60px;
      right: -60px;
    }

    .auth-container {
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 10;
    }

    .brand-header {
      text-align: center;
      margin-bottom: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .logo-card {
      width: 72px;
      height: 72px;
      border-radius: 22px;
      background: rgba(15, 23, 42, 0.85);
      border: 1.5px solid rgba(37, 99, 235, 0.4);
      padding: 10px;
      box-shadow: 0 0 30px rgba(37, 99, 235, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      backdrop-filter: blur(12px);
    }
    .brand-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .welcome-text {
      color: #ffffff;
      font-size: 26px;
      font-weight: 900;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }
    .welcome-text .highlight {
      color: #60a5fa;
      margin-left: 2px;
    }

    .welcome-subtext {
      color: #94a3b8;
      font-size: 12px;
      margin: 0;
      line-height: 1.4;
      font-weight: 500;
    }

    /* Role Selector Pills */
    .role-selector-bar {
      display: flex;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 4px;
      gap: 4px;
      margin-bottom: 18px;
      width: 100%;
      box-sizing: border-box;
      backdrop-filter: blur(12px);
    }
    .role-pill {
      flex: 1;
      padding: 8px 10px;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 700;
      border-radius: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .role-pill.active {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    }

    /* Royal Blue Cyber Glass Form Card */
    .auth-form-card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: 28px;
      padding: 24px 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      width: 100%;
      box-sizing: border-box;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      margin-bottom: 20px;
    }

    .field-container {
      margin-bottom: 16px;
    }

    .field-label {
      display: block;
      font-size: 10.5px;
      font-weight: 800;
      color: #94a3b8;
      margin-bottom: 6px;
      letter-spacing: 0.8px;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .icon-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(37, 99, 235, 0.15);
      border: 1px solid rgba(37, 99, 235, 0.3);
      color: #60a5fa;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .form-input-box {
      flex: 1;
      height: 42px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 0 14px;
      font-size: 13.5px;
      color: #f8fafc;
      background: rgba(15, 23, 42, 0.6);
      outline: none;
      transition: all 0.2s;
      width: 100%;
      box-sizing: border-box;
    }
    .form-input-box:focus {
      border-color: #3b82f6;
      background: rgba(15, 23, 42, 0.9);
      box-shadow: 0 0 16px rgba(59, 130, 246, 0.25);
    }
    .form-input-box::placeholder {
      color: #64748b;
    }

    .input-eye-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
    }
    .input-eye-wrapper .form-input-box {
      padding-right: 38px;
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
      margin-top: -4px;
      margin-bottom: 20px;
    }
    .forgot-link {
      font-size: 12px;
      color: #60a5fa;
      font-weight: 700;
      text-decoration: none;
    }
    .forgot-link:hover {
      text-decoration: underline;
    }

    .btn-cyber-login {
      width: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      height: 48px;
      font-size: 14px;
      font-weight: 900;
      border-radius: 14px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
    }
    .btn-cyber-login:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.5);
    }
    .btn-cyber-login:disabled {
      background: #334155;
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Demo Credentials Helper Box */
    .demo-helper-card {
      margin-top: 18px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px dashed rgba(59, 130, 246, 0.25);
      border-radius: 14px;
      padding: 10px 12px;
    }
    .demo-header {
      font-size: 10.5px;
      font-weight: 800;
      color: #60a5fa;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .demo-btn-row {
      display: flex;
      gap: 6px;
    }
    .demo-chip {
      flex: 1;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      color: #e2e8f0;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 4px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .demo-chip:hover {
      background: rgba(37, 99, 235, 0.3);
      border-color: #3b82f6;
      color: #ffffff;
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
      background: rgba(255, 255, 255, 0.1);
    }
    .divider-text {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.8px;
    }

    .auth-footer {
      text-align: center;
      font-size: 12.5px;
      color: #94a3b8;
      font-weight: 500;
    }
    .signup-link {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 800;
    }

    /* Bottom Features */
    .bottom-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      width: 100%;
    }
    .feature-col {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 10px 6px;
      text-align: center;
      color: #ffffff;
      backdrop-filter: blur(10px);
    }
    .feature-icon {
      width: 28px;
      height: 28px;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.15);
      color: #60a5fa;
      margin: 0 auto 6px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    .feature-title {
      font-size: 10.5px;
      font-weight: 800;
      margin-bottom: 2px;
      color: #f1f5f9;
    }
    .feature-desc {
      font-size: 8.5px;
      color: #64748b;
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
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
  `]
})
export class LoginComponent {
  selectedRole: 'student' | 'warden' | 'staff' = 'student';
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

  setRole(role: 'student' | 'warden' | 'staff'): void {
    this.selectedRole = role;
    this.cdr.detectChanges();
  }

  fillDemo(role: 'student' | 'warden' | 'staff'): void {
    this.selectedRole = role;
    if (role === 'student') {
      this.email = 'abhinav@student.com';
      this.password = '123456';
    } else if (role === 'warden') {
      this.email = 'warden@hostelhub.com';
      this.password = '123456';
    } else if (role === 'staff') {
      this.email = 'electrician@hostelhub.com';
      this.password = '123456';
    }
    this.cdr.detectChanges();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  onImgError(event: any): void {
    if (event && event.target) {
      event.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=120&q=80';
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = '✨ Login Successful!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate([`/${res.user.role}`]);
        }, 600);
      },
      error: (err) => {
        this.loading = false;
        const rawMsg = err.error?.message || err.message || '';
        if (err.status === 0 || rawMsg.includes('Failed to fetch') || rawMsg.includes('Http failure') || rawMsg.includes('Unknown Error')) {
          this.error = '⚠️ Connecting to server... Please wait a few seconds and tap SIGN IN again!';
        } else {
          this.error = err.error?.message || 'Login failed. Please check your credentials.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
