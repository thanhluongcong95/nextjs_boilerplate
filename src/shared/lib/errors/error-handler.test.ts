import { logError } from '@/shared/lib/monitoring/logger';

import { AppError, NetworkError, ValidationError } from './AppError';
import { ErrorCode } from './error-codes';
import { handleError } from './error-handler';

jest.mock('@/shared/lib/monitoring/logger', () => ({
  logError: jest.fn(),
}));

const mockedLogError = logError as jest.MockedFunction<typeof logError>;

describe('handleError', () => {
  afterEach(() => {
    mockedLogError.mockClear();
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
});
