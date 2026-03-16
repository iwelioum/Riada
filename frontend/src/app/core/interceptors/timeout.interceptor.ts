import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { throwError, timeout } from 'rxjs';

export const timeoutInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    timeout({
      each: environment.requestTimeoutMs,
      with: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 0,
              statusText: 'Request Timeout',
              url: request.url,
              error: {
                message: `Request timed out after ${environment.requestTimeoutMs}ms.`
              }
            })
        )
    })
  );
