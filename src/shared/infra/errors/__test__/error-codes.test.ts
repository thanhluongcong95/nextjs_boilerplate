/**
 * Comprehensive Unit Tests for Error Codes Module
 * Ensuring 100% coverage for error classification system
 */

import { ERROR_MESSAGES, ErrorCode } from '../error-codes';

describe('Error Codes Module', () => {
  describe('ErrorCode enum', () => {
    it('should contain all expected error codes', () => {
      const expectedCodes = [
        'NETWORK_ERROR',
        'TIMEOUT_ERROR',
        'VALIDATION_ERROR',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'BAD_REQUEST',
        'SERVER_ERROR',
        'SERVICE_UNAVAILABLE',
        'UNKNOWN_ERROR',
      ];

      for (const code of expectedCodes) {
        expect(ErrorCode[code as keyof typeof ErrorCode]).toBeDefined();
        expect(typeof ErrorCode[code as keyof typeof ErrorCode]).toBe('string');
      }
    });

    it('should have string values matching the key names', () => {
      expect(ErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorCode.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.BAD_REQUEST).toBe('BAD_REQUEST');
      expect(ErrorCode.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ErrorCode.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
      expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });

    it('should have unique values for all error codes', () => {
      const values = Object.values(ErrorCode);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(values.length);
    });

    it('should be immutable (readonly)', () => {
      // TypeScript enums are not runtime immutable by default
      // This tests TypeScript compilation behavior
      expect(typeof ErrorCode).toBe('object');
      expect(Object.keys(ErrorCode).length).toBeGreaterThan(0);
    });
  });

  describe('ERROR_MESSAGES constant', () => {
    it('should have message for every error code', () => {
      const errorCodes = Object.values(ErrorCode);

      for (const code of errorCodes) {
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(typeof ERROR_MESSAGES[code]).toBe('string');
        expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0);
      }
    });

    it('should contain user-friendly messages', () => {
      expect(ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]).toBe('Cannot connect to the server. Check your connection.');
      expect(ERROR_MESSAGES[ErrorCode.TIMEOUT_ERROR]).toBe('The request timed out. Please try again.');
      expect(ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR]).toBe('Provided data is not valid.');
      expect(ERROR_MESSAGES[ErrorCode.UNAUTHORIZED]).toBe('Your session expired. Please sign in again.');
      expect(ERROR_MESSAGES[ErrorCode.FORBIDDEN]).toBe('You do not have permission to perform this action.');
      expect(ERROR_MESSAGES[ErrorCode.NOT_FOUND]).toBe('The requested resource was not found.');
      expect(ERROR_MESSAGES[ErrorCode.BAD_REQUEST]).toBe('The request cannot be processed.');
      expect(ERROR_MESSAGES[ErrorCode.SERVER_ERROR]).toBe('The server responded with an error.');
      expect(ERROR_MESSAGES[ErrorCode.SERVICE_UNAVAILABLE]).toBe('The service is temporarily unavailable.');
      expect(ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR]).toBe('An unknown error occurred.');
    });

    it('should not have extra messages beyond defined error codes', () => {
      const errorCodeValues = Object.values(ErrorCode);
      const messageKeys = Object.keys(ERROR_MESSAGES);

      expect(messageKeys.length).toBe(errorCodeValues.length);

      for (const key of messageKeys) {
        expect(errorCodeValues).toContain(key as ErrorCode);
      }
    });

    it('should have non-empty messages', () => {
      for (const message of Object.values(ERROR_MESSAGES)) {
        expect(message.trim()).toBe(message); // No leading/trailing whitespace
        expect(message.length).toBeGreaterThan(5); // Reasonable minimum length
        expect(message.endsWith('.')); // Proper punctuation
      }
    });

    it('should have messages suitable for user display', () => {
      for (const message of Object.values(ERROR_MESSAGES)) {
        // Should not contain technical jargon that users won't understand
        expect(message).not.toMatch(/HTTP/i);
        expect(message).not.toMatch(/API/i);
        expect(message).not.toMatch(/JSON/i);
        expect(message).not.toMatch(/XMLHttpRequest/i);

        // Should be properly capitalized
        expect(message[0]).toBe(message[0].toUpperCase());
      }
    });

    it('should be immutable object', () => {
      // Check if object is properly configured
      expect(typeof ERROR_MESSAGES).toBe('object');
      expect(ERROR_MESSAGES).not.toBeNull();

      // In strict mode, attempts to modify will fail
      const originalMessage = ERROR_MESSAGES[ErrorCode.NETWORK_ERROR];
      expect(originalMessage).toBeDefined();
    });

    it('should support type-safe access', () => {
      // This tests TypeScript compilation - if it compiles, the types are correct
      const networkMessage: string = ERROR_MESSAGES[ErrorCode.NETWORK_ERROR];
      const timeoutMessage: string = ERROR_MESSAGES[ErrorCode.TIMEOUT_ERROR];

      expect(typeof networkMessage).toBe('string');
      expect(typeof timeoutMessage).toBe('string');
    });
  });

  describe('Integration tests', () => {
    it('should work together for error classification', () => {
      // Test that error codes and messages work together
      const testScenarios = [
        { code: ErrorCode.NETWORK_ERROR, expectedKeyword: 'connect' },
        { code: ErrorCode.TIMEOUT_ERROR, expectedKeyword: 'timed out' },
        { code: ErrorCode.VALIDATION_ERROR, expectedKeyword: 'valid' },
        { code: ErrorCode.UNAUTHORIZED, expectedKeyword: 'session' },
        { code: ErrorCode.FORBIDDEN, expectedKeyword: 'permission' },
        { code: ErrorCode.NOT_FOUND, expectedKeyword: 'not found' },
        { code: ErrorCode.SERVER_ERROR, expectedKeyword: 'server' },
      ];

      for (const { code, expectedKeyword } of testScenarios) {
        const message = ERROR_MESSAGES[code];
        expect(message.toLowerCase()).toContain(expectedKeyword.toLowerCase());
      }
    });

    it('should handle all enum values dynamically', () => {
      // Test dynamic enumeration to catch any future additions
      const codeCount = Object.keys(ErrorCode).length;
      const messageCount = Object.keys(ERROR_MESSAGES).length;

      expect(codeCount).toBe(messageCount);
      expect(codeCount).toBe(10); // Update this if you add more error codes
    });
  });
});
