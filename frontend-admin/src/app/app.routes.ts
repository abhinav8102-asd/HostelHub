import { Routes } from '@angular/router';
import { LoginComponent } from './views/auth/login';
import { AdminDashboardComponent } from './views/admin/admin';
import { ManagementDashboardComponent } from './views/management/management-dashboard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'admin/login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: ['admin'] } 
  },
  { path: 'management', redirectTo: '/admin', pathMatch: 'full' },
  { path: '', redirectTo: '/admin/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/admin/login' }
];
