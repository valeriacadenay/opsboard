import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SanitizationService {
  sanitize<T>(input: T): T {
    return this.deepClean(input) as T;
  }

  private deepClean(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return this.cleanString(value);
    if (Array.isArray(value)) return value.map((v) => this.deepClean(v));
    if (typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
        sanitized[key] = this.deepClean(val);
      });
      return sanitized;
    }
    return value;
  }

  private cleanString(value: string): string {
    // Remove script tags and inline event handlers
    const withoutScripts = value.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    const withoutHandlers = withoutScripts.replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '');
    return withoutHandlers.trim();
  }
}
