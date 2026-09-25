import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const user = authService.currentUserValue;
  const allowedRoles: string[] = route.data['roles'] || [];

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};
