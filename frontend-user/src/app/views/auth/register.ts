import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <!-- Top Branding Section -->
      <div class="brand-header">
        <div class="logo-card">
          <img src="assets/logo.png" alt="HostelHub Logo" class="brand-logo-img" />
        </div>
        <h2 class="welcome-text">Create Account</h2>
        <p class="welcome-subtext">Register as a student to submit maintenance problems</p>
      </div>

      <!-- White Rounded Form Card -->
      <div class="auth-form-card">
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <!-- Full Name -->
          <div class="field-container">
            <span class="field-label">Full Name</span>
            <div class="input-row">
              <div class="pink-icon-badge"><span>👤</span></div>
              <input type="text" name="name" class="form-input-box" placeholder="e.g. Abhinav Kumar" [(ngModel)]="name" required />
            </div>
          </div>

          <!-- Email Address -->
          <div class="field-container">
            <span class="field-label">Email Address</span>
            <div class="input-row">
              <div class="pink-icon-badge"><span>✉️</span></div>
              <input type="email" name="email" class="form-input-box" placeholder="e.g. abhinav@gmail.com" [(ngModel)]="email" required email />
            </div>
          </div>

          <!-- Hostel Block & Room No -->
          <div class="form-row-2">
            <div class="field-container">
              <span class="field-label">Hostel Block</span>
              <div class="input-row">
                <div class="pink-icon-badge"><span>🏢</span></div>
                <select name="hostelBlock" class="form-input-box select-input" [(ngModel)]="hostelBlock" required>
                  <option value="" disabled selected>Select Hostel</option>
                  <option value="Boys Hostel 1">Boys Hostel 1</option>
                  <option value="Boys Hostel 2">Boys Hostel 2</option>
                  <option value="Girls Hostel 1">Girls Hostel 1</option>
                  <option value="Girls Hostel 2">Girls Hostel 2</option>
                </select>
              </div>
            </div>

            <div class="field-container">
              <span class="field-label">Room No.</span>
              <div class="input-row">
                <div class="pink-icon-badge"><span>🚪</span></div>
                <input type="text" name="roomNumber" class="form-input-box" placeholder="e.g. 102" [(ngModel)]="roomNumber" required />
              </div>
            </div>
          </div>

          <!-- Roll Number & Gender -->
          <div class="form-row-2">
            <div class="field-container">
              <span class="field-label">Roll Number</span>
              <div class="input-row">
                <div class="pink-icon-badge"><span>🪪</span></div>
                <input type="text" name="rollNumber" class="form-input-box" placeholder="e.g. 2301CS01" [(ngModel)]="rollNumber" required />
              </div>
            </div>

            <div class="field-container">
              <span class="field-label">Gender</span>
              <div class="input-row">
                <div class="pink-icon-badge"><span>👥</span></div>
                <select name="gender" class="form-input-box select-input" [(ngModel)]="gender" required>
                  <option value="" disabled selected>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Academic Batch -->
          <div class="field-container">
            <span class="field-label">Academic Batch</span>
            <div class="input-row">
              <div class="pink-icon-badge"><span>🎓</span></div>
              <select name="batch" class="form-input-box select-input" [(ngModel)]="batch" required>
                <option value="" disabled selected>Select Batch</option>
                <option value="Batch 2023-2027">Batch 2023-2027</option>
                <option value="Batch 2024-2028">Batch 2024-2028</option>
                <option value="Batch 2025-2029">Batch 2025-2029</option>
                <option value="Batch 2026-2030">Batch 2026-2030</option>
              </select>
            </div>
          </div>

          <!-- Phone Number -->
          <div class="field-container">
            <span class="field-label">Phone Number</span>
            <div class="input-row">
              <div class="pink-icon-badge"><span>📞</span></div>
              <input type="tel" name="phone" class="form-input-box" placeholder="e.g. 9876543210" [(ngModel)]="phone" required />
            </div>
          </div>

          <!-- Password -->
          <div class="field-container">
            <span class="field-label">Password</span>
            <div class="input-row">
              <div class="pink-icon-badge"><span>🔒</span></div>
              <div class="input-eye-wrapper">
                <input [type]="showPassword ? 'text' : 'password'" name="password" class="form-input-box" placeholder="Min 6 characters" [(ngModel)]="password" required minlength="6" />
                <button type="button" class="eye-btn" (click)="togglePassword()">{{ showPassword ? '🙈' : '👁️' }}</button>
              </div>
            </div>
          </div>

          <!-- Security Hint Box -->
          <div class="security-box">
            <span class="sec-icon">🛡️</span>
            <span>Use a strong password for better security.</span>
          </div>

          <button type="submit" class="btn btn-crimson" [disabled]="!registerForm.form.valid || loading">
            <span *ngIf="!loading">👤+ SIGN UP</span>
            <span *ngIf="loading">Creating account...</span>
          </button>
        </form>
      </div>

      <div class="auth-footer-link">
        Already have an account? <a routerLink="/student/login" class="login-gold-link">Sign In &gt;</a>
      </div>

      <!-- Bottom Feature Container -->
      <div class="bottom-features-box">
        <div class="feature-col">
          <div class="feature-icon-gold">🛡️</div>
          <div class="feature-title">Secure & Safe</div>
          <div class="feature-desc">Your data is 100% protected</div>
        </div>
        <div class="feature-col">
          <div class="feature-icon-gold">⚡</div>
          <div class="feature-title">Quick & Easy</div>
          <div class="feature-desc">Simple registration in just a few steps</div>
        </div>
        <div class="feature-col">
          <div class="feature-icon-gold">🔔</div>
          <div class="feature-title">Instant Alerts</div>
          <div class="feature-desc">Get updates on your complaints instantly</div>
        </div>
      </div>
      <!-- GMAIL OTP VERIFICATION MODAL -->
      <div *ngIf="showOtpModal" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 16px;">
        <div style="background: #ffffff; width: 100%; max-width: 440px; border-radius: 24px; padding: 28px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); text-align: center;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px auto;">📩</div>
          <h3 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 900; color: #0f172a;">Verify Gmail Inbox</h3>
          <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
            We sent a 6-digit verification code to <strong style="color: #2563eb;">{{ email }}</strong>. Please check your inbox or spam folder.
          </p>

          <div *ngIf="otpError" class="alert alert-danger" style="margin-bottom: 14px;">{{ otpError }}</div>
          <div *ngIf="otpSuccess" class="alert alert-success" style="margin-bottom: 14px;">{{ otpSuccess }}</div>

          <div style="margin-bottom: 20px;">
            <input 
              type="text" 
              name="otpCode" 
              class="form-input-box" 
              placeholder="Enter 6-Digit OTP Code" 
              [(ngModel)]="otpCode" 
              maxlength="6"
              style="text-align: center; font-size: 24px; font-weight: 900; letter-spacing: 6px; height: 52px; border: 2px solid #2563eb; background: #f8fafc;"
              required 
            />
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button type="button" (click)="onVerifyOTP()" class="btn btn-crimson" [disabled]="!otpCode || otpCode.length < 6 || verifyingOtp" style="height: 48px; font-size: 14px; font-weight: 800;">
              <span *ngIf="!verifyingOtp">✅ VERIFY OTP & COMPLETE REGISTRATION</span>
              <span *ngIf="verifyingOtp">Verifying code...</span>
            </button>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <button type="button" (click)="resendOTP()" class="btn" style="background: transparent; color: #2563eb; font-size: 12px; font-weight: 700; border: none; cursor: pointer;">
                🔄 Resend OTP Code
              </button>
              <button type="button" (click)="cancelOtpModal()" class="btn" style="background: transparent; color: #64748b; font-size: 12px; font-weight: 700; border: none; cursor: pointer;">
                ❌ Cancel
              </button>
            </div>
          </div>
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
      box-sizing: border-box;
      padding: 24px 16px 20px;
    }
    
    .brand-header {
      text-align: center;
      margin-bottom: 16px;
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
      margin-bottom: 14px;
    }
    .brand-logo-img {
      height: 44px;
      width: auto;
      object-fit: contain;
    }

    .welcome-text {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 4px 0;
    }

    .welcome-subtext {
      color: rgba(255, 255, 255, 0.8);
      font-size: 11.5px;
      max-width: 280px;
      margin: 0;
      line-height: 1.4;
    }

    /* White Rounded Form Card */
    .auth-form-card {
      background: #ffffff;
      border-radius: 28px;
      padding: 20px 18px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      width: 100%;
      max-width: 390px;
      box-sizing: border-box;
      margin-bottom: 16px;
    }

    .field-container {
      margin-bottom: 14px;
    }

    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 5px;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pink-icon-badge {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #eff6ff;
      color: #2563eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
    }

    .form-input-box {
      flex: 1;
      height: 38px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0 12px;
      font-size: 12.5px;
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

    .select-input {
      appearance: none;
      background-image: url("data:image/svg+xml;utf8,<svg fill='%2364748b' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
      background-repeat: no-repeat;
      background-position: right 8px center;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .input-eye-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
    }
    .input-eye-wrapper .form-input-box {
      padding-right: 34px;
    }

    .eye-btn {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: #64748b;
    }

    .security-box {
      background: #eff6ff;
      border: 1px solid rgba(37, 99, 235, 0.2);
      border-radius: 12px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #2563eb;
      font-weight: 600;
      margin: 10px 0 16px 0;
    }
    .sec-icon { font-size: 13px; }

    .btn-crimson {
      width: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      height: 44px;
      font-size: 13.5px;
      font-weight: 800;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-crimson:disabled {
      background: #cbd5e1;
      box-shadow: none;
    }

    .auth-footer-link {
      text-align: center;
      font-size: 12.5px;
      color: #ffffff;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .login-gold-link {
      color: #60a5fa;
      text-decoration: none;
      font-weight: 800;
    }

    .bottom-features-box {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 12px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      width: 100%;
      max-width: 390px;
    }
    .feature-col { text-align: center; color: #ffffff; }
    .feature-icon-gold {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.25);
      color: #60a5fa;
      margin: 0 auto 4px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    .feature-title { font-size: 10px; font-weight: 700; margin-bottom: 2px; }
    .feature-desc { font-size: 8px; opacity: 0.75; line-height: 1.2; }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  hostelBlock = '';
  roomNumber = '';
  rollNumber = '';
  gender = '';
  batch = '';
  phone = '';
  password = '';
  loading = false;
  error = '';
  success = '';
  showPassword = false;
  showOtpModal = false;
  otpCode = '';
  verifyingOtp = false;
  otpError = '';
  otpSuccess = '';

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

    // Step 1: Send Registration OTP to Gmail inbox first
    this.authService.sendRegistrationOTP({ email: this.email, rollNumber: this.rollNumber }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.showOtpModal = true;
        this.otpSuccess = `✅ Verification code sent to ${this.email}!`;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to send OTP code to Gmail. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  onVerifyOTP(): void {
    if (!this.otpCode || this.otpCode.length < 6) return;
    this.verifyingOtp = true;
    this.otpError = '';

    this.authService.verifyOTP(this.email, this.otpCode).subscribe({
      next: () => {
        // Step 2: OTP Verified! Proceed to create user account
        const userData = {
          name: this.name,
          email: this.email,
          role: 'student',
          phone: this.phone,
          roomNumber: this.roomNumber,
          hostelBlock: this.hostelBlock,
          rollNumber: this.rollNumber,
          gender: this.gender,
          batch: this.batch,
          password: this.password
        };

        this.authService.register(userData).subscribe({
          next: () => {
            this.verifyingOtp = false;
            this.showOtpModal = false;
            this.success = '✅ Gmail Verified & Registration Successful! Waiting for Warden approval.';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.router.navigate(['/student/login']);
            }, 3000);
          },
          error: (err: any) => {
            this.verifyingOtp = false;
            this.otpError = err.error?.message || 'Registration failed. Please try again.';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        this.verifyingOtp = false;
        this.otpError = err.error?.message || 'Invalid or expired OTP code!';
        this.cdr.detectChanges();
      }
    });
  }

  resendOTP(): void {
    this.otpError = '';
    this.otpSuccess = 'Sending new OTP code...';
    this.cdr.detectChanges();

    this.authService.sendRegistrationOTP({ email: this.email, rollNumber: this.rollNumber }).subscribe({
      next: () => {
        this.otpSuccess = '✅ New OTP code sent to your Gmail inbox!';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.otpSuccess = '';
        this.otpError = err.error?.message || 'Failed to resend OTP code.';
        this.cdr.detectChanges();
      }
    });
  }

  cancelOtpModal(): void {
    this.showOtpModal = false;
    this.otpCode = '';
    this.otpError = '';
    this.otpSuccess = '';
    this.cdr.detectChanges();
  }
}
