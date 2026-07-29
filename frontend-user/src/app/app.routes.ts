import { Routes } from '@angular/router';
import { LoginComponent } from './views/auth/login';
import { RegisterComponent } from './views/auth/register';
import { ForgotPasswordComponent } from './views/auth/forgot-password';
import { StudentDashboardComponent } from './views/student/student';
import { WardenDashboardComponent } from './views/warden/warden';
import { StaffDashboardComponent } from './views/staff/staff';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'student/login', component: LoginComponent },
  { path: 'student/register', component: RegisterComponent },
  { path: 'student/forgot-password', component: ForgotPasswordComponent },
  { 
    path: 'student', 
    component: StudentDashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: ['student'] } 
  },
  { 
    path: 'warden', 
    component: WardenDashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: ['warden'] } 
  },
  { 
    path: 'staff', 
    component: StaffDashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: ['staff'] } 
  },
  { path: '', redirectTo: '/student/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/student/login' }
];
