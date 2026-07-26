import { Routes } from '@angular/router';
import { LoginComponent } from './views/auth/login';
import { StaffDashboardComponent } from './views/staff/staff';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'staff/login', component: LoginComponent },
  { 
    path: 'staff', 
    component: StaffDashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: ['staff'] } 
  },
  { path: '', redirectTo: '/staff/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/staff/login' }
];
