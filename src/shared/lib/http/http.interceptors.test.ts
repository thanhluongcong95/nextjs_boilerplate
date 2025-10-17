import { AppError } from '@/shared/lib/errors/AppError';

import {
  applyRequestInterceptors,
  applyResponseInterceptors,
  interceptHttpError,
  registerTokenGetter,
} from './http.interceptors';

describe('http.interceptors', () => {
  const createResponse = (status: number): Response => ({ status }) as Response;

  afterEach(() => {
    registerTokenGetter(() => null);
  });

  it('applies JSON headers by default but skips when body is FormData', async () => {
    const [url, options] = await applyRequestInterceptors(
      '/users',
      { method: 'POST' },
      {}
    );

    const defaultHeaders = (options.headers as Headers).get('Content-Type');
    expect(defaultHeaders).toBe('application/json');

    const formData = new FormData();
    formData.append('file', 'value');

    const [, formOptions] = await applyRequestInterceptors(
      '/upload',
      { method: 'POST', body: formData },
      {}
    );

    expect((formOptions.headers as Headers).get('Content-Type')).toBeNull();

    expect(url).toBe('/users');
  });

  it('injects authorization header from registered getter', async () => {
    registerTokenGetter(() => 'token-123');

    const [, options] = await applyRequestInterceptors('/secure', { method: 'GET' }, {});

    expect((options.headers as Headers).get('Authorization')).toBe('Bearer token-123');
  });

  it('throws mapped AppError on 401 and retry logic on 500', async () => {
    const response401 = createResponse(401);

    await expect(applyResponseInterceptors(response401, {}, 0)).rejects.toBeInstanceOf(
      AppError
    );

    const response500 = createResponse(500);

    await expect(
      applyResponseInterceptors(response500, { retry: 1, retryDelayMs: 0 }, 0)
    ).rejects.toBeInstanceOf(AppError);
  });

  it('rethrows handled errors as AppError through interceptHttpError', () => {
    expect(() => interceptHttpError(new Error('boom'))).toThrow(AppError);
  });
});
