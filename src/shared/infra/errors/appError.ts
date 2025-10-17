import { ERROR_MESSAGES, ErrorCode } from './error-codes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode?: number;
  public readonly details?: unknown;
  public readonly timestamp: string;

  constructor(code: ErrorCode, message?: string, statusCode?: number, details?: unknown) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message?: string) {
    super(ErrorCode.NETWORK_ERROR, message, 0);
    this.name = 'NetworkError';
  }
}
