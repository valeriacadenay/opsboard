import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { provideBrowserGlobalErrorListeners, ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './app/core/error/global-error.handler';
import {
  sanitizationInterceptor,
  correlationIdInterceptor,
  authInterceptor,
  retryInterceptor,
  errorNormalizationInterceptor
} from './app/core/interceptors';

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      sanitizationInterceptor,
      correlationIdInterceptor,
      authInterceptor,
      retryInterceptor,
      errorNormalizationInterceptor
    ])),
  ],
}).catch((err) => console.error(err));
