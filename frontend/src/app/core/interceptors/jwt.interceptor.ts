import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Set Content-Type for urlencoded payloads in login
  if (req.url.includes('/auth/login')) {
    req = req.clone({
      setHeaders: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  return next(req);
};
