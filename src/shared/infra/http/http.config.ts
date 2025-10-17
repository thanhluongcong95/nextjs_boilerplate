/**
 * HTTP Configuration Module
 *
 * Manages all default settings for the HTTP client.
 * Supports overrides via environment variables to easily configure different environments.
 */

// ================================================================================================
// Default Values - values used when no environment variables are provided
// ================================================================================================

/** Default timeout for each HTTP request (milliseconds) */
const DEFAULT_HTTP_TIMEOUT_MS = 10_000;

/** Default retry attempts when a request fails */
const DEFAULT_HTTP_RETRY_ATTEMPTS = 0;

/** Delay between retries (milliseconds) */
const DEFAULT_HTTP_RETRY_DELAY_MS = 500;

/** Default locale for the Accept-Language header */
const DEFAULT_HTTP_LOCALE = 'en-US';

// ================================================================================================
// Environment Variable Parsing - safely parse environment variables
// ================================================================================================

/**
 * Safely parse an environment variable to a number
 * @param envValue - Value from process.env
 * @param fallbackValue - Default value if parsing fails
 * @returns Parsed number or the fallback value
 */
const parseEnvironmentNumber = (envValue: string | undefined, fallbackValue: number): number => {
  if (!envValue) return fallbackValue;

  const parsedValue = Number.parseInt(envValue, 10);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
};

/** Timeout for HTTP requests from environment variable */
const httpTimeoutFromEnv: number = parseEnvironmentNumber(process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS, DEFAULT_HTTP_TIMEOUT_MS);

/** Retry attempts from environment variable */
const httpRetryAttemptsFromEnv: number = parseEnvironmentNumber(process.env.NEXT_PUBLIC_HTTP_RETRY, DEFAULT_HTTP_RETRY_ATTEMPTS);

/** Delay between retries from environment variable */
const httpRetryDelayFromEnv: number = parseEnvironmentNumber(process.env.NEXT_PUBLIC_HTTP_RETRY_DELAY_MS, DEFAULT_HTTP_RETRY_DELAY_MS);

// ================================================================================================
// Main Configuration Object - contains all HTTP configuration
// ================================================================================================

/**
 * HTTP Configuration Object
 *
 * Contains all settings for the HTTP client:
 * - Timeout settings
 * - Retry configuration
 * - Default headers
 * - Locale settings
 */
export const HTTP_CONFIG = {
  /** Timeout for each request (milliseconds) */
  defaultTimeoutMs: httpTimeoutFromEnv,

  /** Maximum retry attempts when a request fails */
  defaultRetryAttempts: httpRetryAttemptsFromEnv,

  /** Delay between retries (milliseconds) */
  defaultRetryDelayMs: httpRetryDelayFromEnv,

  /** Default locale for the Accept-Language header */
  defaultLocale: process.env.NEXT_PUBLIC_HTTP_LOCALE_FALLBACK ?? DEFAULT_HTTP_LOCALE,

  /** Value for X-Client header to identify client type */
  clientHeader: 'web' as const,
} as const;

/**
 * Type definition for the HTTP_CONFIG object
 *
 * Uses typeof to automatically generate a type from the object,
 * ensuring the type stays in sync with the implementation
 */
export type HttpConfig = typeof HTTP_CONFIG;
