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
          <div class="brand-logo-text">
            <span class="l-hostel">Hostel</span><span class="l-hub">Hub</span><span class="l-icon">🏠</span>
          </div>
          <div class="logo-tagline">— From Concept to Comfort —</div>
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
      padding: 12px 24px;
      border-radius: 20px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 14px;
    }

    .brand-logo-text {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -1px;
      font-family: 'Outfit', sans-serif;
    }
    .l-hostel { color: #1e293b; }
    .l-hub { color: #b31031; position: relative; }
    .l-roof { font-size: 15px; position: absolute; top: -9px; right: 8px; }

    .logo-tagline {
      font-size: 9px;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-top: 2px;
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
      background: #fdf2f4;
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
      border-color: #b31031;
      background: #ffffff;
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
      background: #fdf2f4;
      border: 1px solid rgba(179, 16, 49, 0.15);
      border-radius: 12px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #b31031;
      font-weight: 600;
      margin: 10px 0 16px 0;
    }
    .sec-icon { font-size: 13px; }

    .btn-crimson {
      width: 100%;
      background: linear-gradient(135deg, #8a0d24 0%, #b31031 100%);
      color: #ffffff;
      border: none;
      height: 44px;
      font-size: 13.5px;
      font-weight: 800;
      border-radius: 12px;
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
    }

    .auth-footer-link {
      text-align: center;
      font-size: 12.5px;
      color: #ffffff;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .login-gold-link {
      color: #fbbf24;
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
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
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
        this.success = 'Registration successful! Waiting for Warden verification...';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/student/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
