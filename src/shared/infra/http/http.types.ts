/**
 * HTTP Types Module
 *
 * Contains all type definitions for the HTTP infrastructure.
 * Defines interfaces and types to ensure type safety across the entire HTTP system.
 */

import type { ZodType } from 'zod';

// ================================================================================================
// HTTP Method Types - supported HTTP methods
// ================================================================================================

/**
 * HTTP methods supported by the HTTP client
 *
 * @example
 * ```typescript
 * const method: HttpMethod = 'GET';
 * const postMethod: HttpMethod = 'POST';
 * ```
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// ================================================================================================
// HTTP Parameters - parameters for the URL query string
// ================================================================================================

/**
 * Object containing query parameters for the URL
 *
 * Keys are parameter names; values can be string, number, boolean, or undefined.
 * Undefined values are skipped when building the URL.
 *
 * @example
 * ```typescript
 * const params: HttpParams = {
 *   page: 1,
 *   limit: 10,
 *   search: 'keyword',
 *   active: true,
 *   optional: undefined // will be skipped
 * };
 * ```
 */
export type HttpParams = Record<string, string | number | boolean | undefined>;

// ================================================================================================
// HTTP Metadata - additional configuration for the request
// ================================================================================================

/**
 * Metadata object containing additional configuration for an HTTP request
 *
 * Allows fine-tuning the behavior of specific requests
 */
export interface HttpMeta {
  /** Skip the authentication token when sending the request */
  skipAuth?: boolean;

  /** Skip auto-refreshing the token on 401 errors */
  skipAuthRefresh?: boolean;

  /** Show the global loading indicator */
  showGlobalLoading?: boolean;

  /** Show an error notification when the request fails */
  showErrorNotification?: boolean;

  /** Maximum number of retries for this request (overrides global config) */
  retry?: number;

  /** Delay between retries (milliseconds) */
  retryDelayMs?: number;

  /** Timeout for this request (milliseconds) */
  timeout?: number;

  /** Unique ID to track the request across logs */
  correlationId?: string;

  /** Send cookies with the request (for CORS) */
  withCredentials?: boolean;

  /** AbortSignal to cancel the request */
  signal?: AbortSignal;
}

// ================================================================================================
// HTTP Options - main configuration for an HTTP request
// ================================================================================================

/**
 * Main options object for an HTTP request
 *
 * @template TResponse - Type of the response data
 * @template TBody - Type of the request body
 *
 * @example
 * ```typescript
 * interface User { id: number; name: string; }
 * interface CreateUserRequest { name: string; email: string; }
 *
 * const options: HttpOptions<User, CreateUserRequest> = {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' },
 *   schema: userSchema,
 *   meta: { showGlobalLoading: true }
 * };
 * ```
 */
export interface HttpOptions<TResponse = unknown, TBody = unknown> {
  /** HTTP method (GET, POST, PUT, etc.) */
  method?: HttpMethod;

  /** Custom headers for the request */
  headers?: Record<string, string>;

  /** Request body data */
  body?: TBody;

  /** URL query parameters */
  params?: HttpParams;

  /** Additional request configuration */
  meta?: HttpMeta;

  /** Zod schema to validate the response data */
  schema?: ZodType<TResponse>;

  /** AbortSignal to cancel the request */
  signal?: AbortSignal;
}

// ================================================================================================
// HTTP Response - response structure
// ================================================================================================

/**
 * HTTP Response object structure
 *
 * @template TData - Type of the response data
 *
 * @example
 * ```typescript
 * const response: HttpResponse<User[]> = {
 *   data: [{ id: 1, name: 'John' }],
 *   status: 200,
 *   headers: new Headers()
 * };
 * ```
 */
export interface HttpResponse<TData = unknown> {
  /** Parsed response data */
  data: TData;

  /** HTTP status code */
  status: number;

  /** Response headers */
  headers: Headers;
}

// ================================================================================================
// Convenience Types - utility types for HTTP methods
// ================================================================================================

/**
 * Options for HTTP method functions (httpGet, httpPost, etc.)
 *
 * Same as HttpOptions but without the method field because the method is predetermined
 *
 * @template TResponse - Type of the response data
 * @template TBody - Type of the request body
 *
 * @example
 * ```typescript
 * // For httpGet
 * const getOptions: HttpRequestOptions<User[]> = {
 *   params: { page: 1 },
 *   schema: userArraySchema
 * };
 *
 * // For httpPost
 * const postOptions: HttpRequestOptions<User, CreateUserRequest> = {
 *   body: { name: 'John', email: 'john@example.com' },
 *   schema: userSchema
 * };
 * ```
 */
export type HttpRequestOptions<TResponse = unknown, TBody = unknown> = Omit<HttpOptions<TResponse, TBody>, 'method'>;
