import { AppError, NetworkError, ValidationError } from '@/shared/lib/errors/AppError';
import { ErrorCode } from '@/shared/lib/errors/error-codes';
import { logError } from '@/shared/lib/monitoring/logger';

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Failed to reach the API');
  }

  if (error instanceof ValidationError) {
    return error;
  }

  if (error && typeof error === 'object' && 'issues' in error) {
    return new ValidationError('Validation failed', error);
  }

  if (error instanceof Error) {
    logError(error);
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, undefined, error);
  }

  logError(new Error('Unknown error type'), { error });
  return new AppError(ErrorCode.UNKNOWN_ERROR);
}

export function isRetryableError(error: AppError) {
  return [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.SERVER_ERROR,
  ].includes(error.code);
}
