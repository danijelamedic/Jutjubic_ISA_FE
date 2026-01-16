import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  const isPublicEndpoint = req.url.includes('/api/public');
  const isAuthEndpoint = req.url.includes('/api/auth');

  // Ne šalji Authorization header na public/auth rute
  if (!token || isPublicEndpoint || isAuthEndpoint) {
    return next(req);
  }

  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(req);
};
