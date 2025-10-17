/**
 * Unit Tests for HTTP Types Module
 *
 * Tests with 100% coverage for:
 * - Type definitions and interfaces
 * - Type compatibility and structure
 * - Runtime behavior of type-related utilities
 * - ZodType integration
 */

import { z } from 'zod';
import type { HttpMeta, HttpMethod, HttpOptions, HttpParams, HttpRequestOptions, HttpResponse } from '../http.types';

describe('HTTP Types Module', () => {
  describe('HttpMethod type', () => {
    it('should accept valid HTTP methods', () => {
      // Test compile-time type safety at runtime
      const validMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

      validMethods.forEach(method => {
        // Runtime verification that these are valid strings
        expect(typeof method).toBe('string');
        expect(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).toContain(method);
      });
    });

    it('should work in function parameters', () => {
      // Helper function to test type compatibility
      const testMethodFunction = (method: HttpMethod): string => {
        return `Method is ${method}`;
      };

      // Test all valid methods
      expect(testMethodFunction('GET')).toBe('Method is GET');
      expect(testMethodFunction('POST')).toBe('Method is POST');
      expect(testMethodFunction('PUT')).toBe('Method is PUT');
      expect(testMethodFunction('PATCH')).toBe('Method is PATCH');
      expect(testMethodFunction('DELETE')).toBe('Method is DELETE');
    });
  });

  describe('HttpParams type', () => {
    it('should accept valid parameter types', () => {
      const validParams: HttpParams = {
        stringParam: 'test',
        numberParam: 42,
        booleanParam: true,
        undefinedParam: undefined,
        zeroParam: 0,
        emptyStringParam: '',
        falseParam: false,
      };

      // Verify runtime types
      expect(typeof validParams.stringParam).toBe('string');
      expect(typeof validParams.numberParam).toBe('number');
      expect(typeof validParams.booleanParam).toBe('boolean');
      expect(validParams.undefinedParam).toBeUndefined();
      expect(validParams.zeroParam).toBe(0);
      expect(validParams.emptyStringParam).toBe('');
      expect(validParams.falseParam).toBe(false);
    });

    it('should work with empty object', () => {
      const emptyParams: HttpParams = {};
      expect(Object.keys(emptyParams)).toHaveLength(0);
    });

    it('should handle dynamic keys', () => {
      const dynamicParams: HttpParams = {};
      dynamicParams['dynamicKey'] = 'dynamicValue';
      dynamicParams['anotherKey'] = 123;

      expect(dynamicParams['dynamicKey']).toBe('dynamicValue');
      expect(dynamicParams['anotherKey']).toBe(123);
    });
  });

  describe('HttpMeta interface', () => {
    it('should create a valid HttpMeta object with all properties', () => {
      const signal = new AbortController().signal;

      const fullMeta: HttpMeta = {
        skipAuth: true,
        skipAuthRefresh: false,
        showGlobalLoading: true,
        showErrorNotification: false,
        retry: 3,
        retryDelayMs: 1000,
        timeout: 5000,
        correlationId: 'test-correlation-id',
        withCredentials: true,
        signal: signal,
      };

      // Verify all properties
      expect(fullMeta.skipAuth).toBe(true);
      expect(fullMeta.skipAuthRefresh).toBe(false);
      expect(fullMeta.showGlobalLoading).toBe(true);
      expect(fullMeta.showErrorNotification).toBe(false);
      expect(fullMeta.retry).toBe(3);
      expect(fullMeta.retryDelayMs).toBe(1000);
      expect(fullMeta.timeout).toBe(5000);
      expect(fullMeta.correlationId).toBe('test-correlation-id');
      expect(fullMeta.withCredentials).toBe(true);
      expect(fullMeta.signal).toBe(signal);
    });

    it('should create a valid HttpMeta object with partial properties', () => {
      const partialMeta: HttpMeta = {
        skipAuth: true,
        showGlobalLoading: false,
      };

      expect(partialMeta.skipAuth).toBe(true);
      expect(partialMeta.showGlobalLoading).toBe(false);
      // Other properties should be undefined
      expect(partialMeta.skipAuthRefresh).toBeUndefined();
      expect(partialMeta.retry).toBeUndefined();
    });

    it('should create empty HttpMeta object', () => {
      const emptyMeta: HttpMeta = {};
      expect(Object.keys(emptyMeta)).toHaveLength(0);
    });

    it('should handle AbortSignal properly', () => {
      const controller = new AbortController();
      const meta: HttpMeta = {
        signal: controller.signal,
      };

      expect(meta.signal).toBe(controller.signal);
      expect(meta.signal?.aborted).toBe(false);

      controller.abort();
      expect(meta.signal?.aborted).toBe(true);
    });
  });

  describe('HttpOptions interface', () => {
    it('should create valid HttpOptions with all properties', () => {
      const testSchema = z.object({ id: z.number() });
      const controller = new AbortController();

      const fullOptions: HttpOptions<{ id: number }, { name: string }> = {
        method: 'POST',
        headers: { 'Custom-Header': 'value' },
        body: { name: 'test' },
        params: { page: 1 },
        meta: { skipAuth: true },
        schema: testSchema,
        signal: controller.signal,
      };

      expect(fullOptions.method).toBe('POST');
      expect(fullOptions.headers?.['Custom-Header']).toBe('value');
      expect(fullOptions.body?.name).toBe('test');
      expect(fullOptions.params?.page).toBe(1);
      expect(fullOptions.meta?.skipAuth).toBe(true);
      expect(fullOptions.schema).toBe(testSchema);
      expect(fullOptions.signal).toBe(controller.signal);
    });

    it('should create minimal HttpOptions object', () => {
      const minimalOptions: HttpOptions = {};
      expect(Object.keys(minimalOptions)).toHaveLength(0);
    });

    it('should work with generic types', () => {
      interface User {
        id: number;
        name: string;
      }
      interface CreateUserRequest {
        name: string;
        email: string;
      }

      const typedOptions: HttpOptions<User, CreateUserRequest> = {
        method: 'POST',
        body: { name: 'John', email: 'john@example.com' },
      };

      expect(typedOptions.body?.name).toBe('John');
      expect(typedOptions.body?.email).toBe('john@example.com');
    });

    it('should handle complex nested structures', () => {
      const complexOptions: HttpOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
        params: {
          include: 'profile',
          fields: 'name,email',
          active: true,
        },
        meta: {
          retry: 2,
          retryDelayMs: 500,
          showGlobalLoading: true,
          correlationId: 'complex-request-123',
        },
      };

      expect(complexOptions.headers?.['Content-Type']).toBe('application/json');
      expect(complexOptions.params?.include).toBe('profile');
      expect(complexOptions.meta?.retry).toBe(2);
    });
  });

  describe('HttpResponse interface', () => {
    it('should create a valid HttpResponse with typed data', () => {
      const headers = new Headers();
      headers.set('content-type', 'application/json');

      const response: HttpResponse<{ id: number; name: string }> = {
        data: { id: 1, name: 'John' },
        status: 200,
        headers: headers,
      };

      expect(response.data.id).toBe(1);
      expect(response.data.name).toBe('John');
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/json');
    });

    it('should handle array data types', () => {
      const response: HttpResponse<string[]> = {
        data: ['item1', 'item2', 'item3'],
        status: 200,
        headers: new Headers(),
      };

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(3);
      expect(response.data[0]).toBe('item1');
    });

    it('should handle different status codes', () => {
      const responses = [
        { data: null, status: 201, headers: new Headers() },
        { data: 'error', status: 400, headers: new Headers() },
        { data: { message: 'Not Found' }, status: 404, headers: new Headers() },
        { data: undefined, status: 500, headers: new Headers() },
      ];

      responses.forEach(resp => {
        expect(typeof resp.status).toBe('number');
        expect(resp.headers instanceof Headers).toBe(true);
      });
    });
  });

  describe('HttpRequestOptions type (utility type)', () => {
    it('should omit method from HttpOptions', () => {
      // Test that HttpRequestOptions doesn't include method
      const requestOptions: HttpRequestOptions = {
        headers: { 'X-Test': 'value' },
        body: { data: 'test' },
        params: { id: 1 },
        // method not present here - should be omitted
      };

      expect(requestOptions.headers?.['X-Test']).toBe('value');
      expect(requestOptions.body).toEqual({ data: 'test' });
      expect(requestOptions.params?.id).toBe(1);
    });

    it('should work with typed generics', () => {
      interface ApiResponse {
        success: boolean;
      }
      interface RequestPayload {
        action: string;
      }

      const typedRequestOptions: HttpRequestOptions<ApiResponse, RequestPayload> = {
        body: { action: 'create' },
        meta: { showGlobalLoading: true },
      };

      expect(typedRequestOptions.body?.action).toBe('create');
      expect(typedRequestOptions.meta?.showGlobalLoading).toBe(true);
    });

    it('should include all properties except method', () => {
      const schema = z.string();
      const controller = new AbortController();

      const fullRequestOptions: HttpRequestOptions = {
        headers: { test: 'header' },
        body: { test: 'body' },
        params: { test: 'param' },
        meta: { skipAuth: true },
        schema: schema,
        signal: controller.signal,
      };

      // All properties should be present except method
      expect(fullRequestOptions).toHaveProperty('headers');
      expect(fullRequestOptions).toHaveProperty('body');
      expect(fullRequestOptions).toHaveProperty('params');
      expect(fullRequestOptions).toHaveProperty('meta');
      expect(fullRequestOptions).toHaveProperty('schema');
      expect(fullRequestOptions).toHaveProperty('signal');
      expect(fullRequestOptions).not.toHaveProperty('method');
    });
  });

  describe('ZodType integration', () => {
    it('should work with Zod schemas', () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
      });

      const optionsWithSchema: HttpOptions = {
        schema: userSchema,
      };

      // Test schema validation
      const validData = { id: 1, name: 'John', email: 'john@example.com' };
      const result = userSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(1);
        expect(result.data.name).toBe('John');
      }
    });

    it('should handle different Zod schema types', () => {
      const stringSchema = z.string();
      const arraySchema = z.array(z.number());
      const unionSchema = z.union([z.string(), z.number()]);

      const optionsWithString: HttpOptions = { schema: stringSchema };
      const optionsWithArray: HttpOptions = { schema: arraySchema };
      const optionsWithUnion: HttpOptions = { schema: unionSchema };

      // Verify schemas are properly assigned
      expect(optionsWithString.schema).toBe(stringSchema);
      expect(optionsWithArray.schema).toBe(arraySchema);
      expect(optionsWithUnion.schema).toBe(unionSchema);
    });
  });

  describe('Type compatibility tests', () => {
    it('should allow interface extension', () => {
      // Test that interfaces can be extended
      interface ExtendedHttpMeta extends HttpMeta {
        customField?: string;
      }

      const extendedMeta: ExtendedHttpMeta = {
        skipAuth: true,
        customField: 'custom value',
      };

      expect(extendedMeta.skipAuth).toBe(true);
      expect(extendedMeta.customField).toBe('custom value');
    });

    it('should work in function parameters and return types', () => {
      // Test function parameter compatibility
      const processParams = (params: HttpParams): string[] => {
        return Object.keys(params);
      };

      const testParams: HttpParams = { a: 1, b: 'test' };
      const keys = processParams(testParams);
      expect(keys).toEqual(['a', 'b']);

      // Test return type compatibility
      const createResponse = (): HttpResponse<string> => ({
        data: 'test data',
        status: 200,
        headers: new Headers(),
      });

      const response = createResponse();
      expect(response.data).toBe('test data');
    });

    it('should handle optional properties correctly', () => {
      // Test that all optional properties work correctly
      const partialOptions: HttpOptions = {};
      const withSomeOptions: HttpOptions = {
        method: 'GET',
      };

      expect(partialOptions.method).toBeUndefined();
      expect(withSomeOptions.method).toBe('GET');
      expect(withSomeOptions.body).toBeUndefined();
    });
  });
});
