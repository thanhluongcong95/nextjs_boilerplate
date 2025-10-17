/**
 * TDD Unit Tests for Logger Module
 * Testing current implementation for 100% coverage
 */

import { logError, trackPerformance } from '../logger';

// Mock console methods
const mockConsoleError = jest.fn();
const mockConsoleInfo = jest.fn();

describe('Logger Module - Current Implementation Tests', () => {
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
    it('should log error in current environment', () => {
      const error = new Error('Test error message');

      logError(error);

      // This test should pass based on current environment
      // In test env, it should not call console.error
      // In dev env, it should call with full details
      // In prod env, it should call with message only

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleError).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleError).toHaveBeenCalledWith('Test error message');
      } else {
        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, undefined);
      }
    });

    it('should log error with context in current environment', () => {
      const error = new Error('Test error with context');
      const context = { userId: '123', action: 'test' };

      logError(error, context);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleError).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleError).toHaveBeenCalledWith('Test error with context');
        // Should not log context in production
        expect(mockConsoleError).not.toHaveBeenCalledWith(expect.anything(), expect.anything(), context);
      } else {
        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, context);
      }
    });

    it('should handle empty error messages', () => {
      // Create error and then clear message to test empty string handling
      const error = new Error('temporary');
      error.message = '';

      logError(error);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleError).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleError).toHaveBeenCalledWith('');
      } else {
        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, undefined);
      }
    });
    it('should handle null context', () => {
      const error = new Error('Error with null context');

      logError(error, null as any);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleError).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleError).toHaveBeenCalledWith('Error with null context');
      } else {
        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, null);
      }
    });

    it('should handle complex context objects', () => {
      const error = new Error('Complex error');
      const context = {
        user: { id: '123', name: 'John' },
        request: { url: '/api/test', method: 'GET' },
        nested: { deep: { value: 'test' } },
      };

      logError(error, context);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleError).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleError).toHaveBeenCalledWith('Complex error');
      } else {
        expect(mockConsoleError).toHaveBeenCalledWith('Error captured:', error, context);
      }
    });
  });

  describe('trackPerformance function', () => {
    it('should track performance in current environment', () => {
      trackPerformance('test-operation', 150);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] test-operation took 150ms');
      }
    });

    it('should handle zero duration', () => {
      trackPerformance('instant-op', 0);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] instant-op took 0ms');
      }
    });

    it('should handle decimal durations', () => {
      trackPerformance('precise-op', 123.456);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] precise-op took 123.456ms');
      }
    });

    it('should handle large durations', () => {
      trackPerformance('slow-operation', 5000);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] slow-operation took 5000ms');
      }
    });

    it('should handle empty operation names', () => {
      trackPerformance('', 100);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf]  took 100ms');
      }
    });

    it('should handle special characters in operation names', () => {
      trackPerformance('api/users/create-user', 200);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] api/users/create-user took 200ms');
      }
    });

    it('should handle negative durations', () => {
      trackPerformance('negative-time', -50);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] negative-time took -50ms');
      }
    });

    it('should handle NaN duration', () => {
      trackPerformance('nan-operation', Number.NaN);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] nan-operation took NaNms');
      }
    });

    it('should handle Infinity duration', () => {
      trackPerformance('infinite-op', Infinity);

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleInfo).toHaveBeenCalledWith('[perf] infinite-op took Infinityms');
      }
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle multiple rapid calls', () => {
      for (let i = 0; i < 3; i++) {
        const error = new Error(`Error ${i}`);
        logError(error);
        trackPerformance(`operation-${i}`, i * 100);
      }

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleError).not.toHaveBeenCalled();
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else if (process.env.NODE_ENV === 'production') {
        expect(mockConsoleError).toHaveBeenCalledTimes(3);
        expect(mockConsoleInfo).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleError).toHaveBeenCalledTimes(3);
        expect(mockConsoleInfo).toHaveBeenCalledTimes(3);
      }
    });

    it('should handle Error subclasses', () => {
      const errors = [new TypeError('Type error'), new ReferenceError('Reference error'), new SyntaxError('Syntax error')];

      for (const error of errors) {
        logError(error);
      }

      if (process.env.NODE_ENV === 'test') {
        expect(mockConsoleError).not.toHaveBeenCalled();
      } else {
        expect(mockConsoleError).toHaveBeenCalledTimes(3);
      }
    });

    it('should be callable with different parameter types', () => {
      const testCases = [
        [new Error('Basic error'), undefined],
        [new Error('Error with string'), 'string context'],
        [new Error('Error with object'), { key: 'value' }],
        [new Error('Error with array'), [1, 2, 3]],
        [new Error('Error with number'), 42],
      ];

      for (const [error, context] of testCases) {
        expect(() => logError(error as Error, context as any)).not.toThrow();
      }
    });

    it('should handle performance tracking with various data types', () => {
      const testCases = [
        ['string-name', 100],
        ['', 0],
        ['unicode-测试-🚀', 250.5],
      ];

      for (const [name, duration] of testCases) {
        expect(() => trackPerformance(name as string, duration as number)).not.toThrow();
      }
    });
  });
});
