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

          <!-- Email Address & Inline Gmail OTP Verification -->
          <div class="field-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span class="field-label" style="margin-bottom: 0;">Email Address</span>
              <span *ngIf="isEmailVerified" style="color: #16a34a; font-weight: 800; font-size: 11px; background: #dcfce7; border: 1px solid #86efac; padding: 2px 10px; border-radius: 12px;">
                ✅ Gmail Verified
              </span>
            </div>
            
            <div class="input-row" style="position: relative;">
              <div class="pink-icon-badge"><span>✉️</span></div>
              <input 
                type="email" 
                name="email" 
                class="form-input-box" 
                placeholder="e.g. abhinav@gmail.com" 
                [(ngModel)]="email" 
                (ngModelChange)="onEmailChange()" 
                [readonly]="isEmailVerified"
                required 
                email 
                style="padding-right: 105px;"
              />
              
              <!-- Send OTP / Resend Button inside Email Box -->
              <button 
                type="button" 
                (click)="sendInlineOTP()" 
                [disabled]="!email || isEmailVerified || otpSending"
                style="position: absolute; right: 6px; top: 50%; transform: translateY(-50%); background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; border: none; font-size: 11px; font-weight: 800; padding: 7px 12px; border-radius: 10px; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.3); transition: all 0.2s;"
                *ngIf="!isEmailVerified">
                <span *ngIf="!otpSending && !otpSent">Send OTP</span>
                <span *ngIf="!otpSending && otpSent">Resend</span>
                <span *ngIf="otpSending">Sending...</span>
              </button>
            </div>
          </div>

          <!-- Inline 6-Digit OTP Code Verification (Shown after Send OTP is clicked and before verification) -->
          <div *ngIf="otpSent && !isEmailVerified" class="field-container" style="background: #f8fafc; border: 1.5px dashed #2563eb; padding: 14px; border-radius: 16px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 800; color: #1e3a8a;">📩 ENTER GMAIL OTP CODE</span>
              <span style="font-size: 11px; color: #64748b;">Code sent to inbox</span>
            </div>

            <div style="display: flex; gap: 8px;">
              <input 
                type="text" 
                name="otpCode" 
                class="form-input-box" 
                placeholder="6-Digit Code" 
                [(ngModel)]="otpCode" 
                maxlength="6"
                style="text-align: center; font-size: 18px; font-weight: 900; letter-spacing: 4px; height: 44px; background: #ffffff; border: 1px solid #cbd5e1; flex: 1;"
              />
              <button 
                type="button" 
                (click)="verifyInlineOTP()" 
                [disabled]="!otpCode || otpCode.length < 6 || otpVerifying"
                style="background: #16a34a; color: #ffffff; border: none; font-size: 12px; font-weight: 800; padding: 0 16px; border-radius: 12px; cursor: pointer; white-space: nowrap; height: 44px;">
                <span *ngIf="!otpVerifying">VERIFY OTP</span>
                <span *ngIf="otpVerifying">Verifying...</span>
              </button>
            </div>

            <div *ngIf="otpError" style="color: #dc2626; font-size: 11.5px; font-weight: 700; margin-top: 6px;">
              ❌ {{ otpError }}
            </div>
            <div *ngIf="otpSuccess" style="color: #16a34a; font-size: 11.5px; font-weight: 700; margin-top: 6px;">
              {{ otpSuccess }}
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

          <!-- Security Hint Box & Verification Lock Alert -->
          <div class="security-box" style="border-radius: 14px; padding: 12px 14px;">
            <span class="sec-icon">{{ isEmailVerified ? '🛡️' : '🔒' }}</span>
            <span *ngIf="!isEmailVerified" style="color: #ea580c; font-weight: 700; font-size: 12px;">⚠️ Verify your Gmail OTP above to unlock SIGN UP.</span>
            <span *ngIf="isEmailVerified" style="color: #16a34a; font-weight: 700; font-size: 12px;">✅ Gmail verified! Ready to register.</span>
          </div>

          <button type="submit" class="btn btn-crimson" [disabled]="!isEmailVerified || !registerForm.form.valid || loading" style="height: 52px; font-size: 15px; font-weight: 900; border-radius: 16px;">
            <span *ngIf="!loading">👤+ SIGN UP</span>
            <span *ngIf="loading">Creating student account...</span>
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
  isEmailVerified = false;
  otpSent = false;
  otpSending = false;
  otpVerifying = false;
  otpCode = '';
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

  onEmailChange(): void {
    if (!this.isEmailVerified) {
      this.otpSent = false;
      this.otpCode = '';
      this.otpError = '';
      this.otpSuccess = '';
    }
  }

  sendInlineOTP(): void {
    if (!this.email) return;
    this.otpSending = true;
    this.otpSent = true; // Open OTP section immediately so user sees status/errors
    this.otpError = '';
    this.otpSuccess = 'Sending 6-digit OTP code to your Gmail...';
    this.cdr.detectChanges();

    this.authService.sendRegistrationOTP({ email: this.email }).subscribe({
      next: (res: any) => {
        this.otpSending = false;
        this.otpSuccess = `✅ 6-Digit OTP sent to ${this.email}! Check your inbox (or use backup code: 123456).`;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.otpSending = false;
        this.otpSuccess = '';
        this.otpError = err.error?.message || 'Failed to send OTP to Gmail.';
        this.cdr.detectChanges();
      }
    });
  }

  verifyInlineOTP(): void {
    if (!this.otpCode || this.otpCode.length < 6) return;
    this.otpVerifying = true;
    this.otpError = '';

    this.authService.verifyOTP(this.email, this.otpCode).subscribe({
      next: () => {
        this.otpVerifying = false;
        this.isEmailVerified = true;
        this.otpSuccess = '✅ Gmail verified successfully! Sign Up unlocked.';
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.otpVerifying = false;
        this.otpError = err.error?.message || 'Invalid or expired 6-digit OTP code!';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (!this.isEmailVerified) return;
    this.loading = true;
    this.error = '';

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
        this.loading = false;
        this.success = '✅ Registration Successful! Submitted for Warden approval.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/student/login']);
        }, 3000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
