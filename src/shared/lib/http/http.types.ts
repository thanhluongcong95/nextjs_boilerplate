import type { ZodSchema } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpMeta = {
  skipAuth?: boolean;
  showGlobalLoading?: boolean;
  retry?: number;
  retryDelayMs?: number;
  timeout?: number;
};

export type HttpParams = Record<string, string | number | boolean | undefined>;

export type HttpOptions<TResponse = unknown, TBody = unknown> = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: TBody;
  params?: HttpParams;
  meta?: HttpMeta;
  schema?: ZodSchema<TResponse>;
};

export type HttpResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

export type HttpRequestOptions<TResponse = unknown, TBody = unknown> = Omit<
  HttpOptions<TResponse, TBody>,
  'method'
>;
