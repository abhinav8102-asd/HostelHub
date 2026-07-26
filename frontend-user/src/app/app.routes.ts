import { Routes } from '@angular/router';
import { LoginComponent } from './views/auth/login';
import { RegisterComponent } from './views/auth/register';
import { StudentDashboardComponent } from './views/student/student';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'student/login', component: LoginComponent },
  { path: 'student/register', component: RegisterComponent },
  { 
    path: 'student', 
    component: StudentDashboardComponent, 
    canActivate: [authGuard], 
    data: { roles: ['student'] } 
  },
  { path: '', redirectTo: '/student/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/student/login' }
];
