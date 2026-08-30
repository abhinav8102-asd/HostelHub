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
      <div class="auth-header">
        <div class="logo">🏨 HostelHub</div>
        <h2>Reset Password</h2>
        <p *ngIf="step === 1">Enter your registered email to receive an OTP code</p>
        <p *ngIf="step === 2">We sent a 6-digit verification code to your email</p>
        <p *ngIf="step === 3">Enter a new secure password for your account</p>
      </div>

      <div class="auth-form-card">
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
        <div *ngIf="success" class="alert alert-success">{{ success }}</div>

        <!-- STEP 1: Enter Email -->
        <form *ngIf="step === 1" (ngSubmit)="sendOTP()" #emailForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="e.g. rohan@student.com"
              [(ngModel)]="email" 
              required 
              email
            />
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="!emailForm.form.valid || loading">
            <span *ngIf="!loading">Send Verification Code</span>
            <span *ngIf="loading">Sending email...</span>
          </button>
        </form>

        <!-- STEP 2: Enter OTP -->
        <form *ngIf="step === 2" (ngSubmit)="verifyOTP()" #otpForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="otp">6-Digit Code</label>
            <input 
              type="text" 
              id="otp" 
              name="otp" 
              class="form-input" 
              placeholder="e.g. 123456"
              [(ngModel)]="otp" 
              required 
              minlength="6"
              maxlength="6"
              style="text-align: center; font-size: 20px; letter-spacing: 4px;"
            />
          </div>

          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn" style="background: var(--neutral-100); color: var(--neutral-700); flex: 1;" (click)="step = 1; error = ''; success = '';">
              Back
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 2;" [disabled]="!otpForm.form.valid || loading">
              <span *ngIf="!loading">Verify Code</span>
              <span *ngIf="loading">Verifying...</span>
            </button>
          </div>
        </form>

        <!-- STEP 3: Reset Password -->
        <form *ngIf="step === 3" (ngSubmit)="resetPassword()" #passwordForm="ngForm">
          <div class="form-group">
            <label class="form-label" for="newPassword">New Password</label>
            <input 
              type="password" 
              id="newPassword" 
              name="newPassword" 
              class="form-input" 
              placeholder="Min 6 characters"
              [(ngModel)]="newPassword" 
              required 
              minlength="6"
            />
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="!passwordForm.form.valid || loading">
            <span *ngIf="!loading">Save New Password</span>
            <span *ngIf="loading">Saving password...</span>
          </button>
        </form>

        <div class="auth-footer">
          Remembered your password? <a routerLink="/student/login">Login here</a>
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
      margin-bottom: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 8px;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--neutral-900);
      margin-bottom: 4px;
    }
    p {
      font-size: 13px;
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
      padding: 10px;
      border-radius: var(--radius-md);
      font-size: 13px;
      margin-bottom: 14px;
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
      margin-top: 16px;
      font-size: 13px;
      color: var(--neutral-600);
    }
    .auth-footer a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
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
