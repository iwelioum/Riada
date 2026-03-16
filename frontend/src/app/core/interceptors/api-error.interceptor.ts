import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthSessionService } from '../services/auth-session.service';

const GENERIC_SERVER_ERROR = 'an unexpected error occurred.';

function extractBackendMessage(error: HttpErrorResponse): string | null {
  if (typeof error.error === 'string' && error.error.trim().length > 0) {
    return error.error.trim();
  }

  if (error.error && typeof error.error === 'object') {
    const payload = error.error as { message?: unknown; Message?: unknown };
    const value = payload.message ?? payload.Message;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function normalizeApiError(error: HttpErrorResponse): HttpErrorResponse {
  const backendMessage = extractBackendMessage(error);
  const normalizedBackendMessage = backendMessage?.toLowerCase();

  if (error.status === 0) {
    return new HttpErrorResponse({
      status: error.status,
      statusText: error.statusText,
      headers: error.headers,
      url: error.url ?? undefined,
      error: {
        message: 'Cannot reach RIADA API. Verify backend and MySQL are running.'
      }
    });
  }

  if (error.status >= 500 && (!backendMessage || normalizedBackendMessage === GENERIC_SERVER_ERROR)) {
    return new HttpErrorResponse({
      status: error.status,
      statusText: error.statusText,
      headers: error.headers,
      url: error.url ?? undefined,
      error: {
        message: 'Backend server error. Check API logs and database connectivity.'
      }
    });
  }

  return error;
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSessionService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          session.clearAccessToken();
        }

        return throwError(() => normalizeApiError(error));
      }

      return throwError(() => error);
    })
  );
};
