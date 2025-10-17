/**
 * HTTP Client Module
 *
 * Main HTTP client with features:
 * - Automatic retry with exponential backoff
 * - Token refresh when unauthorized
 * - Global loading state management
 * - Request/response interceptors
 * - Type-safe response validation
 * - Error handling and logging
 */

import { AppError } from '@/shared/infra/errors/appError';
import { ErrorCode } from '@/shared/infra/errors/error-codes';
import { isRetryableError } from '@/shared/infra/errors/error-handler';
import { HTTP_CONFIG } from '@/shared/infra/http/http.config';
import {
  applyRequestInterceptors,
  applyResponseInterceptors,
  attemptTokenRefresh,
  generateCorrelationId,
  interceptHttpError,
  logHttpEvent,
  notifyUnauthorized,
} from '@/shared/infra/http/http.interceptors';
import type { HttpMeta, HttpOptions, HttpRequestOptions } from '@/shared/infra/http/http.types';
import { parseApiResponse } from '@/shared/infra/validation/schemas';
import { startGlobalLoading, stopGlobalLoading } from '@/shared/state/controllers/loading.controller';

// ================================================================================================
// Constants - constants and mappings
// ================================================================================================

/** Base URL for API calls - taken from environment variable */
const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/**
 * Mapping from HTTP status codes to application error codes
 *
 * Enables consistent error handling across the entire app
 */
const HTTP_STATUS_TO_ERROR_CODE: Record<number, ErrorCode> = {
  400: ErrorCode.BAD_REQUEST, // Bad Request
  401: ErrorCode.UNAUTHORIZED, // Unauthorized
  403: ErrorCode.FORBIDDEN, // Forbidden
  404: ErrorCode.NOT_FOUND, // Not Found
  408: ErrorCode.TIMEOUT_ERROR, // Request Timeout
  409: ErrorCode.BAD_REQUEST, // Conflict (treat as bad request)
  422: ErrorCode.VALIDATION_ERROR, // Unprocessable Entity
  429: ErrorCode.SERVICE_UNAVAILABLE, // Too Many Requests
};

// ================================================================================================
// Helper Functions - utility functions for HTTP operations
// ================================================================================================

/**
 * Resolve HTTP status code to an application error code
 *
 * @param httpStatusCode - HTTP status code from the response
 * @returns Corresponding application error code
 */
function resolveApplicationErrorCode(httpStatusCode: number): ErrorCode {
  // 5xx errors -> server error
  if (httpStatusCode >= 500) {
    return ErrorCode.SERVER_ERROR;
  }

  // Other codes -> lookup in the mapping table
  return HTTP_STATUS_TO_ERROR_CODE[httpStatusCode] ?? ErrorCode.UNKNOWN_ERROR;
}

/**
 * Extract error details from the HTTP response
 *
 * Attempts to parse the response body as JSON, falling back to text.
 * Safe operation - does not throw if parsing fails.
 *
 * @param httpResponse - Response object from fetch()
 * @returns Parsed error details or undefined if parsing fails
 */
async function extractHttpErrorDetails(httpResponse: Response): Promise<unknown> {
  // Clone the response to avoid consuming the stream
  const responseClone = httpResponse.clone();
  const responseContentType = responseClone.headers.get('content-type') ?? '';

  try {
    // Prefer JSON parsing if the content-type indicates JSON
    if (responseContentType.includes('application/json')) {
      return await responseClone.json();
    }

    // Fallback to text parsing
    return await responseClone.text();
  } catch {
    // Safe fallback - return undefined if parsing fails
    return undefined;
  }
}

// ================================================================================================
// URL Building Functions - building URLs with parameters
// ================================================================================================

/**
 * Helper function to append query parameters to the URL
 *
 * Skips undefined/null values to avoid ?key=undefined in the URL
 *
 * @param targetUrl - URL object to append parameters to
 * @param queryParams - Object containing key-value parameters
 */
function appendQueryParameters(targetUrl: URL, queryParams: Record<string, string | number | boolean | undefined>): void {
  for (const [paramKey, paramValue] of Object.entries(queryParams)) {
    // Skip undefined/null values
    if (paramValue === undefined || paramValue === null) continue;

    // Convert to string and add to the URL
    targetUrl.searchParams.set(paramKey, String(paramValue));
  }
}

/**
 * Build a complete URL with optional query parameters
 *
 * Handles both client-side (browser) and server-side (SSR) contexts:
 * - Client-side: use relative URLs to leverage Next.js rewrites
 * - Server-side: use absolute URLs with API_BASE_URL
 *
 * @param requestPath - API endpoint path (e.g., '/api/users')
 * @param queryParams - Optional query parameters
 * @returns Complete URL string ready for fetch()
 */
function buildRequestUrl(requestPath: string, queryParams?: Record<string, string | number | boolean | undefined>): string {
  // Normalize path - ensure it starts with '/'
  const normalizedPath = requestPath.startsWith('/') ? requestPath : `/${requestPath}`;

  // CLIENT-SIDE: use a relative URL to leverage Next.js rewrites
  if (globalThis.window !== undefined) {
    const clientUrl = new URL(normalizedPath, globalThis.window.location.origin);
    if (queryParams) appendQueryParameters(clientUrl, queryParams);
    return clientUrl.toString();
  }

  // SERVER-SIDE: use an absolute URL with the API base
  const apiBaseUrl = API_BASE_URL || 'http://localhost:3000';
  const normalizedBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const serverUrl = new URL(normalizedPath, normalizedBaseUrl);
  if (queryParams) appendQueryParameters(serverUrl, queryParams);
  return serverUrl.toString();
}

// ================================================================================================
// Body Serialization Functions - handling the request body
// ================================================================================================

/**
 * Type guard to check whether a value is a valid BodyInit
 *
 * BodyInit is the union of types that can be passed as a fetch() body:
 * string | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream
 *
 * @param value - Value to check
 * @returns True if the value is a valid BodyInit type
 */
function isValidBodyInitType(value: unknown): value is BodyInit {
  // Null/undefined check
  if (value == null) return false;

  // Primitive types
  if (typeof value === 'string') return true;

  // Browser-specific types (check existence before using instanceof)
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  if (typeof FormData !== 'undefined' && value instanceof FormData) return true;
  if (typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams) return true;
  if (typeof ReadableStream !== 'undefined' && value instanceof ReadableStream) return true;

  // ArrayBuffer types
  if (value instanceof ArrayBuffer) return true;
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' && ArrayBuffer.isView(value)) {
    return true;
  }

  return false;
}

/**
 * Serialize the request body into a format suitable for fetch()
 *
 * Handles different input types:
 * - Already valid BodyInit -> pass through
 * - Objects/primitives -> JSON.stringify
 * - null/undefined -> undefined
 *
 * @param requestBody - Body data to serialize
 * @returns Serialized BodyInit or undefined
 */
function serializeRequestBody(requestBody: unknown): BodyInit | undefined {
  // Early return for null/undefined
  if (requestBody === undefined || requestBody === null) {
    return undefined;
  }

  // If it's already a valid BodyInit -> pass through
  if (isValidBodyInitType(requestBody)) {
    return requestBody;
  }

  // Serialize objects, booleans, and numbers to JSON
  if (typeof requestBody === 'object' || typeof requestBody === 'boolean' || typeof requestBody === 'number') {
    return JSON.stringify(requestBody);
  }

  // Fallback: serialize everything else as JSON
  return JSON.stringify(requestBody);
}

// ================================================================================================
// Timestamp Utilities - Performance timing functions
// ================================================================================================

/**
 * Get a high-precision timestamp for performance tracking
 *
 * Prefers performance.now() (if available) because it has higher precision
 * and isn't affected by system clock adjustments.
 *
 * @returns Timestamp in milliseconds
 */
function getCurrentTimestamp(): number {
  const browserPerformance = globalThis.performance;

  // Prefer performance.now() for higher precision
  if (browserPerformance && typeof browserPerformance.now === 'function') {
    return browserPerformance.now();
  }

  // Fallback to Date.now()
  return Date.now();
}

async function executeRequest<T>(
  url: string,
  requestInit: RequestInit,
  effectiveMeta: HttpMeta,
  attempt: number,
  method: string,
  schema: unknown
): Promise<T> {
  const attemptStartedAt = getCurrentTimestamp();
  const computeDuration = () => getCurrentTimestamp() - attemptStartedAt;

  const [finalUrl, finalOptions] = await applyRequestInterceptors(url, requestInit, effectiveMeta);

  logHttpEvent({
    type: 'request',
    method,
    url: finalUrl,
    correlationId: effectiveMeta.correlationId,
    attempt,
  });

  const response = await fetch(finalUrl, finalOptions);
  const handledResponse = await applyResponseInterceptors(response, effectiveMeta, attempt);

  if (!handledResponse.ok) {
    const httpStatusCode = handledResponse.status;
    const errorDetails = await extractHttpErrorDetails(handledResponse);
    throw new AppError(resolveApplicationErrorCode(httpStatusCode), undefined, httpStatusCode, errorDetails);
  }

  if (handledResponse.status === 204) {
    logHttpEvent({
      type: 'response',
      method,
      url: finalUrl,
      status: handledResponse.status,
      correlationId: effectiveMeta.correlationId,
      durationMs: computeDuration(),
    });
    return void 0 as T;
  }

  const data = await handledResponse.json();

  if (schema) {
    const parsed = parseApiResponse(schema as never, data);
    logHttpEvent({
      type: 'response',
      method,
      url: finalUrl,
      status: handledResponse.status,
      correlationId: effectiveMeta.correlationId,
      durationMs: computeDuration(),
    });
    return parsed as T;
  }

  logHttpEvent({
    type: 'response',
    method,
    url: finalUrl,
    status: handledResponse.status,
    correlationId: effectiveMeta.correlationId,
    durationMs: computeDuration(),
  });

  return data as T;
}

async function handleTokenRefresh(error: unknown, effectiveMeta: HttpMeta, hasRefreshedToken: boolean): Promise<boolean> {
  if (!(error instanceof AppError) || error.code !== ErrorCode.UNAUTHORIZED || effectiveMeta.skipAuthRefresh) {
    return hasRefreshedToken;
  }

  if (!hasRefreshedToken) {
    try {
      const refreshedToken = await attemptTokenRefresh();
      if (refreshedToken) return true;
    } catch {
      // Fall through to unauthorized handling
    }
  }

  notifyUnauthorized();
  return hasRefreshedToken;
}

/**
 * Handle retry logic with exponential backoff + jitter
 *
 * @param error - Error from the previous attempt
 * @param currentAttempt - Attempt number (0-based)
 * @param maxRetryAttempts - Maximum number of retries allowed
 * @param requestMeta - Request metadata containing retry config
 * @returns True if it should retry, false otherwise
 */
async function handleRetryLogic(error: unknown, currentAttempt: number, maxRetryAttempts: number, requestMeta: HttpMeta): Promise<boolean> {
  // Check conditions to decide whether to retry
  const isRetryableErr = error instanceof AppError && isRetryableError(error);
  const hasRetriesLeft = currentAttempt < maxRetryAttempts;

  if (!isRetryableErr || !hasRetriesLeft) {
    return false;
  }

  // Calculate backoff delay with exponential backoff + jitter
  const baseDelayMs = requestMeta.retryDelayMs ?? HTTP_CONFIG.defaultRetryDelayMs;
  const exponentialBackoff = baseDelayMs * Math.pow(2, currentAttempt);
  const jitterMs = Math.random() * 100; // Random jitter to avoid thundering herd
  const totalDelayMs = exponentialBackoff + jitterMs;

  // Wait before retry
  await new Promise<void>(resolve => setTimeout(resolve, totalDelayMs));
  return true;
}

// ================================================================================================
// Main HTTP Function - Core HTTP client implementation
// ================================================================================================

/**
 * Main HTTP client function with comprehensive features
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Token refresh when unauthorized
 * - Request/response interceptors
 * - Type-safe response validation with Zod
 * - Global loading state management
 * - Comprehensive error handling and logging
 *
 * @template T - Expected response type
 * @param requestPath - API endpoint path
 * @param requestOptions - HTTP request configuration
 * @returns Promise that resolves to typed response data
 *
 * @example
 * ```typescript
 * // Simple GET request
 * const users = await http<User[]>('/api/users');
 *
 * // POST with body and validation
 * const newUser = await http<User, CreateUserRequest>('/api/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' },
 *   schema: userSchema,
 *   meta: { showGlobalLoading: true }
 * });
 * ```
 */
export async function http<T = unknown>(requestPath: string, requestOptions: HttpOptions<T> = {}): Promise<T> {
  // Step 1: Destructure and set up default values
  const { method = 'GET', params, body, schema, meta: providedMeta = {} } = requestOptions;

  // Step 2: Setup effective metadata with defaults from config
  const effectiveMeta: HttpMeta = {
    ...providedMeta,
  };

  // Apply default values from HTTP_CONFIG if not specified
  effectiveMeta.retry ??= HTTP_CONFIG.defaultRetryAttempts;
  effectiveMeta.retryDelayMs ??= HTTP_CONFIG.defaultRetryDelayMs;
  effectiveMeta.timeout ??= HTTP_CONFIG.defaultTimeoutMs;
  effectiveMeta.correlationId ??= generateCorrelationId();
  effectiveMeta.skipAuthRefresh ??= false;
  effectiveMeta.showErrorNotification ??= true;

  // Step 3: Build complete request URL with query params
  const requestUrl = buildRequestUrl(requestPath, params);

  // Step 4: Setup retry and loading state management
  const maxRetryAttempts = effectiveMeta.retry ?? 0;
  const shouldShowGlobalLoading = effectiveMeta.showGlobalLoading ?? true;

  if (shouldShowGlobalLoading) {
    startGlobalLoading();
  }

  // Step 5: Initialize attempt tracking
  let currentAttempt = 0;
  let hasAlreadyRefreshedToken = false;

  try {
    while (currentAttempt <= maxRetryAttempts) {
      const requestInit: RequestInit = {
        method,
        headers: requestOptions.headers,
        body: serializeRequestBody(body),
      };
      if (requestOptions.signal) {
        requestInit.signal = requestOptions.signal;
      }

      try {
        return await executeRequest<T>(requestUrl, requestInit, effectiveMeta, currentAttempt, method, schema);
      } catch (error) {
        hasAlreadyRefreshedToken = await handleTokenRefresh(error, effectiveMeta, hasAlreadyRefreshedToken);
        if (hasAlreadyRefreshedToken) {
          continue;
        }

        const shouldRetry = await handleRetryLogic(error, currentAttempt, maxRetryAttempts, effectiveMeta);
        if (shouldRetry) {
          currentAttempt += 1;
          continue;
        }

        logHttpEvent({
          type: 'error',
          method,
          url: requestUrl,
          correlationId: effectiveMeta.correlationId,
          error,
        });
        interceptHttpError(error, effectiveMeta);
      }
    }
    throw new AppError(ErrorCode.UNKNOWN_ERROR, 'Failed to execute HTTP request');
  } finally {
    if (shouldShowGlobalLoading) {
      stopGlobalLoading();
    }
  }
}

// ================================================================================================
// HTTP Method Factory - Eliminating code duplication with a factory pattern
// ================================================================================================

/**
 * Factory function to create HTTP method functions
 *
 * Eliminates code duplication by generating all HTTP methods from one template.
 * Each method has the same behavior, differing only by method name and default auth setting.
 *
 * @param httpMethod - HTTP method string ('GET', 'POST', etc.)
 * @param isPublicByDefault - True if this method skips auth by default
 * @returns Function with the same signature as http() but without specifying the method
 */
const createHttpMethodFunction =
  (httpMethod: string, isPublicByDefault: boolean) =>
  <TResponse = unknown, TRequestBody = unknown>(
    apiPath: string,
    requestOptions: HttpRequestOptions<TResponse, TRequestBody> = {}
  ): Promise<TResponse> => {
    // Merge request metadata with the default auth setting
    const requestMeta = {
      ...requestOptions.meta,
      skipAuth: requestOptions.meta?.skipAuth ?? isPublicByDefault,
    };

    // Call main http function with the specified method
    return http<TResponse>(apiPath, {
      ...requestOptions,
      method: httpMethod,
      meta: requestMeta,
    } as HttpOptions<TResponse, TRequestBody>);
  };

// ================================================================================================
// Authenticated HTTP Methods - Require authentication by default
// ================================================================================================

/**
 * GET request with authentication
 *
 * @example
 * ```typescript
 * const users = await httpGet<User[]>('/api/users', {
 *   params: { page: 1, limit: 10 },
 *   schema: userArraySchema
 * });
 * ```
 */
export const httpGet = createHttpMethodFunction('GET', false);

/**
 * POST request with authentication
 *
 * @example
 * ```typescript
 * const newUser = await httpPost<User, CreateUserDto>('/api/users', {
 *   body: { name: 'John', email: 'john@example.com' },
 *   schema: userSchema
 * });
 * ```
 */
export const httpPost = createHttpMethodFunction('POST', false);

/**
 * PUT request with authentication
 */
export const httpPut = createHttpMethodFunction('PUT', false);

/**
 * DELETE request with authentication
 */
export const httpDelete = createHttpMethodFunction('DELETE', false);

// ================================================================================================
// Public HTTP Methods - No authentication required
// ================================================================================================

/**
 * Public GET request (no authentication)
 *
 * @example
 * ```typescript
 * const publicData = await httpGetPublic<PublicData>('/api/public/info');
 * ```
 */
export const httpGetPublic = createHttpMethodFunction('GET', true);

/**
 * Public POST request (no authentication) - for login, register, etc.
 */
export const httpPostPublic = createHttpMethodFunction('POST', true);

/**
 * Public PUT request (no authentication)
 */
export const httpPutPublic = createHttpMethodFunction('PUT', true);

/**
 * Public DELETE request (no authentication)
 */
export const httpDeletePublic = createHttpMethodFunction('DELETE', true);
