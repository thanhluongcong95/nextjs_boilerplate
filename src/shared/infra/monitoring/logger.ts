const env = process.env.NODE_ENV;
const isProduction = env === 'production';
const isTest = env === 'test';

export function logError(error: Error, context?: Record<string, unknown>) {
  if (isTest) {
    return;
  }

  if (isProduction) {
    console.error(error.message);
  } else {
    console.error('Error captured:', error, context);
  }
}

export function trackPerformance(name: string, duration: number) {
  if (isTest) {
    return;
  }

  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.info(`[perf] ${name} took ${duration}ms`);
  }
}
