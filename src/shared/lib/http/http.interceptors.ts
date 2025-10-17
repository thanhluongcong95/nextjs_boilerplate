import { AppError } from '@/shared/lib/errors/AppError';
import { ErrorCode } from '@/shared/lib/errors/error-codes';
import { handleError, isRetryableError } from '@/shared/lib/errors/error-handler';
import { getRouter } from '@/shared/lib/router-bridge';

import type { HttpMeta } from './http.types';

let tokenGetter: (() => string | null) | null = null;

export function registerTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

export async function applyRequestInterceptors(
  url: string,
  options: RequestInit,
  meta: HttpMeta
): Promise<[string, RequestInit]> {
  if (meta.timeout) {
    options.signal = AbortSignal.timeout(meta.timeout);
  }

  const headers = new Headers(options.headers);
  const body = options.body;
  const hasFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const hasUrlSearchParams =
    typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
  const hasBlob = typeof Blob !== 'undefined' && body instanceof Blob;
  if (!headers.has('Content-Type') && !hasFormData && !hasUrlSearchParams && !hasBlob) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  if (!meta.skipAuth && tokenGetter) {
    const token = tokenGetter();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return [url, { ...options, headers, signal: options.signal }];
}

export async function applyResponseInterceptors(
  response: Response,
  meta: HttpMeta,
  attempt: number
): Promise<Response> {
  if (response.status === 401) {
    getRouter()?.replace('/login');
    throw new AppError(ErrorCode.UNAUTHORIZED, undefined, 401);
  }

  if (response.status === 403) {
    throw new AppError(ErrorCode.FORBIDDEN, undefined, 403);
  }

  if (response.status >= 500) {
    const appError = new AppError(ErrorCode.SERVER_ERROR, undefined, response.status);
    if ((meta.retry ?? 0) > attempt && isRetryableError(appError)) {
      const delay = (meta.retryDelayMs ?? 1000) * (attempt + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      throw appError;
    }
  }

  return response;
}

export function interceptHttpError(error: unknown): never {
  throw handleError(error);
}
