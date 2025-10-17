export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: 'Cannot connect to the server. Check your connection.',
  [ErrorCode.TIMEOUT_ERROR]: 'The request timed out. Please try again.',
  [ErrorCode.VALIDATION_ERROR]: 'Provided data is not valid.',
  [ErrorCode.UNAUTHORIZED]: 'Your session expired. Please sign in again.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.BAD_REQUEST]: 'The request cannot be processed.',
  [ErrorCode.SERVER_ERROR]: 'The server responded with an error.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred.',
};
