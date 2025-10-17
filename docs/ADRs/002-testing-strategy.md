# ADR 002: Testing Stack Selection

## Status

Accepted

## Context

The product requires deterministic unit tests, integration tests with mocked APIs, and end-to-end coverage. We evaluated Jest, Vitest, Cypress, and Playwright across performance, TypeScript support, and integration with Next.js 14.

## Decision

- Use Vitest for unit and integration tests because it is fast, Vite-native, and plays nicely with React 18 and TypeScript.
- Use MSW for API mocking so integration tests run against realistic contracts.
- Use Playwright for E2E automation to cover the critical auth and CRUD journeys.

## Consequences

- Developers must run `pnpm test:coverage` before opening a PR.
- We maintain a shared MSW handler catalog under `__tests__/mocks` to keep mock data consistent.
- Playwright tests run inside CI on push and pull-request events.
