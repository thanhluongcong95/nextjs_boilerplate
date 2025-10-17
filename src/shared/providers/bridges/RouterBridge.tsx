'use client';

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Module-level reference to the Next.js router instance.
 * Allows access to router outside of React components.
 */
let routerRef: AppRouterInstance | null = null;

/**
 * RouterBridge component that provides global access to Next.js router.
 *
 * This bridge component stores the Next.js router instance in a module-level
 * variable, allowing it to be accessed from anywhere in the application
 * through the `getRouter()` function.
 *
 * @example
 * ```tsx
 * // In your app layout or root component
 * <RouterBridge />
 *
 * // Anywhere in your application
 * import { getRouter } from './RouterBridge';
 * const router = getRouter();
 * router?.push('/new-route');
 * ```
 *
 * @returns null - This is a bridge component that doesn't render anything
 */
export function RouterBridge() {
  const router = useRouter();

  useEffect(() => {
    routerRef = router;
  }, [router]);

  return null;
}

/**
 * Returns the current Next.js router instance.
 *
 * This function provides access to the router outside of React components.
 * The router instance is set by the RouterBridge component, so make sure
 * RouterBridge is mounted before calling this function.
 *
 * @returns The router instance if RouterBridge is mounted, null otherwise
 *
 * @example
 * ```tsx
 * import { getRouter } from './RouterBridge';
 *
 * // In a utility function or non-React context
 * export function navigateToHome() {
 *   const router = getRouter();
 *   router?.push('/');
 * }
 * ```
 */
export function getRouter(): AppRouterInstance | null {
  return routerRef;
}
