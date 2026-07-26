import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Check role requirements if specified
    const expectedRoles = route.data['roles'] as Array<string>;
    if (expectedRoles && expectedRoles.length > 0) {
      if (authService.hasRole(expectedRoles)) {
        return true;
      }
      // Redirect to correct dashboard based on actual role
      const role = authService.currentUserValue?.role;
      if (role) {
        router.navigate([`/${role}`]);
      } else {
        router.navigate(['/student/login']);
      }
      return false;
    }
    return true;
  }

  // Not logged in
  router.navigate(['/student/login']);
  return false;
};
