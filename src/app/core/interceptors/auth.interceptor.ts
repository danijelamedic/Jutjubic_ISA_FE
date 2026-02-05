import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  const isPublicEndpoint = req.url.includes('/api/public');
  const isAuthEndpoint = req.url.includes('/api/auth');

  if (!token || isPublicEndpoint || isAuthEndpoint) {
    return next(req);
  }

  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  
  console.log('INTERCEPT', req.url);

  return next(req);
};
