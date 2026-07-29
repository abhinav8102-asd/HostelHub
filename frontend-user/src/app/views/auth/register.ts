import { Component } from '@angular/core';
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
      <div class="auth-header">
        <div class="logo">🏨 HostelHub</div>
        <h2>Create Account</h2>
        <p>Register as a student to submit maintenance problems</p>
      </div>

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
            <label class="form-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="e.g. abhinav@student.com"
              [(ngModel)]="email" 
              required 
              email
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="hostelBlock">Hostel Block</label>
              <select id="hostelBlock" name="hostelBlock" class="form-input" [(ngModel)]="hostelBlock" required>
                <option value="" disabled selected>Select Block</option>
                <option value="Block-A">Block A</option>
                <option value="Block-B">Block B</option>
                <option value="Block-C">Block C</option>
                <option value="Block-D">Block D</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="roomNumber">Room No</label>
              <input 
                type="text" 
                id="roomNumber" 
                name="roomNumber" 
                class="form-input" 
                placeholder="e.g. 102-B"
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
              <select id="gender" name="gender" class="form-input" [(ngModel)]="gender" required>
                <option value="" disabled selected>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="batch">Academic Batch</label>
            <select id="batch" name="batch" class="form-input" [(ngModel)]="batch" required>
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

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input" 
              placeholder="Min 6 characters"
              [(ngModel)]="password" 
              required
              minlength="6"
            />
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="!registerForm.form.valid || loading">
            <span *ngIf="!loading">Register</span>
            <span *ngIf="loading">Creating account...</span>
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/student/login">Login here</a>
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
      overflow-y: auto;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 20px;
      margin-top: 10px;
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
      padding: 20px;
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
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';

    const userData = {
      name: this.name,
      email: this.email,
      role: 'student', // Students register on public form
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
        setTimeout(() => {
          this.router.navigate(['/student/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Try again.';
      }
    });
  }
}
