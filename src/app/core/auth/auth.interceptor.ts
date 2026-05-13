import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/health'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl.replace(/\/$/, '');
  const isApiRequest = req.url.startsWith(apiUrl);
  const isPublicAuth = PUBLIC_AUTH_PATHS.some(path => req.url.includes(path));

  if (!isApiRequest || isPublicAuth) {
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
