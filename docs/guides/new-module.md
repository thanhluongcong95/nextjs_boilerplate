# Guide: Creating a New Feature Module

1. Scaffold the folder under `modules/<feature>` with `components`, `hooks`, `services`, `state`, and `types` subfolders.
2. Define the API contracts using Zod inside `types/<feature>.schemas.ts`. Export TypeScript types from the same file.
3. Implement the service layer using the shared `http` client. Reuse schemas for runtime validation.
4. Create Recoil atoms and selectors to store client state and expose derived views. Prefix atom keys with the module name.
5. Build React components with Tailwind CSS and place tests next to each component. Use Storybook for reusable UI.
6. Add Vitest tests for services and hooks, using MSW handlers when calling the network layer.
7. Export the public API from `modules/<feature>/index.ts` to keep imports stable across the app.
8. Update documentation and add the module to the navigation if required.
