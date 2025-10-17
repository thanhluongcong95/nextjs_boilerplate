/**
 * HTTP Interceptors Module
 *
 * Implements the interceptor pattern to handle requests/responses automatically:
 * - Automatically add authentication headers
 * - Handle token refresh on expiration
 * - Add default headers (Content-Type, Accept, etc.)
 * - Logging and monitoring
 * - Error handling
 */

import { AppError } from '@/shared/infra/errors/appError';
import { ErrorCode } from '@/shared/infra/errors/error-codes';
import { handleError } from '@/shared/infra/errors/error-handler';
import { trackPerformance } from '@/shared/infra/monitoring/logger';
import { getRouter } from '@/shared/providers/bridges/RouterBridge';

import { HTTP_CONFIG } from './http.config';
import type { HttpMeta } from './http.types';

// ================================================================================================
// Type Definitions - types for the interceptor system
// ================================================================================================

/** Function to get the current access token (usually from a memory store) */
type AccessTokenGetter = () => string | null;

/** Function to refresh the access token when it expires */
type RefreshTokenHandler = () => Promise<string | null>;

/** Function to handle when the user is unauthorized (redirect to login, etc.) */
type UnauthorizedHandler = () => void;

/** Function to get the user's current locale */
type LocaleResolver = () => string | null;

/** Function to generate a unique ID for each request */
type RequestIdGenerator = () => string;

/**
 * Union type for HTTP log events
 *
 * Each event type has a different structure based on its purpose:
 * - request: Log when a request starts
 * - response: Log when a successful response is received
 * - error: Log when an error occurs
 */
export type HttpLogEvent =
  | {
      type: 'request';
      method: string;
      url: string;
      correlationId?: string;
      attempt: number; // Attempt number (for retry logic)
    }
  | {
      type: 'response';
      method: string;
      url: string;
      status: number;
      correlationId?: string;
      durationMs: number; // Request processing time
    }
  | {
      type: 'error';
      method: string;
      url: string;
      correlationId?: string;
      error: unknown; // Error object or message
    };

/**
 * Configuration object for the interceptor system
 *
 * Allows injecting dependencies for interceptors to work:
 * - Token management functions
 * - Logging functions
 * - Error handling functions
 */
interface HttpInterceptorConfig {
  /** Function to get the current access token */
  getAccessToken?: AccessTokenGetter;

  /** Function to refresh the token when it expires */
  refreshAccessToken?: RefreshTokenHandler;

  /** Function to handle when the user is unauthorized */
  onUnauthorized?: UnauthorizedHandler;

  /** Function to get the current locale */
  getLocale?: LocaleResolver;

  /** Function to generate a correlation ID for the request */
  generateRequestId?: RequestIdGenerator;

  /** Function to log HTTP events */
  logger?: (event: HttpLogEvent) => void;
} // ================================================================================================
// Default Implementations - default implementations for interceptor functions
// ================================================================================================

/**
 * Default function to generate a unique request ID
 *
 * Prefer crypto.randomUUID() (if available), otherwise fall back to Math.random()
 *
 * @returns Unique string ID for the request
 */
const generateDefaultRequestId: RequestIdGenerator = (): string => {
  const browserCrypto = globalThis.crypto;

  // Use crypto.randomUUID if the browser supports it (modern browsers)
  if (browserCrypto && typeof browserCrypto.randomUUID === 'function') {
    return browserCrypto.randomUUID();
  }

  // Fallback: create a random string from Math.random
  return Math.random().toString(36).slice(2);
};

/**
 * Default configuration for the interceptor system
 *
 * Contains default implementations for all interceptor functions.
 * Can be overridden via configureHttpInterceptors()
 */
let interceptorConfig: Required<HttpInterceptorConfig> = {
  /** By default, no token (return null) */
  getAccessToken: () => null,

  /** By default, no refresh mechanism */
  refreshAccessToken: async () => null,

  /** By default, redirect to the signin page when unauthorized */
  onUnauthorized: () => {
    const router = getRouter();
    router?.replace('/auth/signin');
  },

  /** Use locale from config */
  getLocale: () => HTTP_CONFIG.defaultLocale,

  /** Use the default request ID generator */
  generateRequestId: generateDefaultRequestId,

  /** By default, no logging (no-op function) */
  logger: () => undefined,
};

// ================================================================================================
// Global State - state tracking the refresh token process
// ================================================================================================

/**
 * Promise to track the token refresh process
 *
 * Used to avoid multiple concurrent refresh calls:
 * - If a refresh is in progress -> wait for the existing promise
 * - If not refreshing yet -> create a new promise and cache it
 */
let currentRefreshPromise: Promise<string | null> | null = null;

// ================================================================================================
// Configuration Functions - functions to configure the interceptor system
// ================================================================================================

/**
 * Configure the interceptor system with custom implementations
 *
 * Allows overriding default behaviors with custom functions.
 * Merges with the existing config instead of replacing entirely.
 *
 * @param partialConfig - Partial config object with functions to override
 *
 * @example
 * ```typescript
 * configureHttpInterceptors({
 *   getAccessToken: () => localStorage.getItem('token'),
 *   logger: (event) => console.log('HTTP Event:', event)
 * });
 * ```
 */
export function configureHttpInterceptors(partialConfig: HttpInterceptorConfig): void {
  interceptorConfig = {
    ...interceptorConfig,
    ...partialConfig,
  };
}

/**
 * Convenience function to register an access token getter
 *
 * Shorthand for configureHttpInterceptors({ getAccessToken: getter })
 *
 * @param tokenGetter - Function to get the access token
 *
 * @example
 * ```typescript
 * registerTokenGetter(() => memoryStore.getToken());
 * ```
 */
export function registerTokenGetter(tokenGetter: AccessTokenGetter): void {
  configureHttpInterceptors({ getAccessToken: tokenGetter });
}

// ================================================================================================
// Token Resolution Functions - functions to resolve tokens and config
// ================================================================================================

/**
 * Resolve the access token from multiple sources in priority order
 *
 * Priority:
 * 1. Memory store (via the configured getter)
 * 2. SessionStorage (fallback for page refresh)
 *
 * @returns Access token string or null if not found
 */
export function resolveAccessToken(): string | null {
  // Step 1: Try to get the token from the memory store (fastest)
  const tokenFromMemory = interceptorConfig.getAccessToken();

  // Step 2: If there is a token in memory -> return immediately
  if (tokenFromMemory) {
    return tokenFromMemory;
  }

  // Step 3: Fallback - try to get it from sessionStorage (for page refresh)
  if (globalThis.window !== undefined) {
    try {
      const tokenFromStorage = globalThis.sessionStorage?.getItem('authToken') ?? null;
      return tokenFromStorage;
    } catch {
      // Ignore errors when accessing sessionStorage (SSR, private browsing, etc.)
      return null;
    }
  }

  // Step 4: No token found from any source
  return null;
}

/**
 * Resolve the user's current locale
 *
 * @returns Locale string (e.g., 'en-US', 'vi-VN')
 */
export function resolveLocale(): string {
  return interceptorConfig.getLocale() ?? HTTP_CONFIG.defaultLocale;
}

/**
 * Generate a correlation ID for request tracking
 *
 * @returns Unique string ID
 */
export function generateCorrelationId(): string {
  return interceptorConfig.generateRequestId();
}

/**
 * Log HTTP events and track performance metrics
 *
 * @param event - HTTP event to log
 */
export function logHttpEvent(event: HttpLogEvent): void {
  // Delegate to configured logger
  interceptorConfig.logger(event);

  // Track performance for response events
  if (event.type === 'response') {
    trackPerformance(`http:${event.method}:${event.url}`, event.durationMs);
  }
}

/**
 * Attempt to refresh access token
 *
 * Implements promise deduplication to avoid multiple concurrent refresh calls.
 *
 * @returns Promise that resolves to a new token or null if the refresh fails
 */
export async function attemptTokenRefresh(): Promise<string | null> {
  // Check whether a refresh function is configured
  if (!interceptorConfig.refreshAccessToken) {
    return null;
  }

  // Deduplication: if refresh is in progress -> wait for the existing promise
  currentRefreshPromise ??= interceptorConfig
    .refreshAccessToken()
    .then((newToken: string | null) => newToken)
    .finally(() => {
      currentRefreshPromise = null;
    });

  return currentRefreshPromise;
}

/**
 * Notify about the unauthorized state (usually redirect to login)
 */
export function notifyUnauthorized(): void {
  interceptorConfig.onUnauthorized();
}

function mergeSignals(meta: HttpMeta): AbortSignal | undefined {
  const hasTimeoutFn = typeof AbortSignal !== 'undefined' && typeof (AbortSignal as { timeout?: unknown }).timeout === 'function';
  const timeoutSignal =
    hasTimeoutFn && typeof meta.timeout === 'number'
      ? (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(meta.timeout)
      : undefined;
  const { signal } = meta;

  if (signal && timeoutSignal) {
    if (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal) {
      return AbortSignal.any([signal, timeoutSignal]);
    }
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort);
    timeoutSignal.addEventListener('abort', abort);
    return controller.signal;
  }

  return signal ?? timeoutSignal;
}

export async function applyRequestInterceptors(url: string, options: RequestInit, meta: HttpMeta): Promise<[string, RequestInit]> {
  const headers = new Headers(options.headers);
  const body = options.body;
  const hasFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const hasUrlSearchParams = typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;
  const hasBlob = typeof Blob !== 'undefined' && body instanceof Blob;

  if (!headers.has('Content-Type') && !hasFormData && !hasUrlSearchParams && !hasBlob) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (!headers.has('X-Client')) {
    headers.set('X-Client', HTTP_CONFIG.clientHeader);
  }

  if (!headers.has('Accept-Language')) {
    headers.set('Accept-Language', resolveLocale());
  }

  if (!meta.skipAuth) {
    const token = resolveAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (meta.correlationId && !headers.has('X-Request-Id')) {
    headers.set('X-Request-Id', meta.correlationId);
  }

  if (meta.withCredentials) {
    options.credentials = 'include';
  }

  const signal = mergeSignals(meta);

  return [url, { ...options, headers, signal }];
}

export async function applyResponseInterceptors(response: Response, _meta: HttpMeta, _attempt: number): Promise<Response> {
  if (response.status === 401) {
    throw new AppError(ErrorCode.UNAUTHORIZED, undefined, 401);
  }

  if (response.status === 403) {
    throw new AppError(ErrorCode.FORBIDDEN, undefined, 403);
  }

  if (response.status >= 500) {
    const appError = new AppError(ErrorCode.SERVER_ERROR, undefined, response.status);
    // Always surface server errors to caller; retry logic handled by caller
    throw appError;
  }

  return response;
}

export function interceptHttpError(error: unknown, meta?: HttpMeta): never {
  throw handleError(error, { meta });
}
