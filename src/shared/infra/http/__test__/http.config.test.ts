/**
 * Unit Tests for HTTP Configuration Module
 *
 * Tests with 100% coverage for:
 * - parseEnvironmentNumber function (internal)
 * - HTTP_CONFIG object
 * - Environment variable parsing
 * - Default fallback values
 */

describe('HTTP Config Module', () => {
  // Store original environment to restore after each test
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('parseEnvironmentNumber function (internal)', () => {
    it('should return fallback value when environment variable is undefined', async () => {
      // Setup: No environment variables
      delete process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS;

      // Import a fresh module to trigger environment parsing
      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use default timeout value
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(10_000);
    });

    it('should return fallback value when environment variable is empty string', async () => {
      // Setup: Empty string environment variable
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = '';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should fallback to default
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(10_000);
    });

    it('should return fallback value when environment variable is not a valid number', async () => {
      // Setup: Invalid number string
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = 'invalid-number';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should fallback to default
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(10_000);
    });

    it('should return fallback value when environment variable is NaN', async () => {
      // Setup: NaN producing string
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = 'NaN';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should fallback to default
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(10_000);
    });

    it('should return fallback value when environment variable is Infinity', async () => {
      // Setup: Infinity string
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = 'Infinity';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should fallback to default
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(10_000);
    });

    it('should parse valid positive number from environment variable', async () => {
      // Setup: Valid positive number
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = '5000';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use parsed value
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(5000);
    });

    it('should parse valid negative number from environment variable', async () => {
      // Setup: Valid negative number
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = '-1000';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use parsed value (even if negative)
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(-1000);
    });

    it('should parse zero from environment variable', async () => {
      // Setup: Zero value
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = '0';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use zero value
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(0);
    });

    it('should parse floating point numbers as integers', async () => {
      // Setup: Floating point number
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = '5000.75';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should parse as integer (parseInt behavior)
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(5000);
    });
  });

  describe('HTTP_CONFIG timeout configuration', () => {
    it('should use default timeout when no environment variable is set', async () => {
      // Setup: Clean environment
      delete process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS;

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use default value
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(10_000);
    });

    it('should use custom timeout from environment variable', async () => {
      // Setup: Custom timeout
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = '15000';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use custom value
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(15000);
    });
  });

  describe('HTTP_CONFIG retry attempts configuration', () => {
    it('should use default retry attempts when no environment variable is set', async () => {
      // Setup: Clean environment
      delete process.env.NEXT_PUBLIC_HTTP_RETRY;

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use default value
      expect(HTTP_CONFIG.defaultRetryAttempts).toBe(0);
    });

    it('should use custom retry attempts from environment variable', async () => {
      // Setup: Custom retry attempts
      process.env.NEXT_PUBLIC_HTTP_RETRY = '3';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use custom value
      expect(HTTP_CONFIG.defaultRetryAttempts).toBe(3);
    });

    it('should fallback to default when retry attempts is invalid', async () => {
      // Setup: Invalid retry attempts
      process.env.NEXT_PUBLIC_HTTP_RETRY = 'invalid';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should fallback to default
      expect(HTTP_CONFIG.defaultRetryAttempts).toBe(0);
    });
  });

  describe('HTTP_CONFIG retry delay configuration', () => {
    it('should use default retry delay when no environment variable is set', async () => {
      // Setup: Clean environment
      delete process.env.NEXT_PUBLIC_HTTP_RETRY_DELAY_MS;

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use default value
      expect(HTTP_CONFIG.defaultRetryDelayMs).toBe(500);
    });

    it('should use custom retry delay from environment variable', async () => {
      // Setup: Custom retry delay
      process.env.NEXT_PUBLIC_HTTP_RETRY_DELAY_MS = '1000';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use custom value
      expect(HTTP_CONFIG.defaultRetryDelayMs).toBe(1000);
    });

    it('should fallback to default when retry delay is invalid', async () => {
      // Setup: Invalid retry delay
      process.env.NEXT_PUBLIC_HTTP_RETRY_DELAY_MS = 'not-a-number';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should fallback to default
      expect(HTTP_CONFIG.defaultRetryDelayMs).toBe(500);
    });
  });

  describe('HTTP_CONFIG locale configuration', () => {
    it('should use default locale when no environment variable is set', async () => {
      // Setup: Clean environment
      delete process.env.NEXT_PUBLIC_HTTP_LOCALE_FALLBACK;

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use default value
      expect(HTTP_CONFIG.defaultLocale).toBe('en-US');
    });

    it('should use custom locale from environment variable', async () => {
      // Setup: Custom locale
      process.env.NEXT_PUBLIC_HTTP_LOCALE_FALLBACK = 'vi-VN';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use custom value
      expect(HTTP_CONFIG.defaultLocale).toBe('vi-VN');
    });

    it('should use empty string if environment variable is empty', async () => {
      // Setup: Empty locale
      process.env.NEXT_PUBLIC_HTTP_LOCALE_FALLBACK = '';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should use empty string (no fallback for strings)
      expect(HTTP_CONFIG.defaultLocale).toBe('');
    });
  });

  describe('HTTP_CONFIG static properties', () => {
    it('should have correct clientHeader value', async () => {
      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should always be 'web'
      expect(HTTP_CONFIG.clientHeader).toBe('web');
    });

    it('should have all required properties', async () => {
      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Should have all expected properties
      expect(HTTP_CONFIG).toHaveProperty('defaultTimeoutMs');
      expect(HTTP_CONFIG).toHaveProperty('defaultRetryAttempts');
      expect(HTTP_CONFIG).toHaveProperty('defaultRetryDelayMs');
      expect(HTTP_CONFIG).toHaveProperty('defaultLocale');
      expect(HTTP_CONFIG).toHaveProperty('clientHeader');
    });

    it('should have correct types for all properties', async () => {
      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Type checks
      expect(typeof HTTP_CONFIG.defaultTimeoutMs).toBe('number');
      expect(typeof HTTP_CONFIG.defaultRetryAttempts).toBe('number');
      expect(typeof HTTP_CONFIG.defaultRetryDelayMs).toBe('number');
      expect(typeof HTTP_CONFIG.defaultLocale).toBe('string');
      expect(HTTP_CONFIG.clientHeader).toBe('web');
    });
  });

  describe('Multiple environment variables together', () => {
    it('should parse all environment variables correctly when all are set', async () => {
      // Setup: All environment variables
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = '8000';
      process.env.NEXT_PUBLIC_HTTP_RETRY = '2';
      process.env.NEXT_PUBLIC_HTTP_RETRY_DELAY_MS = '750';
      process.env.NEXT_PUBLIC_HTTP_LOCALE_FALLBACK = 'fr-FR';

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: All should use custom values
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(8000);
      expect(HTTP_CONFIG.defaultRetryAttempts).toBe(2);
      expect(HTTP_CONFIG.defaultRetryDelayMs).toBe(750);
      expect(HTTP_CONFIG.defaultLocale).toBe('fr-FR');
      expect(HTTP_CONFIG.clientHeader).toBe('web');
    });

    it('should use mix of custom and default values when some env vars are invalid', async () => {
      // Setup: Mix of valid and invalid environment variables
      process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS = 'invalid'; // Invalid -> fallback
      process.env.NEXT_PUBLIC_HTTP_RETRY = '5'; // Valid
      process.env.NEXT_PUBLIC_HTTP_RETRY_DELAY_MS = ''; // Invalid -> fallback
      process.env.NEXT_PUBLIC_HTTP_LOCALE_FALLBACK = 'ja-JP'; // Valid

      const { HTTP_CONFIG } = await import('../http.config');

      // Assert: Mix of custom and default values
      expect(HTTP_CONFIG.defaultTimeoutMs).toBe(10_000); // Default
      expect(HTTP_CONFIG.defaultRetryAttempts).toBe(5); // Custom
      expect(HTTP_CONFIG.defaultRetryDelayMs).toBe(500); // Default
      expect(HTTP_CONFIG.defaultLocale).toBe('ja-JP'); // Custom
      expect(HTTP_CONFIG.clientHeader).toBe('web'); // Always 'web'
    });
  });

  describe('HttpConfig type', () => {
    it('should export HttpConfig type that matches HTTP_CONFIG object', async () => {
      const { HTTP_CONFIG } = await import('../http.config');

      // TypeScript type test - this will be checked at compile time
      // Runtime test to verify structure
      const configKeys = Object.keys(HTTP_CONFIG);

      expect(configKeys).toContain('defaultTimeoutMs');
      expect(configKeys).toContain('defaultRetryAttempts');
      expect(configKeys).toContain('defaultRetryDelayMs');
      expect(configKeys).toContain('defaultLocale');
      expect(configKeys).toContain('clientHeader');
      expect(configKeys).toHaveLength(5);
    });
  });
});
