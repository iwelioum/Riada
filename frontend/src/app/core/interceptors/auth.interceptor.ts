import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { AuthSessionService } from '../services/auth-session.service';
import { NotificationService } from '../services/notification.service';

const AUTH_ENDPOINT_PATTERN = /\/auth\/(token|refresh|logout)(?:\/|\?|$)/i;
let refreshTokenRequest$: Observable<string> | null = null;

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINT_PATTERN.test(url);
}

function withCredentials(request: HttpRequest<unknown>): HttpRequest<unknown> {
  if (request.withCredentials) {
    return request;
  }

  return request.clone({ withCredentials: true });
}

function withAuthorization(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  const normalizedToken = token?.trim() ?? '';
  if (normalizedToken.length === 0 || request.headers.has('Authorization')) {
    return request;
  }

  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${normalizedToken}`
    }
  });
}

function getOrCreateRefreshRequest(
  authService: AuthService,
  session: AuthSessionService,
  router: Router,
  notification: NotificationService
): Observable<string> {
  if (!refreshTokenRequest$) {
    refreshTokenRequest$ = authService.refreshToken().pipe(
      map(() => {
        const refreshedToken = session.getAccessToken();
        if (!refreshedToken) {
          throw new Error('Refresh endpoint succeeded but no access token is available.');
        }
        return refreshedToken;
      }),
      catchError((refreshError: unknown) => {
        session.clearAccessToken();
        notification.error('Session expired. Please login again.');
        router.navigate(['/login']);
        return throwError(() => refreshError);
      }),
      finalize(() => {
        refreshTokenRequest$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  return refreshTokenRequest$;
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const session = inject(AuthSessionService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  const isApiRequest = request.url.startsWith(environment.apiUrl);

  if (!isApiRequest) {
    return next(request);
  }

  const authRequest = withCredentials(request);
  const requestWithToken = isAuthEndpoint(request.url)
    ? authRequest
    : withAuthorization(authRequest, session.getAccessToken());

  return next(requestWithToken).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint(request.url)) {
        return throwError(() => error);
      }

      return getOrCreateRefreshRequest(authService, session, router, notification).pipe(
        switchMap((refreshedToken) => next(withAuthorization(withCredentials(request), refreshedToken)))
      );
    })
  );
};
