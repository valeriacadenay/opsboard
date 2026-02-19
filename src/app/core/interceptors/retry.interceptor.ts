import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { retryWhen, scan, delayWhen, timer, throwError } from 'rxjs';

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 200;

export const retryInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const shouldRetry = req.method === 'GET';

  return next(req).pipe(
    retryWhen((errors) =>
      errors.pipe(
        scan((attempt, error) => {
          const nextAttempt = attempt + 1;
          if (!shouldRetry || nextAttempt > MAX_ATTEMPTS || !isRetryable(error)) {
            throw error;
          }
          return nextAttempt;
        }, 0),
        delayWhen((attempt) => timer(BASE_DELAY_MS * Math.pow(2, Math.max(attempt - 1, 0))))
      )
    )
  );
};

function isRetryable(error: HttpErrorResponse): boolean {
  if (!(error instanceof HttpErrorResponse)) return false;
  if (error.status === 0) return true; // network issues
  return error.status >= 500 && error.status !== 501;
}
