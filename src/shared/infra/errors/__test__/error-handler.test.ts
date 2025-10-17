import { notification } from 'antd';

import { logError } from '@/shared/infra/monitoring/logger';

import { AppError, NetworkError, ValidationError } from '../appError';
import { ErrorCode } from '../error-codes';
import { handleError, isRetryableError, setNotificationApi } from '../error-handler';

jest.mock('@/shared/infra/monitoring/logger', () => ({
  logError: jest.fn(),
}));

jest.mock('antd', () => ({
  notification: {
    error: jest.fn(),
  },
}));

const mockedLogError = logError as jest.MockedFunction<typeof logError>;
const mockedNotificationError = notification.error as jest.MockedFunction<typeof notification.error>;

describe('handleError', () => {
  beforeEach(() => {
    // Ensure window is available for client-side tests without redefining if it already exists
    if ((globalThis as any).window === undefined) {
      Object.defineProperty(globalThis, 'window', {
        value: {},
        writable: true,
        configurable: true,
      });
    }
  });

  afterEach(() => {
    mockedLogError.mockClear();
    mockedNotificationError.mockClear();
  });

  it('returns AppError instances unchanged', () => {
    const error = new AppError(ErrorCode.BAD_REQUEST);
    expect(handleError(error)).toBe(error);
  });

  it('wraps fetch TypeError as NetworkError', () => {
    const result = handleError(new TypeError('Failed to fetch'));
    expect(result).toBeInstanceOf(NetworkError);
    expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
    expect(mockedLogError).not.toHaveBeenCalled();
  });

  it('returns ValidationError instances unchanged', () => {
    const error = new ValidationError('Invalid', {});
    expect(handleError(error)).toBe(error);
  });

  it('converts Zod issues object into ValidationError', () => {
    const zodError = { issues: [{ message: 'oops' }] };
    const result = handleError(zodError);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.details).toEqual(zodError);
  });

  it('wraps generic Error and logs it', () => {
    const generic = new Error('boom');
    const result = handleError(generic);
    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(mockedLogError).toHaveBeenCalledWith(generic);
  });

  it('handles non-object errors by logging and returning AppError', () => {
    const result = handleError('unexpected');
    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(mockedLogError).toHaveBeenCalled();
  });

  it('emits notification when explicitly requested', () => {
    const error = new AppError(ErrorCode.BAD_REQUEST, 'Custom message');
    handleError(error, { showNotification: true });
    expect(mockedNotificationError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Custom message' }));
  });

  it('emits notification when meta enables it', () => {
    const generic = new Error('boom');
    handleError(generic, { meta: { showErrorNotification: true } });
    expect(mockedNotificationError).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }));
  });

  it('skips notification when disabled', () => {
    const error = new AppError(ErrorCode.BAD_REQUEST, 'Custom message');
    handleError(error, { showNotification: false });
    expect(mockedNotificationError).not.toHaveBeenCalled();
  });
});

// Extended comprehensive tests for error-handler
describe('Error Handler - Extended Coverage', () => {
  let originalWindow: any;
  let mockNotificationApi: any;

  beforeEach(() => {
    jest.clearAllMocks();
    originalWindow = globalThis.window;
    mockNotificationApi = {
      error: jest.fn(),
    };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    setNotificationApi(null as any);
  });

  describe('setNotificationApi', () => {
    it('should set notification API', () => {
      setNotificationApi(mockNotificationApi);

      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test');
      handleError(error, { showNotification: true });

      expect(mockNotificationApi.error).toHaveBeenCalledWith({
        message: 'Test',
        description: undefined,
        key: 'BAD_REQUEST:Test',
        placement: 'topRight',
      });
    });
  });

  describe('Notification suppression', () => {
    it('should suppress UNAUTHORIZED notifications', () => {
      const error = new AppError(ErrorCode.UNAUTHORIZED);
      handleError(error, { showNotification: true });

      expect(mockedNotificationError).not.toHaveBeenCalled();
    });

    it('should show other error notifications', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test error');
      handleError(error, { showNotification: true });

      expect(mockedNotificationError).toHaveBeenCalled();
    });
  });

  describe('Server-side rendering', () => {
    it('should not show notifications on server-side', () => {
      (globalThis as any).__SSR__ = true;

      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test');
      handleError(error, { showNotification: true });

      expect(mockedNotificationError).not.toHaveBeenCalled();

      delete (globalThis as any).__SSR__;
    });
  });

  describe('Error normalization edge cases', () => {
    it('should handle null errors', () => {
      const result = handleError(null);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('should handle undefined errors', () => {
      const result = handleError(undefined);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('should handle number errors', () => {
      const result = handleError(404);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('should handle boolean errors', () => {
      const result = handleError(false);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('should handle function errors', () => {
      const result = handleError(() => 'error');

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('Network error detection', () => {
    it('should detect fetch errors with "fetch" in message', () => {
      const fetchError = new TypeError('Network request failed - fetch error');
      const result = handleError(fetchError);

      expect(result).toBeInstanceOf(NetworkError);
      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(result.message).toBe('Failed to reach the API');
    });

    it('should not convert non-fetch TypeErrors', () => {
      const typeError = new TypeError('Cannot read property');
      const result = handleError(typeError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('Description derivation', () => {
    it('should extract string details as description', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Main message', 400, 'Detail message');
      handleError(error, { showNotification: true });

      expect(mockedNotificationError).toHaveBeenCalledWith({
        message: 'Main message',
        description: 'Detail message',
        key: 'BAD_REQUEST:Main message',
        placement: 'topRight',
      });
    });

    it('should extract object message as description', () => {
      const details = { message: 'Detail from object' };
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Main message', 400, details);
      handleError(error, { showNotification: true });

      expect(mockedNotificationError).toHaveBeenCalledWith({
        message: 'Main message',
        description: 'Detail from object',
        key: 'BAD_REQUEST:Main message',
        placement: 'topRight',
      });
    });

    it('should not use duplicate descriptions', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Same message', 400, 'Same message');
      handleError(error, { showNotification: true });

      expect(mockedNotificationError).toHaveBeenCalledWith({
        message: 'Same message',
        description: undefined,
        key: 'BAD_REQUEST:Same message',
        placement: 'topRight',
      });
    });
  });

  describe('Dynamic antd import fallback', () => {
    it('should not crash if antd import fails (graceful handling)', () => {
      setNotificationApi(null as any);

      // We cannot reliably simulate import failure after module initialization in Jest;
      // this test ensures calling the handler does not throw.
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test');

      expect(() => handleError(error, { showNotification: true })).not.toThrow();
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const retryableErrors = [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT_ERROR, ErrorCode.SERVICE_UNAVAILABLE, ErrorCode.SERVER_ERROR];

      for (const code of retryableErrors) {
        const error = new AppError(code);
        expect(isRetryableError(error)).toBe(true);
      }
    });

    it('should identify non-retryable errors', () => {
      const nonRetryableErrors = [
        ErrorCode.VALIDATION_ERROR,
        ErrorCode.UNAUTHORIZED,
        ErrorCode.FORBIDDEN,
        ErrorCode.NOT_FOUND,
        ErrorCode.BAD_REQUEST,
        ErrorCode.UNKNOWN_ERROR,
      ];

      for (const code of nonRetryableErrors) {
        const error = new AppError(code);
        expect(isRetryableError(error)).toBe(false);
      }
    });
  });

  describe('Notification error handling', () => {
    it('should handle notification rendering errors', () => {
      setNotificationApi({
        error: jest.fn(() => {
          throw new Error('Notification render failed');
        }),
      });

      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test');

      expect(() => {
        handleError(error, { showNotification: true });
      }).not.toThrow();

      expect(mockedLogError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failed to render error notification' }),
        expect.objectContaining({
          notifyError: expect.any(Error),
          appError: error,
        })
      );
    });
  });

  describe('Meta options handling', () => {
    it('should prioritize showNotification over meta preference', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test');
      handleError(error, {
        showNotification: false,
        meta: { showErrorNotification: true },
      });

      expect(mockedNotificationError).not.toHaveBeenCalled();
    });

    it('should use meta preference when showNotification is undefined', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test');
      handleError(error, {
        meta: { showErrorNotification: true },
      });

      expect(mockedNotificationError).toHaveBeenCalled();
    });

    it('should default to false when neither option is provided', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, 'Test');
      handleError(error, {});

      expect(mockedNotificationError).not.toHaveBeenCalled();
    });
  });
});
