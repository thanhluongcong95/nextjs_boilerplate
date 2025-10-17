# ADR 001: Recoil over Redux Toolkit

## Status

Accepted

## Context

We need a lightweight yet expressive state management solution that supports derived state, selector memoization, and simple co-location with feature modules. Redux Toolkit is powerful but requires additional boilerplate and a global store pattern that does not match the module-first architecture.

## Decision

Pick Recoil for global client state. It offers atom families, selectors, and fine-grained subscriptions that align with our module structure. The recoil bridge files allow us to encapsulate initialization inside the `AppRecoilRoot` provider and keep state local to features.

## Consequences

- Reduced boilerplate for CRUD-heavy views.
- Need strict lint rules to avoid atom key collisions.
- Any server state should still be managed by TanStack Query to avoid duplicating caching logic.
