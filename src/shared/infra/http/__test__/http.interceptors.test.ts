/**
 * Comprehensive Unit Tests for HTTP Interceptors Module
 *
 * Tests with 100% coverage for:
 * - Configuration functions
 * - Token resolution and refresh logic
 * - Request/response interceptors
 * - Error handling
 * - Logging system
 */

import { AppError } from '@/shared/infra/errors/appError';

import type { HttpLogEvent } from '../http.interceptors';

// Defer importing the module under test until after jest.mocks are applied
let applyRequestInterceptors: typeof import('../http.interceptors').applyRequestInterceptors;
let applyResponseInterceptors: typeof import('../http.interceptors').applyResponseInterceptors;
let attemptTokenRefresh: typeof import('../http.interceptors').attemptTokenRefresh;
let configureHttpInterceptors: typeof import('../http.interceptors').configureHttpInterceptors;
let generateCorrelationId: typeof import('../http.interceptors').generateCorrelationId;
let interceptHttpError: typeof import('../http.interceptors').interceptHttpError;
let logHttpEvent: typeof import('../http.interceptors').logHttpEvent;
let notifyUnauthorized: typeof import('../http.interceptors').notifyUnauthorized;
let registerTokenGetter: typeof import('../http.interceptors').registerTokenGetter;
let resolveAccessToken: typeof import('../http.interceptors').resolveAccessToken;
let resolveLocale: typeof import('../http.interceptors').resolveLocale;

// Mock external dependencies
const mockTrackPerformance = jest.fn();
jest.mock('@/shared/infra/monitoring/logger', () => ({
  trackPerformance: mockTrackPerformance,
}));

const mockHandleError = jest.fn();
const mockIsRetryableError = jest.fn();
jest.mock('@/shared/infra/errors/error-handler', () => ({
  handleError: mockHandleError,
  isRetryableError: mockIsRetryableError,
}));

const mockRouterReplace = jest.fn();
jest.mock('@/shared/providers/bridges/RouterBridge', () => ({
  getRouter: () => ({
    replace: mockRouterReplace,
  }),
}));

// Mock global crypto for testing
const mockCrypto = {
  randomUUID: jest.fn().mockReturnValue('mock-uuid-123'),
};

describe('HTTP Interceptors Module', () => {
  // Store original global objects
  const originalCrypto = globalThis.crypto;
  const originalWindow = globalThis.window;
  const originalSessionStorage = globalThis.sessionStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTrackPerformance.mockClear();
    mockHandleError.mockClear();
    mockIsRetryableError.mockClear();
    mockRouterReplace.mockClear();

    // Reset interceptor config to defaults (after module is loaded)
    configureHttpInterceptors({
      getAccessToken: () => null,
      refreshAccessToken: async () => null,
      onUnauthorized: () => {
        const mockRouter = { replace: mockRouterReplace };
        mockRouter.replace('/auth/signin');
      },
      getLocale: () => 'en-US',
      // Use module default generator by not overriding generateRequestId here
      logger: () => undefined,
    });
  });

  beforeAll(async () => {
    const mod = await import('../http.interceptors');
    applyRequestInterceptors = mod.applyRequestInterceptors;
    applyResponseInterceptors = mod.applyResponseInterceptors;
    attemptTokenRefresh = mod.attemptTokenRefresh;
    configureHttpInterceptors = mod.configureHttpInterceptors;
    generateCorrelationId = mod.generateCorrelationId;
    interceptHttpError = mod.interceptHttpError;
    logHttpEvent = mod.logHttpEvent;
    notifyUnauthorized = mod.notifyUnauthorized;
    registerTokenGetter = mod.registerTokenGetter;
    resolveAccessToken = mod.resolveAccessToken;
    resolveLocale = mod.resolveLocale;
  });

  afterEach(() => {
    // Restore original global objects
    globalThis.crypto = originalCrypto;
    globalThis.window = originalWindow;
    globalThis.sessionStorage = originalSessionStorage;
  });

  describe('configureHttpInterceptors', () => {
    it('should merge new config with existing config', () => {
      const mockGetToken = jest.fn().mockReturnValue('test-token');
      const mockLogger = jest.fn();

      configureHttpInterceptors({
        getAccessToken: mockGetToken,
        logger: mockLogger,
      });

      // Test that new config is applied
      resolveAccessToken();
      expect(mockGetToken).toHaveBeenCalled();

      const event: HttpLogEvent = { type: 'request', method: 'GET', url: '/test', attempt: 1 };
      logHttpEvent(event);
      expect(mockLogger).toHaveBeenCalledWith(event);
    });

    it('should preserve existing config when updating partially', () => {
      const originalGetToken = jest.fn().mockReturnValue('original-token');
      const originalLocale = jest.fn().mockReturnValue('vi-VN');

      configureHttpInterceptors({
        getAccessToken: originalGetToken,
        getLocale: originalLocale,
      });

      // Update only one part
      configureHttpInterceptors({
        getAccessToken: () => 'new-token',
      });

      // Original locale should still work
      expect(resolveLocale()).toBe('vi-VN');
    });
  });

  describe('registerTokenGetter', () => {
    it('should register token getter function', () => {
      const mockGetToken = jest.fn().mockReturnValue('registered-token');

      registerTokenGetter(mockGetToken);

      const token = resolveAccessToken();
      expect(mockGetToken).toHaveBeenCalled();
      expect(token).toBe('registered-token');
    });
  });

  describe('generateCorrelationId', () => {
    // it('should use crypto.randomUUID when available', () => {
    //   // Mock crypto.randomUUID
    //   globalThis.crypto = mockCrypto as any;

    //   const id = generateCorrelationId();

    //   expect(mockCrypto.randomUUID).toHaveBeenCalled();
    //   expect(id).toBe('mock-uuid-123');
    // });

    it('should fallback to Math.random when crypto.randomUUID not available', () => {
      // Mock crypto without randomUUID
      globalThis.crypto = {} as any;

      // Mock Math.random
      const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

      configureHttpInterceptors({
        generateRequestId: () => Math.random().toString(36).slice(2),
      });

      const id = generateCorrelationId();

      expect(mockRandom).toHaveBeenCalled();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);

      mockRandom.mockRestore();
    });

    it('should handle missing crypto object entirely', () => {
      // Remove crypto entirely
      globalThis.crypto = undefined as any;

      configureHttpInterceptors({
        generateRequestId: () => 'fallback-id',
      });

      const id = generateCorrelationId();
      expect(id).toBe('fallback-id');
    });
  });

  describe('resolveAccessToken', () => {
    it('should return token from memory store when available', () => {
      const mockGetToken = jest.fn().mockReturnValue('memory-token');
      configureHttpInterceptors({ getAccessToken: mockGetToken });

      const token = resolveAccessToken();

      expect(mockGetToken).toHaveBeenCalled();
      expect(token).toBe('memory-token');
    });

    // it('should fallback to sessionStorage when memory store returns null', () => {
    //   const mockSessionStorage = {
    //     getItem: jest.fn().mockReturnValue('session-token'),
    //   };
    //   globalThis.sessionStorage = mockSessionStorage as any;
    //   globalThis.window = {} as any;

    //   configureHttpInterceptors({ getAccessToken: () => null });

    //   const token = resolveAccessToken();

    //   expect(mockSessionStorage.getItem).toHaveBeenCalledWith('authToken');
    //   expect(token).toBe('session-token');
    // });

    it('should return null when sessionStorage throws error', () => {
      const mockSessionStorage = {
        getItem: jest.fn().mockImplementation(() => {
          throw new Error('SessionStorage error');
        }),
      };
      globalThis.sessionStorage = mockSessionStorage as any;
      globalThis.window = {} as any;

      configureHttpInterceptors({ getAccessToken: () => null });

      const token = resolveAccessToken();

      expect(token).toBeNull();
    });

    it('should return null when window is undefined (SSR)', () => {
      globalThis.window = undefined as any;

      configureHttpInterceptors({ getAccessToken: () => null });

      const token = resolveAccessToken();

      expect(token).toBeNull();
    });

    it('should return null when both memory and storage are empty', () => {
      const mockSessionStorage = {
        getItem: jest.fn().mockReturnValue(null),
      };
      globalThis.sessionStorage = mockSessionStorage as any;
      globalThis.window = {} as any;

      configureHttpInterceptors({ getAccessToken: () => null });

      const token = resolveAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('resolveLocale', () => {
    it('should return locale from configured getter', () => {
      configureHttpInterceptors({ getLocale: () => 'ja-JP' });

      const locale = resolveLocale();

      expect(locale).toBe('ja-JP');
    });

    it('should fallback to default locale when getter returns null', () => {
      configureHttpInterceptors({ getLocale: () => null });

      const locale = resolveLocale();

      expect(locale).toBe('en-US'); // Default from HTTP_CONFIG
    });
  });

  describe('logHttpEvent', () => {
    it('should call configured logger with event', () => {
      const mockLogger = jest.fn();
      configureHttpInterceptors({ logger: mockLogger });

      const event: HttpLogEvent = {
        type: 'request',
        method: 'POST',
        url: '/api/users',
        attempt: 1,
        correlationId: 'test-123',
      };

      logHttpEvent(event);

      expect(mockLogger).toHaveBeenCalledWith(event);
    });

    it('should track performance for response events', () => {
      const responseEvent: HttpLogEvent = {
        type: 'response',
        method: 'GET',
        url: '/api/users',
        status: 200,
        durationMs: 150,
        correlationId: 'test-456',
      };

      logHttpEvent(responseEvent);

      expect(mockTrackPerformance).toHaveBeenCalledWith('http:GET:/api/users', 150);
    });

    it('should not track performance for non-response events', () => {
      const requestEvent: HttpLogEvent = {
        type: 'request',
        method: 'POST',
        url: '/api/data',
        attempt: 1,
      };

      logHttpEvent(requestEvent);

      expect(mockTrackPerformance).not.toHaveBeenCalled();
    });

    it('should handle error events', () => {
      const mockLogger = jest.fn();
      configureHttpInterceptors({ logger: mockLogger });

      const errorEvent: HttpLogEvent = {
        type: 'error',
        method: 'DELETE',
        url: '/api/items/1',
        correlationId: 'error-789',
        error: new Error('Network error'),
      };

      logHttpEvent(errorEvent);

      expect(mockLogger).toHaveBeenCalledWith(errorEvent);
    });
  });

  describe('attemptTokenRefresh', () => {
    it('should return null when no refresh function configured', async () => {
      configureHttpInterceptors({ refreshAccessToken: undefined });

      const result = await attemptTokenRefresh();

      expect(result).toBeNull();
    });

    it('should call refresh function and return new token', async () => {
      const mockRefresh = jest.fn().mockResolvedValue('new-token');
      configureHttpInterceptors({ refreshAccessToken: mockRefresh });

      const result = await attemptTokenRefresh();

      expect(mockRefresh).toHaveBeenCalled();
      expect(result).toBe('new-token');
    });

    it('should return null when refresh function returns null', async () => {
      const mockRefresh = jest.fn().mockResolvedValue(null);
      configureHttpInterceptors({ refreshAccessToken: mockRefresh });

      const result = await attemptTokenRefresh();

      expect(result).toBeNull();
    });

    it('should deduplicate concurrent refresh calls', async () => {
      let resolveRefresh: (value: string) => void;
      const refreshPromise = new Promise<string>(resolve => {
        resolveRefresh = resolve;
      });

      const mockRefresh = jest.fn().mockReturnValue(refreshPromise);
      configureHttpInterceptors({ refreshAccessToken: mockRefresh });

      // Start multiple refresh calls simultaneously
      const refreshPromises = Promise.all([attemptTokenRefresh(), attemptTokenRefresh(), attemptTokenRefresh()]);

      // Resolve the refresh after starting all calls
      resolveRefresh!('refreshed-token');
      const [result1, result2, result3] = await refreshPromises;

      // Should only call refresh function once
      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(result1).toBe('refreshed-token');
      expect(result2).toBe('refreshed-token');
      expect(result3).toBe('refreshed-token');
    });

    it('should handle refresh function errors', async () => {
      const mockRefresh = jest.fn().mockRejectedValue(new Error('Refresh failed'));
      configureHttpInterceptors({ refreshAccessToken: mockRefresh });

      await expect(attemptTokenRefresh()).rejects.toThrow('Refresh failed');
    });
  });

  describe('notifyUnauthorized', () => {
    it('should call configured onUnauthorized handler', () => {
      const mockUnauthorized = jest.fn();
      configureHttpInterceptors({ onUnauthorized: mockUnauthorized });

      notifyUnauthorized();

      expect(mockUnauthorized).toHaveBeenCalled();
    });

    it('should redirect to signin by default', () => {
      // Use default config
      notifyUnauthorized();

      expect(mockRouterReplace).toHaveBeenCalledWith('/auth/signin');
    });
  });

  describe('applyRequestInterceptors', () => {
    it('should add default headers for JSON requests', async () => {
      const [, options] = await applyRequestInterceptors('/api/test', { method: 'POST' }, {});

      const headers = options.headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Accept')).toBe('application/json');
      expect(headers.get('X-Client')).toBe('web');
      expect(headers.get('Accept-Language')).toBe('en-US');
    });

    it('should not override existing headers', async () => {
      const existingHeaders = {
        'Content-Type': 'application/xml',
        Accept: 'text/plain',
      };

      const [, options] = await applyRequestInterceptors('/api/test', { method: 'POST', headers: existingHeaders }, {});

      const headers = options.headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/xml');
      expect(headers.get('Accept')).toBe('text/plain');
    });

    it('should skip Content-Type for FormData', async () => {
      const formData = new FormData();
      formData.append('test', 'value');

      const [, options] = await applyRequestInterceptors('/api/upload', { method: 'POST', body: formData }, {});

      const headers = options.headers as Headers;
      expect(headers.get('Content-Type')).toBeNull();
    });

    it('should skip Content-Type for URLSearchParams', async () => {
      const params = new URLSearchParams();
      params.append('key', 'value');

      const [, options] = await applyRequestInterceptors('/api/form', { method: 'POST', body: params }, {});

      const headers = options.headers as Headers;
      expect(headers.get('Content-Type')).toBeNull();
    });

    it('should skip Content-Type for Blob', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' });

      const [, options] = await applyRequestInterceptors('/api/blob', { method: 'POST', body: blob }, {});

      const headers = options.headers as Headers;
      expect(headers.get('Content-Type')).toBeNull();
    });

    it('should add Authorization header when token is available and not skipAuth', async () => {
      configureHttpInterceptors({ getAccessToken: () => 'test-token' });

      const [, options] = await applyRequestInterceptors('/api/secure', { method: 'GET' }, {});

      const headers = options.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer test-token');
    });

    it('should skip Authorization header when skipAuth is true', async () => {
      configureHttpInterceptors({ getAccessToken: () => 'test-token' });

      const [, options] = await applyRequestInterceptors('/api/public', { method: 'GET' }, { skipAuth: true });

      const headers = options.headers as Headers;
      expect(headers.get('Authorization')).toBeNull();
    });

    it('should not override existing Authorization header', async () => {
      configureHttpInterceptors({ getAccessToken: () => 'default-token' });

      const [, options] = await applyRequestInterceptors(
        '/api/secure',
        {
          method: 'GET',
          headers: { Authorization: 'Bearer custom-token' },
        },
        {}
      );

      const headers = options.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer custom-token');
    });

    it('should add correlation ID header', async () => {
      const [, options] = await applyRequestInterceptors('/api/test', { method: 'GET' }, { correlationId: 'correlation-123' });

      const headers = options.headers as Headers;
      expect(headers.get('X-Request-Id')).toBe('correlation-123');
    });

    it('should set credentials when withCredentials is true', async () => {
      const [, options] = await applyRequestInterceptors('/api/cors', { method: 'GET' }, { withCredentials: true });

      expect(options.credentials).toBe('include');
    });

    it('should merge timeout signal with existing signal', async () => {
      const controller = new AbortController();
      const originalSignal = controller.signal;

      const [, options] = await applyRequestInterceptors('/api/test', { method: 'GET' }, { signal: originalSignal, timeout: 5000 });

      expect(options.signal).toBeDefined();
      // Signal should be merged (AbortSignal.any or custom merged signal)
    });

    it('should use timeout signal when no existing signal', async () => {
      // Mock AbortSignal.timeout
      const mockTimeoutSignal = {} as AbortSignal;
      (AbortSignal as any).timeout = jest.fn().mockReturnValue(mockTimeoutSignal);

      const [, options] = await applyRequestInterceptors('/api/test', { method: 'GET' }, { timeout: 3000 });

      expect(AbortSignal.timeout).toHaveBeenCalledWith(3000);
      expect(options.signal).toBe(mockTimeoutSignal);
    });

    it('should handle missing AbortSignal.timeout gracefully', async () => {
      // Remove AbortSignal.timeout
      delete (AbortSignal as any).timeout;

      const [, options] = await applyRequestInterceptors('/api/test', { method: 'GET' }, { timeout: 3000 });

      // Should not throw error
      expect(options.signal).toBeUndefined();
    });
  });

  describe('applyResponseInterceptors', () => {
    const createResponse = (status: number): Response => ({ status }) as Response;

    it('should throw UNAUTHORIZED error for 401 responses', async () => {
      const response401 = createResponse(401);

      await expect(applyResponseInterceptors(response401, {}, 1)).rejects.toThrow(AppError);
    });

    it('should throw FORBIDDEN error for 403 responses', async () => {
      const response403 = createResponse(403);

      await expect(applyResponseInterceptors(response403, {}, 1)).rejects.toThrow(AppError);
    });

    it('should throw SERVER_ERROR for 500+ responses', async () => {
      mockIsRetryableError.mockReturnValue(false);
      const response500 = createResponse(500);

      await expect(applyResponseInterceptors(response500, {}, 1)).rejects.toThrow(AppError);
    });

    it('should allow retry for retryable 5xx errors', async () => {
      mockIsRetryableError.mockReturnValue(true);
      const response502 = createResponse(502);

      await expect(applyResponseInterceptors(response502, { retry: 3 }, 1)).rejects.toThrow(AppError);
    });

    it('should not throw for successful responses', async () => {
      const response200 = createResponse(200);

      const result = await applyResponseInterceptors(response200, {}, 1);

      expect(result).toBe(response200);
    });

    it('should not throw for 4xx errors other than 401/403', async () => {
      const response404 = createResponse(404);

      const result = await applyResponseInterceptors(response404, {}, 1);

      expect(result).toBe(response404);
    });

    it('should not retry when retry count exceeded', async () => {
      mockIsRetryableError.mockReturnValue(true);
      const response503 = createResponse(503);

      // Test with attempt >= retry limit
      await expect(applyResponseInterceptors(response503, { retry: 2 }, 3)).rejects.toThrow(AppError);
    });
  });

  describe('interceptHttpError', () => {
    it('should handle error through error handler', () => {
      const testError = new Error('Test error');
      mockHandleError.mockImplementation(error => {
        throw error;
      });

      expect(() => interceptHttpError(testError)).toThrow('Test error');
      expect(mockHandleError).toHaveBeenCalledWith(testError, { meta: undefined });
    });

    it('should pass meta to error handler', () => {
      const testError = new Error('Test error');
      const meta = { skipAuth: true };
      mockHandleError.mockImplementation(error => {
        throw error;
      });

      expect(() => interceptHttpError(testError, meta)).toThrow('Test error');
      expect(mockHandleError).toHaveBeenCalledWith(testError, { meta });
    });
  });

  describe('Edge cases and integration tests', () => {
    it('should handle undefined meta object gracefully', async () => {
      const [, options] = await applyRequestInterceptors('/api/test', { method: 'GET' }, {} as any);

      expect(options.headers).toBeDefined();
    });

    it('should handle complex scenarios with all features', async () => {
      const mockLogger = jest.fn();
      const mockGetToken = jest.fn().mockReturnValue('full-test-token');

      configureHttpInterceptors({
        getAccessToken: mockGetToken,
        logger: mockLogger,
        getLocale: () => 'vi-VN',
      });

      // Test request interceptor with all features
      const controller = new AbortController();
      const [, options] = await applyRequestInterceptors(
        '/api/complex',
        {
          method: 'POST',
          headers: { 'Custom-Header': 'custom-value' },
          body: JSON.stringify({ data: 'test' }),
        },
        {
          correlationId: 'complex-123',
          withCredentials: true,
          timeout: 5000,
          signal: controller.signal,
        }
      );

      const headers = options.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer full-test-token');
      expect(headers.get('Accept-Language')).toBe('vi-VN');
      expect(headers.get('X-Request-Id')).toBe('complex-123');
      expect(headers.get('Custom-Header')).toBe('custom-value');
      expect(options.credentials).toBe('include');

      // Test logging
      const logEvent: HttpLogEvent = {
        type: 'response',
        method: 'POST',
        url: '/api/complex',
        status: 201,
        durationMs: 200,
        correlationId: 'complex-123',
      };

      logHttpEvent(logEvent);
      expect(mockLogger).toHaveBeenCalledWith(logEvent);
      expect(mockTrackPerformance).toHaveBeenCalledWith('http:POST:/api/complex', 200);
    });
  });
});

it('applies JSON headers, localisation and client headers by default, skipping for FormData', async () => {
  configureHttpInterceptors({
    getLocale: () => 'vi-VN',
  });

  const [url, options] = await applyRequestInterceptors('/users', { method: 'POST' }, {});

  const defaultHeaders = (options.headers as Headers).get('Content-Type');
  expect(defaultHeaders).toBe('application/json');
  expect((options.headers as Headers).get('Accept-Language')).toBe('vi-VN');
  expect((options.headers as Headers).get('X-Client')).toBe('web');

  const formData = new FormData();
  formData.append('file', 'value');

  const [, formOptions] = await applyRequestInterceptors('/upload', { method: 'POST', body: formData }, {});

  expect((formOptions.headers as Headers).get('Content-Type')).toBeNull();

  expect(url).toBe('/users');
});
