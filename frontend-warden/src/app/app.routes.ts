import { Routes } from '@angular/router';
import { LoginComponent } from './views/auth/login';
import { WardenDashboardComponent } from './views/warden/warden';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'warden/login', component: LoginComponent },
  { 
    path: 'warden', 
    component: WardenDashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: ['warden'] } 
  },
  { path: '', redirectTo: '/warden/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/warden/login' }
];
