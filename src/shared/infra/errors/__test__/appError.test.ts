/**
 * Comprehensive Unit Tests for AppError Classes
 * Ensuring 100% coverage for error hierarchy
 */

import { AppError, NetworkError, ValidationError } from '../appError';
import { ErrorCode } from '../error-codes';

describe('AppError Classes', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const details = { field: 'email', reason: 'invalid' };
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Custom message', 400, details);

      expect(error.name).toBe('AppError');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Custom message');
      expect(error.statusCode).toBe(400);
      expect(error.details).toBe(details);
      expect(error.timestamp).toBeDefined();
      expect(new Date(error.timestamp)).toBeInstanceOf(Date);
    });

    it('should use default message when none provided', () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR);

      expect(error.message).toBe('Cannot connect to the server. Check your connection.');
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should serialize to JSON properly', () => {
      const error = new AppError(ErrorCode.SERVER_ERROR, 'Server error', 500, { trace: 'abc123' });

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'AppError',
        code: ErrorCode.SERVER_ERROR,
        message: 'Server error',
        statusCode: 500,
        details: { trace: 'abc123' },
        timestamp: error.timestamp,
      });
    });

    it('should capture stack trace when available', () => {
      const originalCaptureStackTrace = Error.captureStackTrace;
      const mockCaptureStackTrace = jest.fn();
      Error.captureStackTrace = mockCaptureStackTrace;

      const error = new AppError(ErrorCode.UNKNOWN_ERROR);

      expect(mockCaptureStackTrace).toHaveBeenCalledWith(error, AppError);

      Error.captureStackTrace = originalCaptureStackTrace;
    });

    it('should handle missing Error.captureStackTrace gracefully', () => {
      const originalCaptureStackTrace = Error.captureStackTrace;
      delete (Error as any).captureStackTrace;

      expect(() => {
        const error = new AppError(ErrorCode.UNKNOWN_ERROR);
        expect(error).toBeInstanceOf(AppError);
      }).not.toThrow();

      Error.captureStackTrace = originalCaptureStackTrace;
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with correct defaults', () => {
      const details = { fields: ['email', 'password'] };
      const error = new ValidationError('Validation failed', details);

      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.details).toBe(details);
    });

    it('should work without details', () => {
      const error = new ValidationError('Simple validation error');

      expect(error.details).toBeUndefined();
    });

    it('should be instanceof AppError', () => {
      const error = new ValidationError('Test');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('NetworkError', () => {
    it('should create network error with correct defaults', () => {
      const error = new NetworkError('Connection timeout');

      expect(error.name).toBe('NetworkError');
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Connection timeout');
      expect(error.statusCode).toBe(0);
      expect(error.details).toBeUndefined();
    });

    it('should use default message when none provided', () => {
      const error = new NetworkError();

      expect(error.message).toBe('Cannot connect to the server. Check your connection.');
    });

    it('should be instanceof AppError', () => {
      const error = new NetworkError();

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NetworkError);
    });
  });
});
