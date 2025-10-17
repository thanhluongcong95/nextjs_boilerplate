# 🧩 FULL FRONTEND ARCHITECTURE GUIDE v2.0 – Enterprise Ready

**Stack:** Next.js 14 (App Router) • React 18 • Recoil • Tailwind CSS 3 • TypeScript 5 • Zod • Vitest • MSW  
**Scope:** Frontend-only with RESTful API, Type-safe, Test-covered, Production-ready

> v2.0 Goals: Clean • Scalable • Type-Safe • Testable • Performant • Maintainable

---

## 📚 Table of Contents (Extended)

1. [Scope & Constraints](#1-scope--constraints)
2. [Improved Project Structure](#2-improved-project-structure)
3. [Type Safety Strategy](#3-type-safety-strategy)
4. [HTTP Layer & Error Handling](#4-http-layer--error-handling)
5. [State Management Pattern](#5-state-management-pattern)
6. [Module Architecture Chi tiết](#6-module-architecture-chi-tiet)
7. [Testing Strategy (Complete)](#7-testing-strategy-complete)
8. [Performance Optimization](#8-performance-optimization)
9. [Error Boundaries & Monitoring](#9-error-boundaries--monitoring)
10. [Code Quality & Automation](#10-code-quality--automation)
11. [Migration Guide](#11-migration-guide)
12. [Troubleshooting & FAQ](#12-troubleshooting--faq)

---

## 1. Scope & Constraints

### ✅ What’s Included

- ✨ **Type-safe API layer** with Zod validation
- 🧪 **Test coverage ≥80%** with Vitest + MSW
- ⚡ **Performance monitoring** with bundle analyzer
- 🚨 **Error tracking** with Sentry integration
- 📦 **Module lazy loading** and code splitting
- 🎯 **Accessibility** WCAG 2.1 AA compliant

### ❌ What’s NOT Included

- Backend implementation
- GraphQL/tRPC support (REST only)
- Server-side auth (client-side token only)
- Real-time features (WebSocket)

---

## 2. Improved Project Structure

```txt
.
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── login/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   ├── (protected)/
│   │   │   ├── layout.tsx                # Wrap AuthGuard + ErrorBoundary
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx             # ✨ Error boundary
│   │   │   └── products/
│   │   │       └── page.tsx
│   │   ├── error.tsx                     # Global error boundary
│   │   ├── loading.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.service.test.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useAuth.test.tsx
│   │   │   ├── model/
│   │   │   │   ├── auth.atoms.ts
│   │   │   │   ├── auth.selectors.ts
│   │   │   │   ├── auth.types.ts
│   │   │   │   └── auth.schemas.ts      # ✨ Zod schemas
│   │   │   └── ui/
│   │   │       ├── AuthGuard.tsx
│   │   │       └── LoginForm.tsx
│   │   ├── users/
│   │   │   ├── api/
│   │   │   │   └── users.service.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useUsers.ts
│   │   │   │   └── useUserMutations.ts  # ✨ Separate query vs mutation
│   │   │   ├── model/
│   │   │   │   ├── users.atoms.ts
│   │   │   │   └── users.schemas.ts
│   │   │   └── ui/
│   │   │       ├── UserList.tsx
│   │   │       ├── UserList.test.tsx
│   │   │       ├── UserCard.tsx
│   │   │       └── UserForm.tsx
│   │   └── products/
│   │       ├── api/
│   │       │   └── products.service.ts
│   │       ├── hooks/
│   │       │   └── useProducts.ts
│   │       ├── model/
│   │       │   ├── products.atoms.ts
│   │       │   └── products.schemas.ts
│   │       └── ui/
│   │           ├── ProductList.tsx
│   │           └── ProductCard.tsx
│   ├── shared/
│   │   ├── components/
│   │   │   ├── system/
│   │   │   │   ├── ErrorBoundary.tsx     # ✨ Class component
│   │   │   │   ├── LoadingOverlay.tsx
│   │   │   │   └── HttpLoadingBridge.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   └── Button.stories.tsx # ✨ Storybook
│   │   │   │   ├── Input/
│   │   │   │   └── Modal/
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Footer.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts            # ✨ Performance hook
│   │   │   ├── useIntersectionObserver.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useMediaQuery.ts
│   │   ├── lib/
│   │   │   ├── http/
│   │   │   │   ├── http.client.ts        # ✨ Main client
│   │   │   │   ├── http.interceptors.ts
│   │   │   │   ├── http.types.ts
│   │   │   │   └── http.test.ts
│   │   │   ├── validation/
│   │   │   │   ├── schemas.ts            # Common Zod schemas
│   │   │   │   └── validators.ts
│   │   │   ├── errors/
│   │   │   │   ├── AppError.ts           # ✨ Custom error class
│   │   │   │   ├── error-codes.ts
│   │   │   │   └── error-handler.ts
│   │   │   ├── monitoring/
│   │   │   │   ├── sentry.ts             # ✨ Sentry setup
│   │   │   │   └── analytics.ts
│   │   │   ├── recoil-bridge.tsx
│   │   │   ├── router-bridge.tsx
│   │   │   └── env.ts                    # ✨ Validate env vars
│   │   ├── state/
│   │   │   ├── loading.atoms.ts
│   │   │   └── ui.atoms.ts
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   ├── date.ts
│   │   │   └── array.ts
│   │   └── constants/
│   │       ├── api.ts
│   │       └── routes.ts
│
├── public/
│   └── assets/
│
├── __tests__/                        # ✨ Integration tests
│   ├── setup.ts
│   ├── mocks/
│   │   ├── handlers.ts               # MSW handlers
│   │   └── data.ts
│   └── e2e/
│       └── auth.spec.ts              # Playwright
│
├── .storybook/                       # ✨ Storybook config
│   ├── main.ts
│   └── preview.tsx
│
├── docs/                             # ✨ Documentation
│   ├── ADRs/
│   │   ├── 001-recoil-vs-redux.md
│   │   └── 002-testing-strategy.md
│   └── guides/
│       └── new-module.md
│
├── .env.local
├── .env.example
├── vitest.config.ts                  # ✨ Test config
├── playwright.config.ts
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 3. Type Safety Strategy

### 3.1 Zod Schemas for API Validation

```typescript
// shared/lib/validation/schemas.ts
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
});

// Utility to parse and validate
export function parseApiResponse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError('Invalid API response', result.error.errors);
  }
  return result.data;
}
```

### 3.2 Feature Types với Zod

```typescript
// features/auth/model/auth.schemas.ts
import { z } from 'zod';
import { emailSchema, passwordSchema } from '@/shared/lib/validation/schemas';

// Schemas
export const loginPayloadSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number().optional(),
});

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(['admin', 'user']).default('user'),
});

// Types từ schemas (single source of truth)
export type TLoginPayload = z.infer<typeof loginPayloadSchema>;
export type TLoginResponse = z.infer<typeof loginResponseSchema>;
export type TAuthUser = z.infer<typeof authUserSchema>;

// ViewModel can extend
export type TAuthUserVM = TAuthUser & {
  displayName: string; // computed
};
```

### 3.3 Generic HTTP Client

```typescript
// shared/lib/http/http.types.ts
import { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpMeta = {
  skipAuth?: boolean;
  showGlobalLoading?: boolean;
  retry?: number;
  retryDelayMs?: number;
  timeout?: number;
};

export type HttpOptions<T = unknown> = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  meta?: HttpMeta;
  schema?: z.ZodType<T>; // ✨ Optional Zod schema
};

export type HttpResponse<T> = { data: T; status: number; headers: Headers };
```

```typescript
// shared/lib/http/http.client.ts
import { parseApiResponse } from '@/shared/lib/validation/schemas';
import type { HttpOptions, HttpResponse } from './http.types';
import { AppError, ErrorCode } from '@/shared/lib/errors/AppError';

export async function http<T = unknown>(
  path: string,
  options: HttpOptions<T> = {}
): Promise<T> {
  const { schema, meta = {}, ...fetchOptions } = options;

  // ... existing interceptor logic ...

  try {
    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      throw new AppError(ErrorCode.SERVER_ERROR, 'API request failed', response.status);
    }

    const rawData = await response.json();

    // ✨ Validate with Zod if schema provided
    if (schema) {
      return parseApiResponse(schema, rawData);
    }

    return rawData as T;
  } catch (error) {
    // ... error handling ...
  }
}
```

### 3.4 Service Layer với Type Safety

```typescript
// features/auth/api/auth.service.ts
import { http } from '@/shared/lib/http/http.client';
import type { TAuthUser, TLoginPayload, TLoginResponse } from '../model/auth.schemas';
import {
  loginPayloadSchema,
  loginResponseSchema,
  authUserSchema,
} from '../model/auth.schemas';

export const authService = {
  async login(payload: TLoginPayload): Promise<TLoginResponse> {
    // Validate input
    const validPayload = loginPayloadSchema.parse(payload);

    // API call với schema validation
    return http<TLoginResponse>('/auth/login', {
      method: 'POST',
      body: validPayload,
      schema: loginResponseSchema, // ✨ Runtime validation
      meta: { skipAuth: true },
    });
  },

  async getMe(token: string): Promise<TAuthUser> {
    return http<TAuthUser>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      schema: authUserSchema,
    });
  },

  async refreshToken(refreshToken: string): Promise<TLoginResponse> {
    return http<TLoginResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      schema: loginResponseSchema,
      meta: { skipAuth: true },
    });
  },
};
```

---

## 4. HTTP Layer & Error Handling

### 4.1 Custom Error Classes

```typescript
// shared/lib/errors/error-codes.ts
export enum ErrorCode
// Network

// Validation

// Auth

// Client

// Server

// Unknown

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: "Can't connect. Please check your network.",
  [ErrorCode.TIMEOUT_ERROR]: 'Request timed out.',
  [ErrorCode.VALIDATION_ERROR]: 'Invalid data.',
  [ErrorCode.UNAUTHORIZED]: 'Session expired. Please sign in again.',
  [ErrorCode.FORBIDDEN]: "You don't have permission to perform this action.",
  [ErrorCode.NOT_FOUND]: 'Resource not found.',
  [ErrorCode.BAD_REQUEST]: 'Bad request.',
  [ErrorCode.SERVER_ERROR]: 'Server error. Please try again later.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is under maintenance.',
  [ErrorCode.UNKNOWN_ERROR]: 'An error occurred.',
};
```

```typescript
// shared/lib/errors/AppError.ts
import { ErrorCode, ERROR_MESSAGES } from './error-codes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode?: number;
  public readonly details?: unknown;
  public readonly timestamp: string;

  constructor(code: ErrorCode, message?: string, statusCode?: number, details?: unknown) {
    super(message || ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
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
```

### 4.2 Error Handler Utility

```typescript
// shared/lib/errors/error-handler.ts
import { AppError, ErrorCode } from './AppError';
import * as Sentry from '@sentry/nextjs';

export function handleError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Network/Fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError(ErrorCode.NETWORK_ERROR);
  }

  // Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', 400, error);
  }

  // Generic Error
  if (error instanceof Error) {
    Sentry.captureException(error);
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, undefined, {
      originalError: error,
    });
  }

  // Unknown error type
  Sentry.captureException(new Error('Unknown error type'), { extra: { error } });
  return new AppError(ErrorCode.UNKNOWN_ERROR);
}

export function isRetryableError(error: AppError): boolean {
  return [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE,
  ].includes(error.code);
}
```

### 4.3 HTTP Interceptors với Error Handling

```typescript
// shared/lib/http/http.interceptors.ts
import { handleError, isRetryableError } from '@/shared/lib/errors/error-handler';
import { ErrorCode } from '@/shared/lib/errors/error-codes';
import { getRouter } from '@/shared/lib/router-bridge';

// Token getter registry
let tokenGetter: (() => string | null) | null = null;

export function registerTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

// Request interceptor
export async function requestInterceptor(
  url: string,
  options: RequestInit,
  meta: HttpMeta
): Promise<[string, RequestInit]> {
  const headers = new Headers(options.headers);

  // Add auth token
  if (!meta.skipAuth && tokenGetter) {
    const token = tokenGetter();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Add common headers
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  return [url, { ...options, headers }];
}

// Response interceptor
export async function responseInterceptor(
  response: Response,
  meta: HttpMeta,
  attempt: number = 0
): Promise<Response> {
  // Handle 401 Unauthorized
  if (response.status === 401) {
    const router = getRouter();
    if (router) {
      // Clear auth state (implement in auth module)
      router.replace('/login');
    }
    throw new AppError(ErrorCode.UNAUTHORIZED, undefined, 401);
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    throw new AppError(ErrorCode.FORBIDDEN, undefined, 403);
  }

  // Handle 404 Not Found
  if (response.status === 404) {
    throw new AppError(ErrorCode.NOT_FOUND, undefined, 404);
  }

  // Handle 5xx Server Errors with retry
  if (response.status >= 500) {
    const maxRetries = meta.retry || 0;
    if (attempt < maxRetries && isRetryableError) {
      const delay = meta.retryDelayMs || 1000;
      await sleep(delay * (attempt + 1)); // Exponential backoff
      // Re-fetch (caller should handle)
      throw new AppError(ErrorCode.SERVER_ERROR, 'Retry needed', response.status);
    }
    throw new AppError(ErrorCode.SERVER_ERROR, undefined, response.status);
  }

  return response;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 5. State Management Pattern

### 5.1 Atom Family Pattern

```typescript
// features/users/model/users.atoms.ts
import { atom, atomFamily, selectorFamily } from 'recoil';
import type { TUser } from './users.schemas';

// List state
export const usersListState = atom<TUser[]>({ key: 'users/list', default: [] });

// Individual user cache (by ID)
export const userByIdState = atomFamily<TUser | null, string>({
  key: 'users/byId',
  default: null,
});

// Loading states
export const usersLoadingState = atom<boolean>({ key: 'users/loading', default: false });

// Selector for filtered users
export const filteredUsersSelector = selectorFamily<TUser[], string>({
  key: 'users/filtered',
  get:
    (searchTerm: string) =>
    ({ get }) => {
      const users = get(usersListState);
      if (!searchTerm) return users;

      const term = searchTerm.toLowerCase();
      return users.filter(
        user =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    },
});
```

### 5.2 Async Selector Pattern

```typescript
// features/users/model/users.selectors.ts
import { selector, selectorFamily } from 'recoil';
import { userService } from '../api/users.service';
import type { TUser } from './users.schemas';

// Fetch user by ID (with caching)
export const userQuery = selectorFamily<TUser, string>({
  key: 'users/query',
  get: (userId: string) => async () => {
    return await userService.getById(userId);
  },
});

// Stats selector
export const userStatsSelector = selector({
  key: 'users/stats',
  get: ({ get }) => {
    const users = get(usersListState);
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
    };
  },
});
```

---

## 6. Module Architecture Details

### 6.1 Barrel Exports

```typescript
// features/auth/index.ts
// Components
export { LoginForm } from './ui/LoginForm';
export { AuthGuard } from './ui/AuthGuard';

// Hooks
export { useAuth } from './hooks/useAuth';

// Types
export type { TLoginPayload, TLoginResponse, TAuthUser } from './model/auth.schemas';

// State (re-export if needed externally)
export { authTokenState, authUserState } from './model/auth.atoms';

// Services (usually not exported)
// export { authService } from './api/auth.service';
```

### 6.2 Custom Hooks Pattern

```typescript
// features/users/hooks/useUsers.ts
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { usersListState, usersLoadingState } from '../model/users.atoms';
import { userService } from '../api/users.service';
import { handleError } from '@/shared/lib/errors/error-handler';
import { useToast } from '@/shared/hooks/useToast';

export function useUsers() {
  const [users, setUsers] = useRecoilState(usersListState);
  const [loading, setLoading] = useRecoilState(usersLoadingState);
  const { showError } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      const appError = handleError(error);
      showError(appError.message);
    } finally {
      setLoading(false);
    }
  }

  return { users, loading, refetch: fetchUsers };
}
```

```typescript
// features/users/hooks/useUserMutations.ts
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { usersListState } from '../model/users.atoms';
import { userService } from '../api/users.service';
import type { TCreateUserPayload, TUpdateUserPayload } from '../model/users.schemas';

export function useUserMutations() {
  const setUsers = useSetRecoilState(usersListState);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function createUser(payload: TCreateUserPayload) {
    setCreating(true);
    try {
      const newUser = await userService.create(payload);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } finally {
      setCreating(false);
    }
  }

  async function updateUser(id: string, payload: TUpdateUserPayload) {
    setUpdating(true);
    try {
      const updated = await userService.update(id, payload);
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      return updated;
    } finally {
      setUpdating(false);
    }
  }

  async function deleteUser(id: string) {
    setDeleting(true);
    // Optimistic update
    setUsers(prev => prev.filter(u => u.id !== id));

    try {
      await userService.delete(id);
    } catch (error) {
      // Rollback on error
      const allUsers = await userService.getAll();
      setUsers(allUsers);
      throw error;
    } finally {
      setDeleting(false);
    }
  }

  return {
    createUser,
    updateUser,
    deleteUser,
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
  };
}
```

---

## 7. Testing Strategy (Complete)

### 7.1 Test Setup với Vitest + MSW

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/features/**/*.{ts,tsx}', 'src/shared/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.stories.tsx', '**/types/**', '**/*.d.ts'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

```typescript
// __tests__/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// MSW setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
```

### 7.2 MSW Handlers

```typescript
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockUsers, mockAuthUser } from './data';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({ accessToken: 'mock-token-12345', expiresIn: 3600 });
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.get(`${API_BASE}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(mockAuthUser);
  }),

  // Users endpoints
  http.get(`${API_BASE}/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 10;
    const keyword = url.searchParams.get('keyword') || '';

    let filtered = mockUsers;
    if (keyword) {
      filtered = mockUsers.filter(
        u =>
          u.name.toLowerCase().includes(keyword.toLowerCase()) ||
          u.email.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return HttpResponse.json({
      items: filtered.slice(start, end),
      total: filtered.length,
      page,
      pageSize,
    });
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json(user);
  }),

  http.post(`${API_BASE}/users`, async ({ request }) => {
    const body = await request.json();
    const newUser = {
      id: `user-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.patch(`${API_BASE}/users/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({ ...user, ...body });
  }),

  http.delete(`${API_BASE}/users/:id`, ({ params }) => {
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  // Error simulation endpoints
  http.get(`${API_BASE}/error/500`, () => {
    return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }),

  http.get(`${API_BASE}/error/network`, () => {
    return HttpResponse.error();
  }),
];
```

```typescript
// __tests__/mocks/data.ts
import type { TAuthUser } from '@/features/auth/model/auth.schemas';
import type { TUser } from '@/features/users/model/users.schemas';

export const mockAuthUser: TAuthUser = {
  id: 'auth-user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: 'https://i.pravatar.cc/150?u=test',
  role: 'user',
};

export const mockUsers: TUser[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'user-3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'inactive',
    createdAt: '2024-01-03T00:00:00Z',
  },
];
```

```typescript
// __tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 7.3 Unit Tests - Services

```typescript
// features/auth/api/auth.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import { http } from '@/shared/lib/http/http.client';
import type { TLoginPayload } from '../model/auth.schemas';

vi.mock('@/shared/lib/http/http.client');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = { accessToken: 'mock-token', expiresIn: 3600 };

      vi.mocked(http).mockResolvedValue(mockResponse);

      const payload: TLoginPayload = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(payload);

      expect(http).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: payload,
        schema: expect.any(Object),
        meta: { skipAuth: true },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw validation error for invalid email', async () => {
      const payload = { email: 'invalid-email', password: 'password123' };

      await expect(authService.login(payload as any)).rejects.toThrow();
    });

    it('should throw error on network failure', async () => {
      vi.mocked(http).mockRejectedValue(new Error('Network error'));

      const payload: TLoginPayload = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(authService.login(payload)).rejects.toThrow('Network error');
    });
  });

  describe('getMe', () => {
    it('should fetch user profile', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
      };

      vi.mocked(http).mockResolvedValue(mockUser);

      const result = await authService.getMe('mock-token');

      expect(http).toHaveBeenCalledWith('/auth/me', {
        headers: { Authorization: 'Bearer mock-token' },
        schema: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });
  });
});
```

### 7.4 Hook Tests

```typescript
// features/auth/hooks/useAuth.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { useAuth } from './useAuth';
import { authService } from '../api/auth.service';
import type { ReactNode } from 'react';

vi.mock('../api/auth.service');

const wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    const mockLoginResponse = {
      accessToken: 'mock-token',
      expiresIn: 3600,
    };
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user' as const,
    };

    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);
    vi.mocked(authService.getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe('mock-token');
    });
  });

  it('should handle login error', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new Error('Invalid credentials')
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login({
          email: 'wrong@example.com',
          password: 'wrong',
        });
      })
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should logout and clear state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Set initial state
    await act(async () => {
      vi.mocked(authService.login).mockResolvedValue({
        accessToken: 'token',
        expiresIn: 3600,
      });
      vi.mocked(authService.getMe).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'user',
      });
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### 7.5 Component Tests

```typescript
// features/auth/ui/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { LoginForm } from './LoginForm';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth');

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('should render login form', () => {
    render(
      <RecoilRoot>
        <LoginForm />
      </RecoilRoot>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    mockLogin.mockResolvedValue(undefined);

    render(
      <RecoilRoot>
        <LoginForm />
      </RecoilRoot>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show validation errors for empty fields', async () => {
    render(
      <RecoilRoot>
        <LoginForm />
      </RecoilRoot>
    );

  const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should disable submit button during loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <RecoilRoot>
        <LoginForm />
      </RecoilRoot>
    );

  const submitButton = screen.getByRole('button', { name: /processing/i });
    expect(submitButton).toBeDisabled();
  });

  it('should display error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <RecoilRoot>
        <LoginForm />
      </RecoilRoot>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

### 7.6 Integration Tests với MSW

```typescript
// features/users/__tests__/users-integration.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { UserList } from '../ui/UserList';

describe('Users Integration', () => {
  it('should fetch and display users', async () => {
    render(
      <RecoilRoot>
        <UserList />
      </RecoilRoot>
    );

    // Loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('should filter users by search term', async () => {
    render(
      <RecoilRoot>
        <UserList />
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

  const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'jane' } });

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });
});
```

### 7.7 E2E Tests với Playwright

```typescript
// __tests__/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    // Fill form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('/dashboard');

    // Verify dashboard content
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Error message should appear
    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Logout
    await page.click('button[aria-label="Logout"]');

    // Should redirect to login
    await page.waitForURL('/login');
  });
});
```

---

## 8. Performance Optimization

### 8.1 Custom Performance Hooks

```typescript
// shared/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// shared/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react';

type Options = { threshold?: number; root?: Element | null; rootMargin?: string };

export function useIntersectionObserver(options: Options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [options.threshold, options.root, options.rootMargin]);

  return { targetRef, isIntersecting };
}
```

### 8.2 Optimized Component Pattern

```typescript
// features/products/ui/ProductCard.tsx
import { memo } from 'react';
import type { TProduct } from '../model/products.schemas';

type Props = {
  product: TProduct;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onEdit(product.id)}>Edit</button>
        <button onClick={() => onDelete(product.id)}>Delete</button>
      </div>
    </div>
  );
});
```

```typescript
// features/products/ui/ProductList.tsx
import { useMemo, useCallback } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { useDebounce } from '@/shared/hooks/useDebounce';

export function ProductList() {
  const { products, searchTerm, setSearchTerm } = useProducts();
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  // Memoize callbacks
  const handleEdit = useCallback((id: string) => {
    console.log('Edit', id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    console.log('Delete', id);
  }, []);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search products..."
      />

      <div className="grid grid-cols-3 gap-4 mt-4">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
```

### 8.3 Dynamic Imports & Code Splitting

```typescript
// app/(protected)/products/page.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ProductList = dynamic(
  () => import('@/features/products/ui/ProductList'),
  {
    loading: () => <ProductListSkeleton />,
    ssr: false, // Optional: disable SSR for this component
  }
);

export default function ProductsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}
```

### 8.4 Bundle Analyzer Setup

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  swcMinify: true,

  // Image optimization
  images: {
    domains: ['api.example.com', 'i.pravatar.cc'],
    formats: ['image/avif', 'image/webp'],
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle these on client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
});
```

```json
// package.json scripts
{ "scripts": { "analyze": "ANALYZE=true next build", "build:analyze": "pnpm analyze" } }
```

---

## 9. Error Boundaries & Monitoring

### 9.1 Error Boundary Component

```typescript
// shared/components/system/ErrorBoundary.tsx
'use client';

import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/shared/components/ui/Button';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              An error occurred
            </h2>
            <p className="text-gray-600 mb-6">
              We've recorded the issue and will fix it soon.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Chi tiết lỗi (Dev only)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleReset} variant="primary">
                Try again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
              >
                Go home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 9.2 Sentry Integration

```typescript
// shared/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,

      // Filter sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }
        return event;
      },

      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({ maskAllText: true, blockAllMedia: true }),
      ],
    });
  }
}

// Custom error logging
export function logError(error: Error, context?: Record<string, any>) {
  console.error(error);

  Sentry.captureException(error, { extra: context });
}

// Performance monitoring
export function trackPerformance(name: string, duration: number) {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name} took ${duration}ms`,
    level: 'info',
  });
}
```

```typescript
// app/layout.tsx - Initialize Sentry
import { initSentry } from '@/shared/lib/monitoring/sentry';

initSentry();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <ErrorBoundary>
          <AppRecoilRoot>
            {/* ... rest of providers */}
            {children}
          </AppRecoilRoot>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 9.3 Global Error Handler

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { logError } from '@/shared/lib/monitoring/sentry';
import { Button } from '@/shared/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, { digest: error.digest });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

---

## 10. Code Quality & Automation

### 10.1 ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-floating-promises': 'error',

    // Import ordering
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-duplicates': 'error',

    // React
    'react/self-closing-comp': 'error',
    'react/jsx-boolean-value': ['error', 'never'],
    'react-hooks/exhaustive-deps': 'warn',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
    },
  },
};
```

### 10.2 Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 90,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
};
```

### 10.3 Husky + Lint-staged

```json
// package.json
{
  "scripts": { "prepare": "husky install" },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
pnpm typecheck
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit $1
```

### 10.4 Commitlint Configuration

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Code style (formatting)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Tests
        'chore', // Maintenance
        'revert', // Revert commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      ['auth', 'users', 'products', 'shared', 'http', 'state', 'ui', 'config', 'ci'],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'header-max-length': [2, 'always', 100],
  },
};
```

### 10.5 GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Run tests
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.NEXT_PUBLIC_API_BASE_URL }}

  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 11. Migration Guide

### 11.1 From v1 to v2

#### Step 1: Update Dependencies

```bash
pnpm add zod msw vitest @testing-library/react @testing-library/jest-dom
pnpm add -D @next/bundle-analyzer @sentry/nextjs
```

#### Step 2: Restructure Features

```bash
# Old structure
modules/auth/services/auth.api.ts

# New structure (add schemas + barrel exports)
src/features/auth/
├── api/auth.service.ts
├── model/auth.schemas.ts      # ✨ NEW
├── model/auth.atoms.ts
└── index.ts                   # ✨ NEW
```

#### Step 3: Add Zod Schemas

```typescript
// Before (v1)
export type LoginPayload = { email: string; password: string };

// After (v2)
import { z } from 'zod';

export const loginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type TLoginPayload = z.infer<typeof loginPayloadSchema>;
```

#### Step 4: Update HTTP Client

```typescript
// Before (v1)
return http('/auth/login', { method: 'POST', body: payload });

// After (v2)
return http<TLoginResponse>('/auth/login', {
  method: 'POST',
  body: payload,
  schema: loginResponseSchema, // Runtime validation
});
```

#### Step 5: Add Tests

```bash
# Create test files alongside components
touch src/features/auth/ui/LoginForm.test.tsx
touch src/features/auth/hooks/useAuth.test.tsx
touch src/features/auth/api/auth.service.test.ts
```

#### Step 6: Setup Error Boundaries

```typescript
// Wrap protected routes
// app/(protected)/layout.tsx
import { ErrorBoundary } from '@/shared/components/system/ErrorBoundary';

export default function ProtectedLayout({ children }) {
  return (
    <ErrorBoundary>
      <AuthGuard>{children}</AuthGuard>
    </ErrorBoundary>
  );
}
```

---

## 12. Troubleshooting & FAQ

### Q1: Tests fail with "Cannot find module"

**Solution:**

```typescript
// vitest.config.ts - Add path alias
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './') } },
});
```

### Q2: MSW handlers not working in tests

**Solution:**

```typescript
// __tests__/setup.ts - Ensure server is started
import { server } from './mocks/server';
import { beforeAll, afterAll, afterEach } from 'vitest';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Q3: Zod validation errors in production

**Solution:**

```typescript
// Add proper error handling
try {
  return http<T>('/api/endpoint', { schema: mySchema });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation failed:', error.errors);
    // Show user-friendly message
  }
  throw error;
}
```

### Q4: Bundle size too large

**Solutions:**

1. **Analyze bundle:**

   ```bash
   pnpm analyze
   ```

2. **Dynamic imports:**

   ```typescript
   const HeavyComponent = dynamic(() => import('./Heavy'));
   ```

3. **Tree shaking:**

   ```typescript
   // ❌ Bad
   import _ from 'lodash';

   // ✅ Good
   import debounce from 'lodash/debounce';
   ```

### Q5: Recoil state not persisting

**Solution:**

```typescript
// Use effects to sync with sessionStorage
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

export function usePersistedAuth() {
  const [token, setToken] = useRecoilState(authTokenState);

  useEffect(() => {
    const saved = sessionStorage.getItem('token');****
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
    }
  }, [token]);

  return { token, setToken };
}
```

### Q6: Type errors with generic http() function

**Solution:**

```typescript
// Explicitly provide type parameter
const users = await http<TUser[]>('/users');

// Or use type assertion with schema
const users = await http('/users', { schema: z.array(userSchema) }); // Type is automatically inferred from schema
```

### Q7: Error Boundary not catching errors

**Solution:**
Error Boundaries only catch:

- Rendering errors
- Lifecycle method errors
- Constructor errors

They DON'T catch:

- Event handler errors (use try-catch)
- Async code errors (use try-catch)
- Server-side errors

```typescript
// ❌ Not caught by Error Boundary
<button onClick={() => {
  throw new Error('Click error');
}}>
  Click
</button>

// ✅ Proper handling
<button onClick={() => {
  try {
    // risky operation
  } catch (error) {
    logError(error);
    showToast('Operation failed');
  }
}}>
  Click
</button>
```

---

## 13. Best Practices Checklist

### 🎯 Before Every PR

- [ ] All tests pass (`pnpm test`)
- [ ] Type check passes (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] No console.log (except console.warn/error)
- [ ] Coverage ≥80% for new code
- [ ] Error handling added
- [ ] Loading states implemented
- [ ] Accessibility checked (keyboard nav, ARIA)
- [ ] Mobile responsive
- [ ] Conventional commit message

### 🏗️ Architecture

- [ ] Module follows feature-based structure
- [ ] Types defined with Zod schemas
- [ ] Services use http() wrapper, not fetch
- [ ] State in Recoil atoms/selectors
- [ ] No business logic in components
- [ ] Barrel exports in index.ts
- [ ] Error boundaries wrap risky components

### ⚡ Performance

- [ ] Large lists use virtualization
- [ ] Images optimized (next/image)
- [ ] Heavy components lazy-loaded
- [ ] Search inputs debounced
- [ ] useMemo/useCallback used appropriately
- [ ] React.memo for expensive renders

### 🧪 Testing

- [ ] Unit tests for services
- [ ] Hook tests with renderHook
- [ ] Component tests with RTL
- [ ] Integration tests with MSW
- [ ] E2E tests for critical flows

### 🔒 Security

- [ ] No sensitive data in localStorage
- [ ] Tokens cleared on logout
- [ ] 401 handled globally
- [ ] CORS errors handled
- [ ] XSS prevention (sanitize inputs)
- [ ] No secrets in code/git

---

## 14. Quick Reference

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "analyze": "ANALYZE=true next build",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm test:ui          # Run tests with UI
pnpm storybook        # Open Storybook

# Testing
pnpm test             # Run all tests
pnpm test:coverage    # With coverage report
pnpm test:e2e         # Run E2E tests

# Quality Checks
pnpm typecheck        # Type checking
pnpm lint:fix         # Auto-fix lint issues
pnpm analyze          # Bundle analysis

# Production
pnpm build            # Build for production
pnpm start            # Start production server
```

### File Naming Conventions

```
ComponentName.tsx         # React component
ComponentName.test.tsx    # Component test
ComponentName.stories.tsx # Storybook story
hooks/useFeature.ts       # Custom hook
hooks/useFeature.test.ts  # Hook test
services/feature.service.ts    # Service
services/feature.service.test.ts # Service test
types/feature.types.ts    # Type definitions
types/feature.schemas.ts  # Zod schemas
state/feature.atoms.ts    # Recoil atoms
state/feature.selectors.ts # Recoil selectors
```

### Import Order Template

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { z } from 'zod';

// 2. Internal shared utilities
import { http } from '@/shared/lib/http/http.client';
import { Button } from '@/shared/components/ui/Button';

// 3. Module-specific imports
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import type { TLoginPayload } from '../types/auth.schemas';

// 4. Relative imports
import { LoginForm } from './LoginForm';
import styles from './Login.module.css';
```

---

## 15. Summary of Changes (v1 → v2)

### ✨ Major Additions

1. **Type Safety**: Zod schemas for runtime validation
2. **Testing**: Full test suite with Vitest + MSW + Playwright
3. **Error Handling**: Custom error classes + Error Boundaries + Sentry
4. **Performance**: Debounce, memo, dynamic imports, bundle analyzer
5. **Code Quality**: ESLint + Prettier + Husky + Commitlint
6. **Documentation**: Comprehensive examples for every pattern

### 🔄 Breaking Changes

- `loginApi()` → `authService.login()` (namespace pattern)
- Types: `LoginPayload` → `TLoginPayload` (prefix convention)
- HTTP client now requires explicit types: `http<T>()`
- Recoil keys: `'authTokenState'` → `'auth/token'` (namespace)

### 📈 Metrics

- **Test Coverage Target**: 80% (enforced)
- **Bundle Size Monitoring**: Enabled
- **Error Tracking**: Sentry integrated
- **CI/CD**: GitHub Actions ready
- **Type Safety**: 100% (no `any` allowed)

---

## 🎓 Learning Path

### For New Developers

1. **Week 1**: Understand project structure + Read ADRs
2. **Week 2**: Study one module (auth) deeply
3. **Week 3**: Write tests for existing feature
4. **Week 4**: Create new small module with tests

### Code Review Focus

1. **Junior**: Check tests exist + types correct
2. **Mid**: Review error handling + performance
3. **Senior**: Architecture decisions + scalability

---

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Recoil Docs](https://recoiljs.org/)
- [Zod Documentation](https://zod.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Docs](https://playwright.dev/)

---

## Additional Analysis: Strengths, Gaps, and Actionable Suggestions

### Core Strengths to Keep

- Clear modular architecture: `src/features/**` separation, barrel exports, limited leakage of details.
- End-to-end type safety: Zod as the single source of truth, attach `schema` to `http()` for runtime validation.
- Standardized HTTP layer: Types, interceptors, unified AppError/error codes, easy to extend policies.
- Error handling & monitoring: ErrorBoundary + `app/error.tsx` + Sentry (sensitive data filtered).
- Multi-layer testing: Unit + Integration (MSW) + E2E (Playwright) with coverage targets.
- Baseline performance: Debounce, memo/callback, dynamic import, bundle analyzer.
- Quality & CI: ESLint/Prettier/Husky/Commitlint/GitHub Actions + PR checklist.

### Priority Areas to Improve

- Data fetching/caching: Recoil currently holds server data → lacks cache/invalidation/stale-time.
- Incomplete auth refresh: Missing refresh interceptor (mutex/queue/replay), potential race conditions; early redirect on 401.
- Retry/recovery: Retry logic not integrated in client (throws “Retry needed”), missing backoff + jitter, not limited to idempotent methods.
- i18n: Mixed Vietnamese/English strings; no `next-intl` strategy or testing guidelines for i18n.
- Security guidance depth: Missing CSP, Trusted Types, concrete sanitization, policy for `dangerouslySetInnerHTML`, dependency audit.
- Observability: No Web Vitals/RUM; missing standard HTTP logs (method, path, status, duration, requestId/traceId), automatic breadcrumbs.
- Testing strategy: E2E basic; lacks critical journey mapping and contract tests between MSW ↔ Zod.
- Advanced performance: Missing guidance on virtualized lists, `next/image` strategy (priority/placeholder), sample bundle reports.

### Actionable Next Steps

1. Data layer: Adopt TanStack Query for server data (cache/invalidation/pagination), keep Recoil for UI/ephemeral state; standardize query keys & `staleTime`.
2. Auth flow: Add `authRefreshInterceptor` with mutex/queue + request replay; redirect only if refresh fails; store tokens in memory/sessionStorage; clear synchronously on logout.
3. HTTP retry: Integrate retry in `http()` with exponential backoff + jitter; retry only GET/HEAD/OPTIONS; log retries with breadcrumbs/metrics.
4. i18n: Use `next-intl`; extract UI strings to messages; wrap provider in tests; define key naming conventions.
5. Security: Set CSP (nonce/strict-dynamic), consider Trusted Types; use DOMPurify for dynamic HTML; ban `dangerouslySetInnerHTML` unless sanitized; enable Dependabot/audit in CI.
6. Observability: Send Web Vitals (CLS/LCP/INP) to Sentry/Analytics; standardize HTTP logs (method, route, status, duration, requestId); add automatic breadcrumbs for requests/retries.
7. Testing: Build a critical path matrix (auth, main CRUD) → stable E2E; add contract tests asserting responses match Zod schemas/MSW; reuse shared fixtures.
8. Performance: Provide virtualization (React Window) guidance for large lists; lazy-load heavy modules; standardize `next/image` usage (placeholder, priority, sizes) per page.

---

## 🎉 Conclusion

Architecture v2.0 provides:

✅ **Type-safe** API layer with runtime validation  
✅ **Comprehensive testing** strategy (80%+ coverage)  
✅ **Production-ready** error handling & monitoring  
✅ **Optimized performance** with best practices  
✅ **Developer experience** with great tooling  
✅ **Scalable structure** for teams of any size

**Next Steps:**

1. Migrate existing features to v2 patterns
2. Write tests for critical paths
3. Setup CI/CD pipeline
4. Configure Sentry for production
5. Train team on new conventions

---

Document Version: 2.0.0  
Last Updated: 2025-10-16  
Maintained by: Frontend Team  
Questions? Open an issue or ask in #frontend-arch Slack channel
