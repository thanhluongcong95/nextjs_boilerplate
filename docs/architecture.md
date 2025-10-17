# Grow Frontend Architecture & Team Guide

This document is the single source of truth for how the Grow frontend application is organised, how we build new features, and how we collaborate. Every change to conventions, folder layout, or core flow must update this guide in the same pull request.

---

## 1. Quick Start For New Contributors

1. **Install & configure**
   - `yarn install`
   - Copy `.env.example` → `.env` (or `.env.local`) and fill in secrets.
2. **Validate your environment**
   - `yarn typecheck`
   - `yarn lint`
   - `yarn test`
   - `yarn dev` and visit `http://localhost:3000/en`.
3. **Read this guide end-to-end** to understand structure, naming, and flow conventions.
4. Explore `src/shared` to familiarise yourself with providers, infra, and design system.
5. Pair with an existing team member for the first PR to confirm expectations.

---

## 2. Repository Map

```
.
├── docs/                      # Project documentation (this guide, ADRs, etc.)
├── public/                    # Static assets served by Next.js
├── src/
│   ├── app/                   # App Router entrypoints, layouts, and feature routes
│   ├── i18n/                  # Translations and locale configuration
│   └── shared/                # Design system, infra, providers, state, utilities
├── .husky/                    # Git hooks (lint-staged, commitlint)
├── jest.config.js             # Jest configuration
├── jest.setup.ts              # Testing Library configuration
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind design tokens
├── tsconfig.json              # Strict TypeScript configuration
└── package.json               # Scripts, dependencies, lint-staged rules
```

**Tooling conventions**
- Package manager: `yarn`
- Formatters: ESLint + Prettier + Tailwind plugin (`yarn lint`, `yarn format`)
- Type safety: `yarn typecheck`
- Tests: `yarn test` (watchless)
- Analyze bundle: `yarn analyze` (set `ANALYZE=true`)

---

## 3. Application Boot Sequence

The request lifecycle is intentionally layered so each concern lives in one place.

1. **Root shell (`src/app/layout.tsx`)**
   - Renders `<html>` + `<body>`, injects global CSS.
   - Hosts `AntdProvider` (theme + notification API) and `RecoilProvider`.
2. **RecoilProvider (`@/shared/providers/RecoilProvider`)**
   - Adds `ErrorBoundary` so unhandled errors fall back gracefully.
   - Mounts `AppRecoilRoot` (Recoil), `RouterBridge` (global router getter), and `HttpLoadingBridge` (global loading cursor).
3. **Locale layout (`src/app/[locale]/layout.tsx`)**
   - Validates locale, loads translations via `next-intl`, and exposes `NextIntlClientProvider`.
4. **Route groups**
   - `(public)` layout handles gradient background + auth shell.
   - `(protected)` layout wraps content in `AuthGuard`, `Header`, `Footer`, and an `ErrorBoundary`.
5. **Feature routes**
   - Feature folders contain their own `api/`, `hooks/`, `model/`, `ui/`, and `page.tsx`. Server components orchestrate, client components handle interactivity.

---

## 4. Route Architecture (`src/app`)

```
src/app
├── layout.tsx
├── page.tsx
├── globals.css
└── [locale]/
    ├── layout.tsx
    ├── page.tsx
    ├── (public)/
    │   ├── layout.tsx
    │   └── auth/
    │       ├── page.tsx           # Auth landing (entry point)
    │       └── (_lib)/            # Auth feature internals (api, hooks, model, component)
    └── (protected)/
        ├── layout.tsx
        ├── dashboard/             # Dashboard feature bundle (/_lib grouping)
        ├── products/              # Product listing feature (api/hooks/model/ui)
        └── profile/               # Profile feature
```

**Rules**
- Keep server components in route entrypoints (`page.tsx`, `layout.tsx`). Client components live lower in the tree and use `'use client'` only when necessary (state, effects, browser APIs).
- Each feature folder mirrors the same shape (`api`, `hooks`, `model`, `ui`, optional `_lib` for co-located internals).
- Avoid cross-feature imports. Reusable code lives in `src/shared`.
- Suspense boundaries must render shared loading states (`@/shared/ui/feedback/loading`).

---

## 5. Shared Platform (`src/shared`)

```
src/shared
├── config/          # API routes, site metadata, navigation helpers
├── hooks/           # Framework-agnostic hooks (toast, debounce, etc.)
├── infra/           # Errors, HTTP client, monitoring, validation
├── providers/       # Recoil, Ant Design, bridges
├── state/           # Recoil atoms/controllers/tests
├── testing/         # Shared mocks and test helpers
├── ui/              # Design system, layout shell, feedback components
└── utils/           # Misc helpers (classnames, storage)
```

Key expectations:
- Every shared module is framework-agnostic where possible and has a focused responsibility.
- Add barrel exports (`index.ts`) so consuming imports stay short (e.g. `@/shared/ui/feedback/errors`).
- Tests live next to the module they exercise; prefer Testing Library for React pieces and unit tests for infra.
- When a new shared pattern is introduced, update this guide and add tests in the same PR.

---

## 6. Runtime Flow Reference

### 6.1 Authentication
1. `AuthGuard` (`@/app/[locale]/(public)/auth/(_lib)/component/AuthGuard`) mounts on every protected layout.
2. `useAuth` hook bootstraps the session:
   - Reads cached token (sessionStorage) and user (localStorage).
   - Configures HTTP interceptors with getter/refresh/unauthorised handlers.
3. If bootstrap fails or tokens are missing, the guard redirects to `/[locale]/auth/signin`.
4. `signIn` mutates Recoil state, caches tokens, and routes to the dashboard; `logout` clears all storage and returns to signin.

### 6.2 HTTP Lifecycle
1. Services call `httpGet/httpPost/...` from `@/shared/infra/http/http.client`.
2. The client automatically:
   - Builds relative/absolute URLs depending on environment.
   - Toggles global loading (`startGlobalLoading` / `stopGlobalLoading`).
   - Applies request/response interceptors (auth header, locale, retries, logging).
   - Validates responses with Zod schemas (`parseApiResponse`).
3. Errors are normalised via `handleError` → `AppError`, optionally showing notifications through Ant Design.
4. A 401 triggers token refresh; if that fails, `useAuth.logout` runs and the user is redirected.

### 6.3 Global Loading Feedback
- The bridge (`HttpLoadingBridge`) keeps a global counter in Recoil (`globalLoadingState`).
- Any time the counter > 0, a `cursor-progress` class is applied to `<body>` to signal activity.
- Custom flows can call `startGlobalLoading/stopGlobalLoading` from the controller.

### 6.4 Internationalisation
- Locale layout loads messages via `next-intl` and exposes them through `NextIntlClientProvider`.
- Server components use `getTranslations`, client components use `useTranslations`.
- URLs always include the locale prefix; helper constants live in `@/shared/config/routes`.

### 6.5 Error Monitoring
- `@/shared/infra/monitoring/logger` centralises logging with `logError`, `trackPerformance`. Hook up to Sentry/new tooling inside this module only.

---

## 7. Feature Module Blueprint

```
my-feature/
├── api/                   # HTTP services (use shared http client)
├── hooks/                 # Feature-specific hooks
├── model/                 # Zod schemas, atoms/selectors, type exports
├── ui/                    # Presentational + interactive components
└── page.tsx               # Server component entrypoint
```

Implementation checklist:
1. Describe payloads in `model/*.schemas.ts` and export types via `z.infer`.
2. Create services in `api/` using `API_ROUTES` + HTTP client (always pass a `schema` option).
3. Encapsulate side effects in hooks (data fetching, Recoil coordination, toasts).
4. Compose UI using shared primitives; mark as `'use client'` only when stateful or effectful.
5. Add tests next to the hook/service/component you introduce.
6. Update translations for any user-facing copy.
7. Document new patterns or dependencies here.

Existing features to reference:
- **Auth**: `src/app/[locale]/(public)/auth/(_lib)` for full lifecycle (OTP, bootstrap, logout).
- **Products**: `src/app/[locale]/(protected)/products` for read-only data display with filtering.
- **Dashboard/Profile**: Patterns for organising `_lib` sub-folders and route-level orchestration.

---

## 8. Code Style & Structure

### 8.1 TypeScript
- `strict` mode is enforced—avoid `any`. Prefer `unknown`, Zod inference, or discriminated unions.
- Export types near their schemas (`export type TProduct = z.infer<typeof productSchema>`).
- Use `readonly` modifiers for immutable structures.
- Every non-React function should have an explicit return type.

### 8.2 React & Next.js
- Default to server components. Client components must start with `'use client'` and sit below route boundaries.
- Hooks belong at the top level of components; memoise returned objects/functions (`useMemo`, `useCallback`) to avoid rerenders.
- Wrap risky trees in `ErrorBoundary` or use `createRouteError` for Next error routes.
- Prefer dynamic import with suspense (`dynamic(() => import('./Component'), { ssr: false })`) only when SSR breaks.

### 8.3 Styling
- Tailwind is the default for layout; order classes logically (**layout → alignment → spacing → color → effects**).
- Use shared primitives (Button, Input, LoadingOverlay) to maintain consistent styling.
- Theme third-party components through `AntdProvider`. Avoid inline styles unless Tailwind cannot express the value.

### 8.4 Naming & Structure

| Artifact                    | Convention / Example                            |
|----------------------------|--------------------------------------------------|
| React component            | `MyComponent.tsx`                                |
| Hook                       | `useThing.ts`                                    |
| Schema                     | `thing.schemas.ts`                               |
| Recoil atom/selector       | `domain.atoms.ts`, `domain.selectors.ts`         |
| Controller                 | `domain.controller.ts`                           |
| Test                       | `*.test.ts` / `*.test.tsx`                       |
| Barrel file                | `index.ts` (re-export only, no side effects)     |
| Utility helper             | `camelCase.ts` or `kebab-case.ts` (consistent)   |

Folder names are singular when they describe a concept (`config`, `infra`, `utils`). Use `_lib` inside features to group implementation details that should not be imported from other features.

---

## 9. Testing & Quality Gates

| Layer                     | Expectations                                                                               |
|---------------------------|--------------------------------------------------------------------------------------------|
| Shared infra/utils       | Unit tests alongside the module (`http.client.test.ts`, `error-handler.test.ts`).          |
| Hooks & controllers      | Cover state transitions and side effects (e.g. `loading.controller.test.ts`).              |
| UI components            | Use Testing Library, focus on behaviour over snapshots.                                    |
| Feature flow             | Compose hooks/services for light integration where logic crosses layers.                   |

Before every PR:
1. `yarn typecheck`
2. `yarn lint`
3. `yarn test`
4. Manual QA focusing on routes touched (both locales where applicable)
5. Update translations + docs if user-facing copy or conventions changed

Prefer existing mocks in `@/shared/testing/mocks` rather than inventing new fixtures.

---

## 10. Collaboration Workflow

- **Branches**: `main` is protected. Use `feat/<slug>`, `fix/<slug>`, or `chore/<slug>`.
- **Commits**: Conventional format enforced by commitlint (`feat(products): add price filter`).
- **Pull requests** must include:
  - Linked ticket or context summary
  - Commands executed (`typecheck`, `lint`, `test`)
  - Screenshots/GIFs for UI changes
  - Note on translations or migrations applied
- **Code review focus**: schema changes, shared infra updates, provider modifications, and breaking UI changes must be called out explicitly.
- **After merge**: if the change alters patterns, ensure this guide and any onboarding docs are updated.

---

## 11. Future Enhancements

- Wire `logger.ts` into Sentry (or chosen observability stack).
- Replace mock data sources with real API endpoints once back-end stabilises.
- Expand Storybook coverage for primitives and feedback components.
- Evaluate incremental adoption of `@tanstack/react-query` for server state when backend contracts settle.
- Automate visual regression (Playwright or Chromatic) for critical flows.

---

Keeping this guide accurate keeps onboarding fast and PR discussions focused on the change at hand instead of conventions. Update it whenever architecture, naming, or workflows evolve.***
