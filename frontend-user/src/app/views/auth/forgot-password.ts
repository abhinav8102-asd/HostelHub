import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../config/api.config';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>

      <div class="auth-container">
        <!-- Top Branding Section -->
        <div class="brand-header">
          <div class="logo-card">
            <img src="assets/logo.png" alt="HostelHub Logo" class="brand-logo-img" (error)="onImgError($event)" />
          </div>
          <h2 class="welcome-text">Reset Password</h2>
          <p class="welcome-subtext" *ngIf="step === 1">Enter your registered email to receive a 6-digit OTP code</p>
          <p class="welcome-subtext" *ngIf="step === 2">We sent a 6-digit verification code to your email</p>
          <p class="welcome-subtext" *ngIf="step === 3">Enter a new secure password for your account</p>
        </div>

        <!-- Royal Blue Cyber Glass Form Card -->
        <div class="auth-form-card animate-fade">
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <!-- STEP 1: Enter Email -->
          <form *ngIf="step === 1" (ngSubmit)="sendOTP()" #emailForm="ngForm">
            <div class="field-container">
              <label class="field-label">REGISTERED EMAIL</label>
              <div class="input-row">
                <div class="icon-badge"><span>✉️</span></div>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-input-box" 
                  placeholder="e.g. rohan@student.com"
                  [(ngModel)]="email" 
                  required 
                  email
                />
              </div>
            </div>

            <button type="submit" class="btn btn-cyber-primary" [disabled]="!emailForm.form.valid || loading">
              <span *ngIf="!loading">🚀 Send Verification Code</span>
              <span *ngIf="loading">Sending email...</span>
            </button>
          </form>

          <!-- STEP 2: Enter OTP -->
          <form *ngIf="step === 2" (ngSubmit)="verifyOTP()" #otpForm="ngForm">
            <div class="field-container">
              <label class="field-label">6-DIGIT VERIFICATION CODE</label>
              <div class="input-row">
                <div class="icon-badge"><span>🔑</span></div>
                <input 
                  type="text" 
                  id="otp" 
                  name="otp" 
                  class="form-input-box" 
                  placeholder="123456"
                  [(ngModel)]="otp" 
                  required 
                  minlength="6"
                  maxlength="6"
                  style="text-align: center; font-size: 20px; letter-spacing: 4px; font-weight: 800;"
                />
              </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 16px;">
              <button type="button" class="btn btn-cyber-secondary" style="flex: 1;" (click)="step = 1; error = ''; success = '';">
                ← Back
              </button>
              <button type="submit" class="btn btn-cyber-primary" style="flex: 2;" [disabled]="!otpForm.form.valid || loading">
                <span *ngIf="!loading">Verify Code ✓</span>
                <span *ngIf="loading">Verifying...</span>
              </button>
            </div>
          </form>

          <!-- STEP 3: Reset Password -->
          <form *ngIf="step === 3" (ngSubmit)="resetPassword()" #passwordForm="ngForm">
            <div class="field-container">
              <label class="field-label">NEW PASSWORD</label>
              <div class="input-row">
                <div class="icon-badge"><span>🔒</span></div>
                <input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword" 
                  class="form-input-box" 
                  placeholder="Min 6 characters"
                  [(ngModel)]="newPassword" 
                  required 
                  minlength="6"
                />
              </div>
            </div>

            <button type="submit" class="btn btn-cyber-primary" [disabled]="!passwordForm.form.valid || loading" style="margin-top: 14px;">
              <span *ngIf="!loading">💾 Save New Password</span>
              <span *ngIf="loading">Saving password...</span>
            </button>
          </form>

          <div class="auth-footer" style="margin-top: 18px;">
            Remembered your password? <a routerLink="/student/login" class="signup-link">Login Here →</a>
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
      max-width: 390px;
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
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: rgba(15, 23, 42, 0.85);
      border: 1.5px solid rgba(37, 99, 235, 0.4);
      padding: 8px;
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
      font-size: 24px;
      font-weight: 900;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }

    .welcome-subtext {
      color: #94a3b8;
      font-size: 12px;
      margin: 0;
      line-height: 1.4;
      font-weight: 500;
    }

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

    .btn-cyber-primary {
      width: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      height: 46px;
      font-size: 13.5px;
      font-weight: 900;
      border-radius: 14px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-cyber-primary:disabled {
      background: #334155;
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-cyber-secondary {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 700;
      border-radius: 14px;
      cursor: pointer;
      height: 46px;
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
export class ForgotPasswordComponent {
  step = 1;
  email = '';
  otp = '';
  newPassword = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onImgError(event: any): void {
    if (event && event.target) {
      event.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=120&q=80';
    }
  }

  sendOTP(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.http.post(`${API_CONFIG.baseUrl}/api/auth/forgot-password`, { email: this.email }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = res.message || 'OTP verification code sent successfully!';
        this.step = 2;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to send OTP verification code. Verify your email.';
        this.cdr.detectChanges();
      }
    });
  }

  verifyOTP(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.http.post(`${API_CONFIG.baseUrl}/api/auth/verify-otp`, { email: this.email, otp: this.otp }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = 'Code verified! You can now reset your password.';
        this.step = 3;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid or expired verification code.';
        this.cdr.detectChanges();
      }
    });
  }

  resetPassword(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    const payload = {
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    };

    this.http.post(`${API_CONFIG.baseUrl}/api/auth/reset-password`, payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = 'Password reset successfully! Redirecting to login...';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/student/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to reset password. Try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
