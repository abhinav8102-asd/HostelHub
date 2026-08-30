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
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>

      <div class="auth-container">
        <!-- Top Branding Section -->
        <div class="brand-header">
          <div class="logo-card">
            <img src="assets/logo.png" alt="HostelHub Logo" class="brand-logo-img" (error)="onImgError($event)" />
          </div>
          <h2 class="welcome-text">Create Account</h2>
          <p class="welcome-subtext">Register as a student to raise maintenance tickets instantly</p>
        </div>

        <!-- Cyber Glass Form Card -->
        <div class="auth-form-card animate-fade">
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
            <div *ngIf="success" class="alert alert-success">{{ success }}</div>

            <!-- Full Name -->
            <div class="field-container">
              <label class="field-label">FULL NAME</label>
              <div class="input-row">
                <div class="icon-badge"><span>👤</span></div>
                <input type="text" name="name" class="form-input-box" placeholder="e.g. Abhinav Kumar" [(ngModel)]="name" required />
              </div>
            </div>

            <!-- Email Address -->
            <div class="field-container">
              <label class="field-label">EMAIL ADDRESS</label>
              <div class="input-row">
                <div class="icon-badge"><span>✉️</span></div>
                <input type="email" name="email" class="form-input-box" placeholder="e.g. abhinav@student.com" [(ngModel)]="email" required email />
              </div>
            </div>

            <!-- Hostel Block & Room No -->
            <div class="form-row-2">
              <div class="field-container">
                <label class="field-label">HOSTEL BLOCK</label>
                <div class="input-row">
                  <div class="icon-badge"><span>🏢</span></div>
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
                <label class="field-label">ROOM NO.</label>
                <div class="input-row">
                  <div class="icon-badge"><span>🚪</span></div>
                  <input type="text" name="roomNumber" class="form-input-box" placeholder="e.g. 102" [(ngModel)]="roomNumber" required />
                </div>
              </div>
            </div>

            <!-- Roll Number & Gender -->
            <div class="form-row-2">
              <div class="field-container">
                <label class="field-label">ROLL NUMBER</label>
                <div class="input-row">
                  <div class="icon-badge"><span>🪪</span></div>
                  <input type="text" name="rollNumber" class="form-input-box" placeholder="e.g. 2301CS01" [(ngModel)]="rollNumber" required />
                </div>
              </div>

              <div class="field-container">
                <label class="field-label">GENDER</label>
                <div class="input-row">
                  <div class="icon-badge"><span>👥</span></div>
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
              <label class="field-label">ACADEMIC BATCH</label>
              <div class="input-row">
                <div class="icon-badge"><span>🎓</span></div>
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
              <label class="field-label">PHONE NUMBER</label>
              <div class="input-row">
                <div class="icon-badge"><span>📞</span></div>
                <input type="tel" name="phone" class="form-input-box" placeholder="e.g. 9876543210" [(ngModel)]="phone" required />
              </div>
            </div>

            <!-- Password -->
            <div class="field-container">
              <label class="field-label">PASSWORD</label>
              <div class="input-row">
                <div class="icon-badge"><span>🔒</span></div>
                <div class="input-eye-wrapper">
                  <input [type]="showPassword ? 'text' : 'password'" name="password" class="form-input-box" placeholder="Min 6 characters" [(ngModel)]="password" required minlength="6" />
                  <button type="button" class="eye-btn" (click)="togglePassword()">{{ showPassword ? '🙈' : '👁️' }}</button>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-cyber-register" [disabled]="!registerForm.form.valid || loading" style="margin-top: 10px;">
              <span *ngIf="!loading">👤+ CREATE STUDENT ACCOUNT</span>
              <span *ngIf="loading">Creating account...</span>
            </button>
          </form>

          <div class="auth-footer" style="margin-top: 18px;">
            Already have an account? <a routerLink="/student/login" class="signup-link">Sign In Here →</a>
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
      opacity: 0.35;
      pointer-events: none;
    }
    .orb-1 {
      width: 280px;
      height: 280px;
      background: #2563eb;
      top: -40px;
      left: -40px;
    }
    .orb-2 {
      width: 320px;
      height: 320px;
      background: #b31031;
      bottom: -60px;
      right: -60px;
    }

    .auth-container {
      width: 100%;
      max-width: 410px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 10;
    }

    .brand-header {
      text-align: center;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .logo-card {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: rgba(15, 23, 42, 0.8);
      border: 1.5px solid rgba(37, 99, 235, 0.35);
      padding: 8px;
      box-shadow: 0 0 30px rgba(37, 99, 235, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
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
      font-size: 11.5px;
      margin: 0;
      line-height: 1.4;
      font-weight: 500;
    }

    /* Cyber Glass Form Card */
    .auth-form-card {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      padding: 22px 18px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      width: 100%;
      box-sizing: border-box;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .field-container {
      margin-bottom: 12px;
    }

    .field-label {
      display: block;
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      margin-bottom: 5px;
      letter-spacing: 0.8px;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-badge {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(37, 99, 235, 0.25);
      color: #60a5fa;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
    }

    .form-input-box {
      flex: 1;
      height: 38px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 0 12px;
      font-size: 12.5px;
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
      box-shadow: 0 0 14px rgba(59, 130, 246, 0.25);
    }

    .select-input {
      appearance: none;
      background-image: url("data:image/svg+xml;utf8,<svg fill='%2360a5fa' height='18' viewBox='0 0 24 24' width='18' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
      background-repeat: no-repeat;
      background-position: right 8px center;
      padding-right: 28px;
    }
    .select-input option {
      background: #0f172a;
      color: #f8fafc;
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

    .btn-cyber-register {
      width: 100%;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      border: none;
      height: 44px;
      font-size: 13.5px;
      font-weight: 900;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
    }
    .btn-cyber-register:disabled {
      background: #334155;
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.6;
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
      margin-bottom: 12px;
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

  onImgError(event: any): void {
    if (event && event.target) {
      event.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=120&q=80';
    }
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
        this.success = '🎉 Registration successful! Waiting for Warden verification...';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/student/login']);
        }, 2500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
