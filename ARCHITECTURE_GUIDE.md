# 🧩 FULL FRONTEND ARCHITECTURE GUIDE — Refactored & Extended

**Stack:** Next.js 14 (App Router) • React 18 • Recoil • Tailwind CSS 3 • TypeScript 5  
**Scope:** Frontend-only (không viết backend), giao tiếp **RESTful API** qua fetch-wrapper có **interceptor**, **loading** toàn cục & cục bộ, **module-by-feature**.

> Mục tiêu: **Clean • Scalable • Readable • Maintainable • Friendly DX**

---

## Mục lục

- [🧩 FULL FRONTEND ARCHITECTURE GUIDE — Refactored \& Extended](#-full-frontend-architecture-guide--refactored--extended)
  - [Mục lục](#mục-lục)
  - [Phạm vi \& Ràng buộc](#phạm-vi--ràng-buộc)
  - [Cây thư mục tiêu chuẩn](#cây-thư-mục-tiêu-chuẩn)
  - [Các lớp kiến trúc](#các-lớp-kiến-trúc)
    - [3.1 Routing (App Router)](#31-routing-app-router)
    - [3.2 Providers (Recoil, Bridges, Overlay)](#32-providers-recoil-bridges-overlay)
    - [3.3 State Architecture với Recoil](#33-state-architecture-với-recoil)
    - [3.4 HTTP Layer \& Interceptors](#34-http-layer--interceptors)
    - [3.5 Loading Strategy](#35-loading-strategy)
  - [Module-by-Feature chi tiết](#module-by-feature-chi-tiết)
    - [4.1 Template tạo module](#41-template-tạo-module)
    - [4.2 Module Auth](#42-module-auth)
    - [4.3 Module Users (CRUD)](#43-module-users-crud)
    - [4.4 Module Products (paging + filter)](#44-module-products-paging--filter)
  - [Error Handling \& UX Patterns](#error-handling--ux-patterns)
  - [ENV, Config \& Secrets](#env-config--secrets)
  - [Styling \& UI Conventions (Tailwind)](#styling--ui-conventions-tailwind)
  - [Performance Guide](#performance-guide)
  - [Accessibility Checklist](#accessibility-checklist)
  - [Testing Strategy](#testing-strategy)
  - [Code Quality \& CI](#code-quality--ci)
  - [Gitflow, PR \& Review Checklist](#gitflow-pr--review-checklist)
  - [ADRs (Architecture Decision Records)](#adrs-architecture-decision-records)
  - [Troubleshooting](#troubleshooting)
  - [Phụ lục: Snippets \& Lệnh nhanh](#phụ-lục-snippets--lệnh-nhanh)

---

## Phạm vi & Ràng buộc

- **Frontend-only**: không triển khai backend trong repo này.
- Giao tiếp **RESTful API**: mọi request đi qua `shared/lib/http.ts` (fetch-wrapper) với **interceptors**.
- **Bảo mật front**: không lưu secrets lâu dài; token chỉ trong Recoil (có thể thêm sessionStorage).
- **Module-by-feature**: mỗi domain độc lập về UI/State/Service/Types.
- **App Router**: tận dụng `loading.tsx`, `layout.tsx`, route groups `(public)/(protected)`.

---

## Cây thư mục tiêu chuẩn

```txt
.
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  ├─ (protected)/
│  │  ├─ layout.tsx
│  │  ├─ loading.tsx
│  │  └─ globals.css
│  ├─ features/
│  │  ├─ auth/
│  │  │  ├─ api/
│  │  │  ├─ hooks/
│  │  │  ├─ model/            # atoms, schemas, selectors
│  │  │  └─ ui/
│  │  ├─ users/
│  │  └─ products/
│  ├─ shared/
│  │  ├─ components/
│  │  │  ├─ system/           # LoadingOverlay, HttpLoadingBridge...
│  │  │  ├─ ui/               # Button, Input, Modal...
│  │  │  └─ layout/           # Header, Sidebar...
│  │  ├─ hooks/
│  │  ├─ lib/                 # http client, interceptors, bridges, env...
│  │  ├─ state/               # global atoms/selectors
│  │  └─ utils/
│
├─ docs/
├─ public/
├─ styles/                    # optional
├─ .env.local
├─ tailwind.config.ts
├─ next.config.js
├─ tsconfig.json
└─ package.json
```

---

## Các lớp kiến trúc

### 3.1 Routing (App Router)

- **Route Groups**:
  - `(public)` cho màn hình không yêu cầu login (Home, Login).
  - `(protected)` bọc **AuthGuard** để chặn truy cập nếu chưa đăng nhập.
- **`loading.tsx`**: skeleton/loader cho từng segment & global (`app/loading.tsx`).

### 3.2 Providers (Recoil, Bridges, Overlay)

**`app/layout.tsx` (rút gọn)**

- Bọc **Recoil Root** (dạng bridge)
- Khởi tạo **RouterBridge** (điều hướng từ http layer)
- Gắn **HttpLoadingBridge** (lắng nghe sự kiện start/end từ http)
- Hiển thị **LoadingOverlay** dựa trên Recoil selector

```tsx
import './globals.css';
import { ReactNode } from 'react';
import { AppRecoilRoot } from '@/shared/lib/recoil-bridge';
import { RouterBridge } from '@/shared/lib/router-bridge';
import HttpLoadingBridge from '@/shared/components/system/HttpLoadingBridge';
import LoadingOverlay from '@/shared/components/system/LoadingOverlay';
import '@/shared/lib/http.interceptors';

export const metadata = { title: 'App', description: 'Frontend Only' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AppRecoilRoot>
          <RouterBridge />
          <HttpLoadingBridge />
          <LoadingOverlay />
          {children}
        </AppRecoilRoot>
      </body>
    </html>
  );
}
```

### 3.3 State Architecture với Recoil

- **Feature state** tại `features/<feature>/model/`:
  - `*.atoms.ts`: nguồn dữ liệu.
  - `*.selectors.ts`: dữ liệu dẫn xuất (lọc, tính toán).
- **Global UI state** tại `shared/state/` (ví dụ: bộ đếm global loading).
- Không gọi API trong atoms/selectors; **API chỉ ở services**.

### 3.4 HTTP Layer & Interceptors

- **Quy tắc vàng**: Mọi API call → `shared/lib/http/http.client.ts`.
- Tính năng trong wrapper:
  - **Interceptors**: request (gắn `Authorization`), response (xử lý `401`, retry).
  - **Retry** lỗi mạng/5xx với `meta.retry`, `meta.retryDelayMs`.
  - **Loading events**: phát `start/end` để Overlay biết trạng thái.
  - **Tùy chọn**: `meta.skipAuth`, `meta.showGlobalLoading`.

**Luồng chuẩn (ASCII sequence):**

```
UI -> hook -> service -> http(path, options.meta)
http -> requestInterceptors -> fetch -> responseInterceptors
  -> (401) clear token + redirect('/login')
  -> (5xx/network) retry (n lần)
  -> trả dữ liệu JSON/text về hook -> UI
```

### 3.5 Loading Strategy

- **Route-level**: `app/(segment)/loading.tsx` + `app/loading.tsx`.
- **Global overlay**: do `http()` tự phát sự kiện → Recoil counter → Overlay.
- **Local loading**: dùng `useState` ở Form/Nút; ưu tiên cho thao tác nhỏ.

---

## Feature-by-Module chi tiết

### 4.1 Template tạo feature

```txt
features/<feature>/
├─ api/               # http() duy nhất ở đây
├─ hooks/             # orchestration: gọi api + map state
├─ model/             # atoms, selectors, schemas, DTO
├─ ui/                # UI stateless
└─ pages/ (optional)  # guard/wrapper riêng
```

**Quy ước:**

- Không gọi `fetch` trong component/hook → chỉ gọi `http()` trong `api`.
- DTO (API) ≠ ViewModel (UI). Map ở hook/service.
- Xử lý lỗi ở hook; UI chỉ hiển thị.

---

### 4.2 Module Auth

**Types**

```ts
export type AuthUser = { id: string; email: string; name?: string; avatarUrl?: string };
export type LoginPayload = { email: string; password: string };
export type LoginResponse = { accessToken: string; expiresIn?: number };
```

**State**

```ts
export const authTokenState = atom<string | null>({
  key: 'authTokenState',
  default: null,
});
export const authUserState = atom<AuthUser | null>({
  key: 'authUserState',
  default: null,
});
```

**Services**

```ts
export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  return http('/auth/login', { method: 'POST', body: payload, meta: { skipAuth: true } });
}
export async function meApi(token: string) {
  return http('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
}
```

**Hook**

```ts
export function useAuth() {
  // đăng ký token getter cho http layer
  // login(): gọi loginApi -> set token -> gọi meApi -> set user
  // logout(): clear token + user
}
```

**Guard**

```tsx
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // nếu chưa login => router.replace('/login'), return null
  return <>{children}</>;
}
```

---

### 4.3 Module Users (CRUD)

**Types**

```ts
export type UserDTO = { id: string; name: string; email: string; avatar?: string };
export type CreateUserPayload = { name: string; email: string };
export type UpdateUserPayload = { name?: string; email?: string };
```

**State**

```ts
export const usersState = atom<UserDTO[]>({ key: 'usersState', default: [] });
```

**Services**

```ts
export async function fetchUsers() {
  return http('/users', { meta: { retry: 2, retryDelayMs: 400 } });
}
export async function createUser(p: CreateUserPayload) {
  return http('/users', { method: 'POST', body: p });
}
export async function updateUser(id: string, p: UpdateUserPayload) {
  return http(`/users/${id}`, { method: 'PATCH', body: p });
}
export async function deleteUser(id: string) {
  return http(`/users/${id}`, { method: 'DELETE' });
}
```

**Hook (highlights)**

- `useEffect` load users một lần, set `loading/error`.
- **Search filter** bằng `useMemo`.
- **Optimistic update** khi xoá: cập nhật list, nếu lỗi thì rollback.

**UI**

- `UserForm` (create): local loading + hiển thị lỗi.
- `UserCard` (rename/xoá): optimistic; disable khi saving.
- `UserList` (filter + grid).

---

### 4.4 Module Products (paging + filter)

**Types**

```ts
export type ProductDTO = {
  id: string;
  name: string;
  price: number;
  status?: 'active' | 'archived';
};
export type ProductQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: 'active' | 'archived' | 'all';
};
export type ProductPage = {
  items: ProductDTO[];
  total: number;
  page: number;
  pageSize: number;
};
```

**State**

```ts
export const productQueryState = atom<ProductQuery>({
  key: 'productQueryState',
  default: { page: 1, pageSize: 12, status: 'all', keyword: '' },
});
export const productPageState = atom<ProductPage>({
  key: 'productPageState',
  default: { items: [], total: 0, page: 1, pageSize: 12 },
});
```

**Services**

```ts
export async function fetchProducts(q: ProductQuery) {
  const params = new URLSearchParams();
  if (q.page) params.set('page', String(q.page));
  if (q.pageSize) params.set('pageSize', String(q.pageSize));
  if (q.keyword) params.set('keyword', q.keyword);
  if (q.status && q.status !== 'all') params.set('status', q.status);
  return http(`/products?${params.toString()}`);
}
```

**Hook**

- Theo dõi `query` → fetch lại `pageData`.
- API error → set thông báo thân thiện.
- Expose actions: `setPage`, `setPageSize`, `setKeyword`, `setStatus`.

**UI**

- Input search, select status, grid items, pagination buttons.

---

## Error Handling & UX Patterns

- **Thông báo lỗi ngắn gọn** (“Không tải được dữ liệu, thử lại sau.”); chi tiết log chỉ ở dev.
- **Form**: show error dưới field; disable nút khi đang submit; `aria-busy`.
- **Optimistic UI**: luôn kèm rollback khi thao tác có rủi ro.
- **401**: interceptor tự redirect `/login` + xoá token/user.
- **5xx/Network**: bật **retry**; nếu thất bại hiển thị “Thử lại”.

---

## ENV, Config & Secrets

- `.env.local`

  ```env
  NEXT_PUBLIC_API_BASE_URL=https://api.example.com
  ```

- **Chỉ** biến dùng trên client mới có prefix `NEXT_PUBLIC_`.
- Không commit secrets. Validate sơ bộ ở `shared/lib/env.ts` (nếu muốn).

---

## Styling & UI Conventions (Tailwind)

- Content scan trong `tailwind.config.ts`: `src/app/**/*`, `src/features/**/*`, `src/shared/**/*`.
- **Component nhỏ, tái sử dụng**: để ở `shared/components/ui/`.
- **Layout**: Header/Sidebar/Footer ở `shared/components/layout/`.
- **Focus ring** mặc định (`focus:ring-2`) cho input/nút; đủ tương phản.

---

## Performance Guide

- API động: `cache: 'no-store'`.
- Tách component để giảm re-render; `useMemo`/`useCallback` hợp lý.
- Ưu tiên **local loading** với thao tác nhỏ.
- Ảnh: cấu hình `next/image` + `remotePatterns` trong `next.config.js`.

---

## Accessibility Checklist

- Input có `<label>`/`aria-label`.
- Nút khi loading có `aria-busy`.
- Skeleton/loader có fallback text.
- Đảm bảo tab order & focus rõ ràng.

---

## Testing Strategy

- **Unit**: services (mock `fetch`), utils, selectors.
- **Component**: RTL cho form/list/card; test interaction & render condition.
- **E2E**: Playwright/Cypress cho luồng chính (login → dashboard).

Cây ví dụ:

```txt
__tests__/
  features/
    users/
      users.api.test.ts
      useUsers.test.tsx
      UserList.test.tsx
```

---

## Code Quality & CI

- **ESLint** (import/order, no-floating-promises), **Prettier** (singleQuote, trailingComma).
- Scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "test": "vitest run"
  }
}
```

- CI: chạy `typecheck`, `lint`, `test` trước merge.

---

## Gitflow, PR & Review Checklist

- **Conventional Commits**:
  - `feat(users): add user table`
  - `fix(auth): handle 401`
  - `refactor(shared): split http interceptors`
- **Checklist PR**:
  - [ ] Types đầy đủ, không `any` không cần thiết
  - [ ] Không gọi `fetch` trực tiếp, chỉ `http()`
  - [ ] Loading UX hợp lý (route/global/local)
  - [ ] Error message rõ ràng
  - [ ] `pnpm typecheck && pnpm lint && pnpm test` pass

---

## ADRs (Architecture Decision Records)

| ID      | Quyết định               | Lý do                                    |
| ------- | ------------------------ | ---------------------------------------- |
| ADR-001 | Dùng **Recoil**          | Gọn, linh hoạt cho client components     |
| ADR-002 | **Module-by-feature**    | Tăng tính sở hữu code, dễ scale team     |
| ADR-003 | **Custom fetch wrapper** | Giảm phụ thuộc Axios, phù hợp App Router |

---

## Troubleshooting

- **Luôn redirect về /login** dù đã login?  
  → Kiểm tra interceptor 401, token getter (đã `registerTokenGetter` chưa?).
- **Overlay không tắt**?  
  → Kiểm tra `HttpLoadingBridge` + Recoil counter (có `emitEnd()` mọi nhánh?).
- **CORS lỗi**?  
  → Thuộc backend. Frontend chỉ gửi `Authorization` chuẩn.
- **Retry không hoạt động**?  
  → Xem `meta.retry`, `meta.retryDelayMs`, chỉ áp dụng 5xx/network.

---

## Phụ lục: Snippets & Lệnh nhanh

**Loading toàn cục**

```tsx
// http call mặc định show overlay
await http('/users');
// Ẩn overlay (tự show spinner cục bộ)
await http('/users', { meta: { showGlobalLoading: false } });
```

**Retry**

```ts
await http('/users', { meta: { retry: 2, retryDelayMs: 400 } });
```

**Bỏ Auth header (login/refresh)**

```ts
await http('/auth/login', { method: 'POST', body: payload, meta: { skipAuth: true } });
```

**Route-level Loading**

```tsx
// app/(protected)/dashboard/loading.tsx
export default function DashboardLoading() {
  return <div className="animate-pulse p-6">Đang tải Dashboard…</div>;
}
```

**Guard**

```tsx
'use client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
```
