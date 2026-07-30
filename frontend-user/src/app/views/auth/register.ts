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
        <div class="logo-container">
          <div class="logo-badge">
            <img src="logo.png" alt="HostelHub Logo" class="logo-img" />
          </div>
        </div>
        <h2 class="welcome-text">Create Account</h2>
        <p class="welcome-subtext">Register as a student to submit maintenance problems</p>
      </div>

      <!-- Rounded Bottom Form Card -->
      <div class="auth-form-card">
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              class="form-input" 
              placeholder="e.g. Abhinav Kumar"
              [(ngModel)]="name" 
              required
            />
          </div>

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
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="hostelBlock">Hostel Block</label>
              <select id="hostelBlock" name="hostelBlock" class="form-input select-input" [(ngModel)]="hostelBlock" required>
                <option value="" disabled selected>Select Hostel</option>
                <option value="Boys Hostel 1">Boys Hostel 1</option>
                <option value="Boys Hostel 2">Boys Hostel 2</option>
                <option value="Girls Hostel 1">Girls Hostel 1</option>
                <option value="Girls Hostel 2">Girls Hostel 2</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="roomNumber">Room No</label>
              <input 
                type="text" 
                id="roomNumber" 
                name="roomNumber" 
                class="form-input" 
                placeholder="e.g. 102"
                [(ngModel)]="roomNumber" 
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="rollNumber">Roll Number</label>
              <input 
                type="text" 
                id="rollNumber" 
                name="rollNumber" 
                class="form-input" 
                placeholder="e.g. 2301CS01"
                [(ngModel)]="rollNumber" 
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="gender">Gender</label>
              <select id="gender" name="gender" class="form-input select-input" [(ngModel)]="gender" required>
                <option value="" disabled selected>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="batch">Academic Batch</label>
            <select id="batch" name="batch" class="form-input select-input" [(ngModel)]="batch" required>
              <option value="" disabled selected>Select Batch</option>
              <option value="Batch 2023-2027">Batch 2023-2027</option>
              <option value="Batch 2024-2028">Batch 2024-2028</option>
              <option value="Batch 2025-2029">Batch 2025-2029</option>
              <option value="Batch 2026-2030">Batch 2026-2030</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              class="form-input" 
              placeholder="e.g. 9876543210"
              [(ngModel)]="phone" 
              required
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
                placeholder="Min 6 characters"
                [(ngModel)]="password" 
                required
                minlength="6"
              />
              <button type="button" class="eye-btn" (click)="togglePassword()">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-gradient" [disabled]="!registerForm.form.valid || loading">
            <span *ngIf="!loading">SIGN UP</span>
            <span *ngIf="loading">Creating account...</span>
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/student/login" class="login-link">Sign In</a>
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
      padding-top: 30px;
    }
    
    /* Logo vector branding */
    .brand-header {
      text-align: center;
      padding: 16px;
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
      margin-bottom: 12px;
    }
    .logo-badge {
      background: #ffffff;
      padding: 8px 16px;
      border-radius: 14px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
      display: inline-flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 10px;
    }
    .logo-img {
      max-width: 160px;
      height: auto;
      object-fit: contain;
    }

    .welcome-text {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      margin: 8px 0 4px 0;
    }
    .welcome-subtext {
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      max-width: 280px;
      margin: 0;
      line-height: 1.4;
    }

    /* Bottom white card panel */
    .auth-form-card {
      background: #ffffff;
      border-radius: 32px;
      padding: 28px 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      width: calc(100% - 40px);
      margin: 0 20px 24px 20px;
      box-sizing: border-box;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 20px;
      position: relative;
    }
    .form-label {
      display: block;
      font-size: 11px;
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
      padding: 6px 0;
      font-size: 14px;
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

    /* Dropdown reset style */
    .select-input {
      color: #1e293b;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml;utf8,<svg fill='%2364748b' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
      background-repeat: no-repeat;
      background-position: right 0px center;
      background-size: 18px;
    }

    /* Double column row */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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

    /* Gradient Button */
    .btn-gradient {
      width: 100%;
      background: linear-gradient(135deg, #b31031 0%, #690518 100%);
      color: #ffffff;
      border: none;
      padding: 13px;
      font-size: 13.5px;
      font-weight: 700;
      border-radius: 25px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(179, 16, 49, 0.25);
      transition: transform 0.2s, box-shadow 0.2s;
      outline: none;
      letter-spacing: 0.5px;
      margin-top: 10px;
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
      padding: 10px;
      border-radius: 12px;
      font-size: 13px;
      margin-bottom: 16px;
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
      margin-top: 20px;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .login-link {
      color: #b31031;
      text-decoration: none;
      font-weight: 700;
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
