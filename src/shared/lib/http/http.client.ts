import { AppError } from '@/shared/lib/errors/AppError';
import { ErrorCode } from '@/shared/lib/errors/error-codes';
import { isRetryableError } from '@/shared/lib/errors/error-handler';
import {
  applyRequestInterceptors,
  applyResponseInterceptors,
  interceptHttpError,
} from '@/shared/lib/http/http.interceptors';
import type { HttpOptions, HttpRequestOptions } from '@/shared/lib/http/http.types';
import { parseApiResponse } from '@/shared/lib/validation/schemas';
import { startGlobalLoading, stopGlobalLoading } from '@/shared/state/loading.controller';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const STATUS_ERROR_CODE_MAP: Record<number, ErrorCode> = {
  400: ErrorCode.BAD_REQUEST,
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  408: ErrorCode.TIMEOUT_ERROR,
  409: ErrorCode.BAD_REQUEST,
  422: ErrorCode.VALIDATION_ERROR,
  429: ErrorCode.SERVICE_UNAVAILABLE,
};

function resolveErrorCode(status: number): ErrorCode {
  if (status >= 500) {
    return ErrorCode.SERVER_ERROR;
  }
  return STATUS_ERROR_CODE_MAP[status] ?? ErrorCode.UNKNOWN_ERROR;
}

async function extractErrorDetails(response: Response): Promise<unknown> {
  const cloned = response.clone();
  const contentType = cloned.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      return await cloned.json();
    }
    return await cloned.text();
  } catch {
    return undefined;
  }
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const base = API_BASE_URL || 'http://localhost:3000';
  const url = new URL(path, base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function isBodyInit(value: unknown): value is BodyInit {
  if (value == null) return false;
  if (typeof value === 'string') return true;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  if (typeof FormData !== 'undefined' && value instanceof FormData) return true;
  if (typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams)
    return true;
  if (value instanceof ArrayBuffer) return true;
  if (
    typeof ArrayBuffer !== 'undefined' &&
    typeof ArrayBuffer.isView === 'function' &&
    ArrayBuffer.isView(value)
  ) {
    return true;
  }
  if (typeof ReadableStream !== 'undefined' && value instanceof ReadableStream)
    return true;
  return false;
}

function serialiseBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (typeof body === 'object' || typeof body === 'boolean' || typeof body === 'number') {
    return JSON.stringify(body);
  }

  return String(body);
}

export async function http<T = unknown>(
  path: string,
  options: HttpOptions<T> = {}
): Promise<T> {
  const { method = 'GET', params, body, schema, meta = {} } = options;
  const shouldToggleGlobal = meta.showGlobalLoading ?? true;
  const url = buildUrl(path, params);

  const maxRetries = meta.retry ?? 0;

  if (shouldToggleGlobal) {
    startGlobalLoading();
  }

  try {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const requestInit: RequestInit = {
        method,
        headers: options.headers,
        body: serialiseBody(body),
      };

      try {
        const [finalUrl, finalOptions] = await applyRequestInterceptors(
          url,
          requestInit,
          meta
        );
        const response = await fetch(finalUrl, finalOptions);
        const handledResponse = await applyResponseInterceptors(response, meta, attempt);

        if (!handledResponse.ok) {
          const status = handledResponse.status;
          const errorDetails = await extractErrorDetails(handledResponse);
          throw new AppError(resolveErrorCode(status), undefined, status, errorDetails);
        }

        if (handledResponse.status === 204) {
          return undefined as T;
        }

        const data = await handledResponse.json();
        if (schema) {
          return parseApiResponse(schema, data);
        }

        return data as T;
      } catch (error) {
        if (
          attempt < maxRetries &&
          error instanceof AppError &&
          isRetryableError(error)
        ) {
          continue;
        }
        interceptHttpError(error);
      }
    }
    throw new AppError(ErrorCode.UNKNOWN_ERROR, 'Failed to execute HTTP request');
  } finally {
    if (shouldToggleGlobal) {
      stopGlobalLoading();
    }
  }
}

export function httpGet<T = unknown>(
  path: string,
  options: HttpRequestOptions<T> = {}
): Promise<T> {
  return http<T>(path, { ...options, method: 'GET' });
}

export function httpPost<T = unknown, TBody = unknown>(
  path: string,
  options: HttpRequestOptions<T, TBody> = {}
): Promise<T> {
  return http<T>(path, { ...options, method: 'POST' });
}

export function httpPut<T = unknown, TBody = unknown>(
  path: string,
  options: HttpRequestOptions<T, TBody> = {}
): Promise<T> {
  return http<T>(path, { ...options, method: 'PUT' });
}

export function httpDelete<T = unknown>(
  path: string,
  options: HttpRequestOptions<T> = {}
): Promise<T> {
  return http<T>(path, { ...options, method: 'DELETE' });
}
