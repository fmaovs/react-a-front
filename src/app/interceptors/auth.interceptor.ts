import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl.replace(/\/$/, '');
  const isApiRequest = req.url.startsWith(apiUrl);
  const isAuthRequest = req.url.includes('/auth/');

  if (!isApiRequest || isAuthRequest) {
    return next(req);
  }

  const savedUser = localStorage.getItem('bv_user');
  if (!savedUser) {
    return next(req);
  }

  try {
    const parsed = JSON.parse(savedUser) as { token?: string };
    const token = parsed?.token;

    if (!token) {
      return next(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  } catch {
    localStorage.removeItem('bv_user');
    return next(req);
  }
};
