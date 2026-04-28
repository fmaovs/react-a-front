import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl.replace(/\/$/, '');
  const isApiRequest = req.url.startsWith(apiUrl);
  const isAuthRequest = req.url.includes('/auth/');

  if (!isApiRequest || isAuthRequest) {
    return next(req);
  }

  const authService = inject(AuthService);
  const currentUser = authService.user();
  if (!currentUser) {
    return next(req);
  }

  const token = currentUser.token;
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
