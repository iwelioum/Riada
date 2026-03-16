import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthSessionService } from '../services/auth-session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSessionService);
  const token = session.getAccessToken();
  const isApiRequest = request.url.startsWith(environment.apiUrl);

  if (!token || !isApiRequest) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
