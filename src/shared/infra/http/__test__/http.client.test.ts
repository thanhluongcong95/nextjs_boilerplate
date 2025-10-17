import { z } from 'zod';

import { ErrorCode } from '@/shared/infra/errors/error-codes';

import type * as HttpModule from '../http.client';

const startGlobalLoadingMock = jest.fn();
const stopGlobalLoadingMock = jest.fn();

jest.mock('@/shared/state/controllers/loading.controller', () => ({
  startGlobalLoading: startGlobalLoadingMock,
  stopGlobalLoading: stopGlobalLoadingMock,
}));

const applyRequestInterceptorsMock = jest.fn(async (url: string, options: RequestInit, _meta: unknown) => [url, options]);
const applyResponseInterceptorsMock = jest.fn(async (response: Response) => response);
const interceptHttpErrorMock = jest.fn((error: unknown, _meta?: unknown) => {
  throw error;
});

jest.mock('../http.interceptors', () => ({
  applyRequestInterceptors: applyRequestInterceptorsMock,
  applyResponseInterceptors: applyResponseInterceptorsMock,
  interceptHttpError: interceptHttpErrorMock,
  generateCorrelationId: jest.fn(() => 'test-correlation'),
  logHttpEvent: jest.fn(),
}));

describe('http client', () => {
  let http: typeof HttpModule.http;

  beforeEach(() => {
    startGlobalLoadingMock.mockClear();
    stopGlobalLoadingMock.mockClear();
    applyRequestInterceptorsMock.mockClear();
    applyResponseInterceptorsMock.mockClear();
    interceptHttpErrorMock.mockClear();
    (globalThis.fetch as unknown as jest.Mock)?.mockClear();
  });

  beforeAll(async () => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;
    const clientModule = await import('../http.client');
    http = clientModule.http;
  });

  afterAll(() => {
    (globalThis.fetch as unknown as jest.Mock).mockRestore?.();
  });

  it('resolves validated data and toggles global loading by default', async () => {
    const payload = { id: '1', name: 'John' };
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => payload,
    } satisfies Partial<Response>);

    const result = await http('/users/1', {
      schema: z.object({
        id: z.string(),
        name: z.string(),
      }),
    });

    expect(result).toEqual(payload);
    expect(startGlobalLoadingMock).toHaveBeenCalledTimes(1);
    expect(stopGlobalLoadingMock).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch as jest.Mock).toHaveBeenCalledTimes(1);
    expect(applyRequestInterceptorsMock).toHaveBeenCalledTimes(1);
    expect(applyResponseInterceptorsMock).toHaveBeenCalledTimes(1);
  });

  it('appends query parameters to the requested URL', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } satisfies Partial<Response>);

    await http('/users', {
      params: { page: 2, search: 'alice' },
    });

    const [calledUrl] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const parsed = new URL(calledUrl as string);
    expect(parsed.searchParams.get('page')).toBe('2');
    expect(parsed.searchParams.get('search')).toBe('alice');
  });

  it('skips global loading when meta.showGlobalLoading is false', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } satisfies Partial<Response>);

    await http('/users', {
      meta: { showGlobalLoading: false },
    });

    expect(startGlobalLoadingMock).not.toHaveBeenCalled();
    expect(stopGlobalLoadingMock).not.toHaveBeenCalled();
    expect(globalThis.fetch as jest.Mock).toHaveBeenCalledTimes(1);
  });

  it('returns undefined for 204 responses and does not call json()', async () => {
    const jsonSpy = jest.fn();
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: jsonSpy,
    } satisfies Partial<Response>);

    const result = await http('/resource');

    expect(result).toBeUndefined();
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it('stringifies plain objects but keeps FormData bodies intact', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } satisfies Partial<Response>);

    await http('/with-body', {
      method: 'POST',
      body: { foo: 'bar' },
    });

    const [, firstInit] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect((firstInit as RequestInit).body).toBe(JSON.stringify({ foo: 'bar' }));

    (globalThis.fetch as jest.Mock).mockClear();

    const formData = new FormData();
    formData.append('file', 'content');

    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } satisfies Partial<Response>);

    await http('/upload', {
      method: 'POST',
      body: formData,
    });

    const [, secondInit] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect((secondInit as RequestInit).body).toBe(formData);
  });

  it('retries retryable AppError and succeeds on subsequent attempt', async () => {
    const firstResponse = {
      ok: false,
      status: 503,
      clone: () => firstResponse,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'service unavailable' }),
    };
    const successResponse = {
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    };
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(firstResponse).mockResolvedValueOnce(successResponse);

    const result = await http('/health', {
      meta: { retry: 1, retryDelayMs: 0 },
      schema: z.object({ ok: z.boolean() }),
    });

    expect(result).toEqual({ ok: true });
    expect(globalThis.fetch as jest.Mock).toHaveBeenCalledTimes(2);
  });

  it('throws AppError with mapped code and stops loading on failure', async () => {
    const errorResponse = {
      ok: false,
      status: 404,
      clone: () => errorResponse,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'not found' }),
    };
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(errorResponse);

    await expect(
      http('/missing', {
        schema: z.object({}),
      })
    ).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
      statusCode: 404,
    });
    expect(interceptHttpErrorMock).toHaveBeenCalledTimes(1);
    expect(interceptHttpErrorMock.mock.calls[0]?.[1]).toMatchObject({
      showErrorNotification: true,
    });
    expect(startGlobalLoadingMock).toHaveBeenCalledTimes(1);
    expect(stopGlobalLoadingMock).toHaveBeenCalledTimes(1);
  });
});
