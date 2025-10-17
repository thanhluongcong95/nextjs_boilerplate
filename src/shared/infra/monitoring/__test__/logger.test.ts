/**
 * Comprehensive Unit Tests for Logger Module
 * TDD approach - 100% coverage requirements
 */

// Mock console methods
const mockConsoleError = jest.fn();
const mockConsoleInfo = jest.fn();

describe('Logger Module - TDD Comprehensive Coverage', () => {
  let originalConsoleError: typeof console.error;
  let originalConsoleInfo: typeof console.info;

  beforeAll(() => {
    originalConsoleError = console.error;
    originalConsoleInfo = console.info;

    // Mock console methods
    console.error = mockConsoleError;
    console.info = mockConsoleInfo;
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.info = originalConsoleInfo;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('logError function', () => {
    describe('in test environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'test';
        // Force re-evaluation of environment variables
        jest.resetModules();
      });

      it('should not log anything in test environment', async () => {
        const { logError: testLogError } = await import('../logger');
        const error = new Error('Test error');

        testLogError(error);

        expect(mockConsoleError).not.toHaveBeenCalled();
      });

      it('should not log with context in test environment', async () => {
        const { logError: testLogError } = await import('../logger');
        const error = new Error('Test error');
        const context = { userId: '123', action: 'login' };

        testLogError(error, context);

        expect(mockConsoleError).not.toHaveBeenCalled();
      });
    });

    describe('in development environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
        jest.resetModules();
      });

      it('should log error with full details in development', async () => {
        const { logError: devLogError } = await import('../logger');
        const error = new Error('Development error');

        devLogError(error);

        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, undefined);
      });

      it('should log error with context in development', async () => {
        const { logError: devLogError } = await import('../logger');
        const error = new Error('Development error');
        const context = {
          userId: '123',
          action: 'fetchData',
          timestamp: new Date().toISOString(),
        };

        devLogError(error, context);

        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, context);
      });

      it('should handle empty context object in development', async () => {
        const { logError: devLogError } = await import('../logger');
        const error = new Error('Development error');
        const context = {};

        devLogError(error, context);

        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, context);
      });

      it('should handle complex context objects in development', async () => {
        const { logError: devLogError } = await import('../logger');
        const error = new Error('Complex error');
        const context = {
          user: { id: '123', name: 'John' },
          request: { url: '/api/users', method: 'GET' },
          metadata: { version: '1.0.0', build: 123 },
        };

        devLogError(error, context);

        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, context);
      });
    });

    describe('in production environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
        jest.resetModules();
      });

      it('should log only error message in production', async () => {
        const { logError: prodLogError } = await import('../logger');
        const error = new Error('Production error');

        prodLogError(error);

        expect(mockConsoleError).toHaveBeenCalledWith('Production error');
        expect(mockConsoleError).toHaveBeenCalledTimes(1);
      });

      it('should ignore context in production (security)', async () => {
        const { logError: prodLogError } = await import('../logger');
        const error = new Error('Production error with context');
        const sensitiveContext = {
          password: 'secret123',
          apiKey: 'sk-1234567890',
          token: 'bearer-token',
        };

        prodLogError(error, sensitiveContext);

        expect(mockConsoleError).toHaveBeenCalledWith('Production error with context');
        expect(mockConsoleError).not.toHaveBeenCalledWith(expect.anything(), expect.anything(), sensitiveContext);
      });

      it('should handle errors without message in production', async () => {
        const { logError: prodLogError } = await import('../logger');
        const error = new Error();

        prodLogError(error);

        expect(mockConsoleError).toHaveBeenCalledWith('');
      });

      it('should handle errors with empty message in production', async () => {
        const { logError: prodLogError } = await import('../logger');
        const error = new Error('');

        prodLogError(error);

        expect(mockConsoleError).toHaveBeenCalledWith('');
      });
    });

    describe('error handling edge cases', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
        jest.resetModules();
      });

      it('should handle Error objects with custom properties', async () => {
        const { logError: devLogError } = await import('../logger');
        const error = new Error('Custom error') as Error & { code: string; statusCode: number };
        error.code = 'CUSTOM_ERROR';
        error.statusCode = 500;

        devLogError(error);

        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, undefined);
      });

      it('should handle context with null values', async () => {
        const { logError: devLogError } = await import('../logger');
        const error = new Error('Error with null context');
        const context = { value: null, empty: undefined };

        devLogError(error, context);

        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, context);
      });

      it('should handle context with circular references safely', async () => {
        const { logError: devLogError } = await import('../logger');
        const error = new Error('Circular reference error');
        const context: any = { name: 'circular' };
        context.self = context;

        // Should not throw error even with circular reference
        expect(() => {
          devLogError(error, context);
        }).not.toThrow();

        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, context);
      });
    });
  });

  describe('trackPerformance function', () => {
    describe('in test environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'test';
        jest.resetModules();
      });

      it('should not log performance in test environment', async () => {
        const { trackPerformance: testTrackPerf } = await import('../logger');

        testTrackPerf('api-call', 150);

        expect(mockConsoleInfo).not.toHaveBeenCalled();
      });
    });

    describe('in development environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
        jest.resetModules();
      });

      it('should log performance metrics in development', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('api-call', 150);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] api-call took 150ms');
      });

      it('should handle zero duration', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('instant-operation', 0);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] instant-operation took 0ms');
      });

      it('should handle decimal durations', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('precise-operation', 156.789);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] precise-operation took 156.789ms');
      });

      it('should handle large durations', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('slow-operation', 5000.123);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] slow-operation took 5000.123ms');
      });

      it('should handle special characters in operation names', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('api/users/create-user', 250);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] api/users/create-user took 250ms');
      });

      it('should handle empty operation names', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('', 100);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf]  took 100ms');
      });

      it('should handle operations with spaces', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('user data fetch', 300);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] user data fetch took 300ms');
      });
    });

    describe('in production environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
        jest.resetModules();
      });

      it('should not log performance in production', async () => {
        const { trackPerformance: prodTrackPerf } = await import('../logger');

        prodTrackPerf('api-call', 150);

        expect(mockConsoleInfo).not.toHaveBeenCalled();
      });

      it('should not log even with long durations in production', async () => {
        const { trackPerformance: prodTrackPerf } = await import('../logger');

        prodTrackPerf('slow-query', 10000);

        expect(mockConsoleInfo).not.toHaveBeenCalled();
      });
    });

    describe('performance tracking edge cases', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
        jest.resetModules();
      });

      it('should handle negative durations', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('negative-time', -50);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] negative-time took -50ms');
      });

      it('should handle very small durations', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('micro-operation', 0.001);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] micro-operation took 0.001ms');
      });

      it('should handle Infinity duration', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('infinite-operation', Infinity);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] infinite-operation took Infinityms');
      });

      it('should handle NaN duration', async () => {
        const { trackPerformance: devTrackPerf } = await import('../logger');

        devTrackPerf('nan-operation', NaN);

        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] nan-operation took NaNms');
      });
    });
  });

  describe('environment detection', () => {
    it('should handle undefined NODE_ENV', async () => {
      delete process.env.NODE_ENV;
      jest.resetModules();

      const { logError: undefinedEnvLogError } = await import('../logger');
      const error = new Error('Undefined env error');

      undefinedEnvLogError(error);

      // Should behave like non-production (development)
      expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, undefined);
    });

    it('should handle custom NODE_ENV values', async () => {
      process.env.NODE_ENV = 'staging';
      jest.resetModules();

      const { logError: stagingLogError } = await import('../logger');
      const error = new Error('Staging error');

      stagingLogError(error);

      // Should behave like non-production (development)
      expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, undefined);
    });

    it('should be case-sensitive for environment values', async () => {
      process.env.NODE_ENV = 'PRODUCTION'; // uppercase
      jest.resetModules();

      const { logError: uppercaseLogError } = await import('../logger');
      const error = new Error('Uppercase env error');

      uppercaseLogError(error);

      // Should behave like non-production since it's not exactly 'production'
      expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, undefined);
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
    });

    it('should handle multiple rapid error logs', async () => {
      const { logError: devLogError } = await import('../logger');

      for (let i = 0; i < 5; i++) {
        const error = new Error(`Error ${i}`);
        devLogError(error, { iteration: i });
      }

      expect(mockConsoleError).toHaveBeenCalledTimes(5);
      expect(mockConsoleError).toHaveBeenNthCalledWith(1, 'Error captured:', expect.any(Error), { iteration: 0 });
      expect(mockConsoleError).toHaveBeenNthCalledWith(5, 'Error captured:', expect.any(Error), { iteration: 4 });
    });

    it('should handle multiple rapid performance tracks', async () => {
      const { trackPerformance: devTrackPerf } = await import('../logger');

      const operations = ['login', 'fetch-data', 'render', 'cleanup'];
      operations.forEach((op, index) => {
        devTrackPerf(op, (index + 1) * 100);
      });

      expect(mockConsoleInfo).toHaveBeenCalledTimes(4);
      expect(mockConsoleInfo).toHaveBeenNthCalledWith(1, '[perf] login took 100ms');
      expect(mockConsoleInfo).toHaveBeenNthCalledWith(4, '[perf] cleanup took 400ms');
    });

    it('should work correctly when switching between functions', async () => {
      const { logError: devLogError, trackPerformance: devTrackPerf } = await import('../logger');

      devLogError(new Error('First error'));
      devTrackPerf('operation-1', 200);
      devLogError(new Error('Second error'), { step: 2 });
      devTrackPerf('operation-2', 300);

      expect(mockConsoleError).toHaveBeenCalledTimes(2);
      expect(mockConsoleInfo).toHaveBeenCalledTimes(2);

      expect(mockConsoleError).toHaveBeenNthCalledWith(1, 'Error captured:', expect.any(Error), undefined);
      expect(mockConsoleInfo).toHaveBeenNthCalledWith(1, '[perf] operation-1 took 200ms');
      expect(mockConsoleError).toHaveBeenNthCalledWith(2, 'Error captured:', expect.any(Error), { step: 2 });
      expect(mockConsoleInfo).toHaveBeenNthCalledWith(2, '[perf] operation-2 took 300ms');
    });
  });

  describe('type safety and parameter validation', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
    });

    it('should accept Error instances', async () => {
      const { logError: devLogError } = await import('../logger');

      const errors = [
        new Error('Standard error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
        new SyntaxError('Syntax error'),
      ];

      errors.forEach(error => {
        expect(() => devLogError(error)).not.toThrow();
      });

      expect(mockConsoleError).toHaveBeenCalledTimes(4);
    });

    it('should accept various context types', async () => {
      const { logError: devLogError } = await import('../logger');
      const error = new Error('Test error');

      const contexts = [
        { string: 'value' },
        { number: 123 },
        { boolean: true },
        { array: [1, 2, 3] },
        { nested: { deep: { value: 'test' } } },
        { date: new Date() },
        { regex: /pattern/g },
      ];

      contexts.forEach(context => {
        expect(() => devLogError(error, context)).not.toThrow();
      });

      expect(mockConsoleError).toHaveBeenCalledTimes(contexts.length);
    });

    it('should accept various performance parameter types', async () => {
      const { trackPerformance: devTrackPerf } = await import('../logger');

      const testCases = [
        ['string-name', 100],
        ['', 0],
        ['unicode-测试-🚀', 250.5],
        ['numbers123', 999.999],
      ];

      testCases.forEach(([name, duration]) => {
        expect(() => devTrackPerf(name as string, duration as number)).not.toThrow();
      });

      expect(mockConsoleInfo).toHaveBeenCalledTimes(testCases.length);
    });
  });
});
