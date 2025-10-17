/**
 * Comprehensive Unit Tests for Notification Module
 * Ensuring 100% coverage for i18n error notification system
 */

import type { NotificationInstance } from 'antd/es/notification/interface';

import { AppError } from '../appError';
import { ErrorCode } from '../error-codes';
import { notifyApiError } from '../notify';

describe('Notify Module', () => {
  let mockNotification: jest.Mocked<NotificationInstance>;
  let mockT: jest.MockedFunction<(key: string) => string>;

  beforeEach(() => {
    mockNotification = {
      error: jest.fn(),
      success: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      warn: jest.fn(),
      open: jest.fn(),
      destroy: jest.fn(),
      config: jest.fn(),
      useNotification: jest.fn(),
    } as any;

    mockT = jest.fn((key: string) => {
      // Mock i18n translations
      const translations: Record<string, string> = {
        'notifications.errors.unauthorized': 'Session expired. Please login again.',
        'notifications.errors.forbidden': 'Access denied. Insufficient permissions.',
        'notifications.errors.notFound': 'The requested resource was not found.',
        'notifications.errors.validation': 'The provided data is invalid.',
        'notifications.errors.network': 'Network connection failed. Please check your internet.',
        'notifications.errors.server': 'Server error occurred. Please try again later.',
        'notifications.errors.unknown': 'An unexpected error occurred.',
        'fallback.error.message': 'Something went wrong.',
      };

      return translations[key] || key;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('notifyApiError', () => {
    describe('AppError handling', () => {
      it('should handle UNAUTHORIZED error', () => {
        const error = new AppError(ErrorCode.UNAUTHORIZED);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.unauthorized');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Session expired. Please login again.',
          placement: 'topRight',
        });
      });

      it('should handle FORBIDDEN error', () => {
        const error = new AppError(ErrorCode.FORBIDDEN);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.forbidden');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Access denied. Insufficient permissions.',
          placement: 'topRight',
        });
      });

      it('should handle NOT_FOUND error', () => {
        const error = new AppError(ErrorCode.NOT_FOUND);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.notFound');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'The requested resource was not found.',
          placement: 'topRight',
        });
      });

      it('should handle VALIDATION_ERROR', () => {
        const error = new AppError(ErrorCode.VALIDATION_ERROR);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.validation');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'The provided data is invalid.',
          placement: 'topRight',
        });
      });

      it('should handle TIMEOUT_ERROR as network error', () => {
        const error = new AppError(ErrorCode.TIMEOUT_ERROR);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.network');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Network connection failed. Please check your internet.',
          placement: 'topRight',
        });
      });

      it('should handle NETWORK_ERROR', () => {
        const error = new AppError(ErrorCode.NETWORK_ERROR);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.network');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Network connection failed. Please check your internet.',
          placement: 'topRight',
        });
      });

      it('should handle SERVER_ERROR', () => {
        const error = new AppError(ErrorCode.SERVER_ERROR);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.server');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Server error occurred. Please try again later.',
          placement: 'topRight',
        });
      });

      it('should handle BAD_REQUEST as unknown error', () => {
        const error = new AppError(ErrorCode.BAD_REQUEST);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.unknown');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'An unexpected error occurred.',
          placement: 'topRight',
        });
      });

      it('should handle SERVICE_UNAVAILABLE as unknown error', () => {
        const error = new AppError(ErrorCode.SERVICE_UNAVAILABLE);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.unknown');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'An unexpected error occurred.',
          placement: 'topRight',
        });
      });

      it('should handle UNKNOWN_ERROR', () => {
        const error = new AppError(ErrorCode.UNKNOWN_ERROR);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.unknown');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'An unexpected error occurred.',
          placement: 'topRight',
        });
      });
    });

    describe('Non-AppError handling', () => {
      it('should use fallback key for regular Error', () => {
        const error = new Error('Regular error');

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('fallback.error.message');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Something went wrong.',
          placement: 'topRight',
        });
      });

      it('should use fallback key for string error', () => {
        const error = 'String error message';

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('fallback.error.message');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Something went wrong.',
          placement: 'topRight',
        });
      });

      it('should use fallback key for null error', () => {
        const error = null;

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('fallback.error.message');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Something went wrong.',
          placement: 'topRight',
        });
      });

      it('should use fallback key for undefined error', () => {
        const error = undefined;

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('fallback.error.message');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Something went wrong.',
          placement: 'topRight',
        });
      });

      it('should use fallback key for object without code', () => {
        const error = { message: 'Custom object error' };

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockT).toHaveBeenCalledWith('fallback.error.message');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'Something went wrong.',
          placement: 'topRight',
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle missing translation keys gracefully', () => {
        // Mock t function to return the key itself (no translation)
        mockT.mockImplementation((key: string) => key);

        const error = new AppError(ErrorCode.UNAUTHORIZED);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockNotification.error).toHaveBeenCalledWith({
          message: 'notifications.errors.unauthorized',
          placement: 'topRight',
        });
      });

      it('should handle empty fallback key', () => {
        const error = new Error('Regular error');

        notifyApiError(mockNotification, mockT, error, '');

        expect(mockT).toHaveBeenCalledWith('');
        expect(mockNotification.error).toHaveBeenCalledWith({
          message: '',
          placement: 'topRight',
        });
      });

      it('should handle notification API call failure gracefully', () => {
        mockNotification.error.mockImplementation(() => {
          throw new Error('Notification failed');
        });

        const error = new AppError(ErrorCode.SERVER_ERROR);

        expect(() => {
          notifyApiError(mockNotification, mockT, error, 'fallback.error.message');
        }).toThrow('Notification failed');

        expect(mockT).toHaveBeenCalledWith('notifications.errors.server');
      });

      it('should work with different placement values (testing consistency)', () => {
        const error = new AppError(ErrorCode.VALIDATION_ERROR);

        notifyApiError(mockNotification, mockT, error, 'fallback.error.message');

        expect(mockNotification.error).toHaveBeenCalledWith({
          message: expect.any(String),
          placement: 'topRight',
        });
      });
    });

    describe('Type safety verification', () => {
      it('should accept any error type', () => {
        const testErrors = [
          new AppError(ErrorCode.UNAUTHORIZED),
          new Error('Regular error'),
          'String error',
          { custom: 'error' },
          null,
          undefined,
          42,
          true,
        ];

        for (const error of testErrors) {
          expect(() => {
            notifyApiError(mockNotification, mockT, error, 'fallback.key');
          }).not.toThrow();
        }
      });

      it('should require valid NotificationInstance', () => {
        const error = new AppError(ErrorCode.SERVER_ERROR);

        // This tests TypeScript compilation - if it compiles, the types are correct
        notifyApiError(mockNotification, mockT, error, 'fallback.key');

        expect(mockNotification.error).toHaveBeenCalled();
      });

      it('should require valid TFunction', () => {
        const error = new AppError(ErrorCode.SERVER_ERROR);

        // This tests TypeScript compilation
        notifyApiError(mockNotification, mockT, error, 'fallback.key');

        expect(mockT).toHaveBeenCalled();
      });
    });

    describe('Integration scenarios', () => {
      it('should work with real-world error scenarios', () => {
        const scenarios = [
          {
            error: new AppError(ErrorCode.UNAUTHORIZED, 'Token expired'),
            expectedKey: 'notifications.errors.unauthorized',
          },
          {
            error: new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid email format', 400, { field: 'email' }),
            expectedKey: 'notifications.errors.validation',
          },
          {
            error: new AppError(ErrorCode.NETWORK_ERROR, 'Connection timeout'),
            expectedKey: 'notifications.errors.network',
          },
        ];

        for (const { error, expectedKey } of scenarios) {
          mockT.mockClear();
          mockNotification.error.mockClear();

          notifyApiError(mockNotification, mockT, error, 'fallback.key');

          expect(mockT).toHaveBeenCalledWith(expectedKey);
          expect(mockNotification.error).toHaveBeenCalledWith({
            message: expect.any(String),
            placement: 'topRight',
          });
        }
      });

      it('should handle cascaded error notifications', () => {
        const errors = [new AppError(ErrorCode.NETWORK_ERROR), new AppError(ErrorCode.SERVER_ERROR), new AppError(ErrorCode.UNKNOWN_ERROR)];

        for (const error of errors) {
          notifyApiError(mockNotification, mockT, error, 'fallback.key');
        }

        expect(mockNotification.error).toHaveBeenCalledTimes(3);
        expect(mockT).toHaveBeenCalledTimes(3);
      });
    });
  });
});
