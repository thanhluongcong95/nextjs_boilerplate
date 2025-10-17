'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { authService } from '@/app/[locale]/(public)/auth/(_lib)/api';
import {
  authBootstrapState,
  authTokenState,
  authUserState,
  isAuthenticatedSelector,
  type TAuthUser,
  type TSignInPayload,
  type TSignInResponse,
} from '@/app/[locale]/(public)/auth/(_lib)/model';
import { configureHttpInterceptors } from '@/shared/infra/http/http.interceptors';
import { local, session } from '@/shared/utils/storage/storage';

// ============================================================================
// Memory Storage (Module-level state)
// ============================================================================

let memoryToken: string | null = null;
let memoryRefreshToken: string | null = null;

// ============================================================================
// Storage Helpers
// ============================================================================

const getStoredToken = (): string | null => {
  if (globalThis.window === undefined) return null;
  return sessionStorage.getItem('authToken');
};

const setStoredToken = (token: string | null): void => {
  if (globalThis.window === undefined) return;
  if (token) {
    sessionStorage.setItem('authToken', token);
  } else {
    sessionStorage.removeItem('authToken');
  }
};

/**
 * Clear all cookies by setting expiry date in the past
 */
const clearAllCookies = (): void => {
  if (globalThis.window === undefined || globalThis.document === undefined) return;

  try {
    const cookies = globalThis.document.cookie.split(';');

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

      // Only clear likely auth/session cookies to avoid nuking unrelated cookies
      const shouldDelete = /auth|token|session/i.test(name);
      if (!shouldDelete) continue;

      // Delete cookie by setting expiry date in the past
      globalThis.document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      globalThis.document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${globalThis.window.location.hostname}`;
      globalThis.document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${globalThis.window.location.hostname}`;
    }
  } catch (error) {
    // Ignore errors when clearing cookies
    console.warn('Failed to clear cookies:', error);
  }
};

/**
 * Clear all user data from storage and cookies
 */
const clearAllUserData = (): void => {
  // Remove only auth-related entries
  local.remove('authUser');
  session.remove('authToken');

  // Clear auth/session cookies
  clearAllCookies();
};

// ============================================================================
// Main Hook
// ============================================================================

export const useAuth = () => {
  const router = useRouter();
  const locale = useLocale();
  const [token, setToken] = useRecoilState(authTokenState);
  const [user, setUser] = useRecoilState(authUserState);
  const [hasBootstrapped, setHasBootstrapped] = useRecoilState(authBootstrapState);
  const [isBootstrapping, setBootstrapping] = useState(false);
  const [isAuthenticating, setAuthenticating] = useState(false);
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);

  // ============================================================================
  // Token Management
  // ============================================================================

  const setTokenWithSideEffects = useCallback(
    (nextToken: string | null) => {
      memoryToken = nextToken;
      setToken(nextToken);
      setStoredToken(nextToken);
    },
    [setToken]
  );

  // ============================================================================
  // Session Management
  // ============================================================================

  const setSession = useCallback(
    async (response: TSignInResponse): Promise<TAuthUser | null> => {
      // Set tokens
      setTokenWithSideEffects(response.accessToken ?? null);
      if (response.refreshToken) {
        memoryRefreshToken = response.refreshToken;
      }

      // Get user profile from sign-in response only (no extra API call)
      const profile: TAuthUser | null = response.user ?? null;

      // Update state
      setUser(profile);
      setHasBootstrapped(true);

      // Persist user to localStorage for bootstrap
      if (profile) {
        local.set('authUser', profile);
      }

      return profile;
    },
    [setTokenWithSideEffects, setUser, setHasBootstrapped]
  );

  // ============================================================================
  // Authentication Actions
  // ============================================================================

  const signIn = useCallback(
    async (payload: TSignInPayload): Promise<void> => {
      setAuthenticating(true);
      try {
        const response = await authService.signIn(payload);
        await setSession(response);

        // Navigate to dashboard after successful sign-in
        router.push(`/${locale}/dashboard`);
      } finally {
        setAuthenticating(false);
      }
    },
    [setSession, router, locale]
  );

  const logout = useCallback(() => {
    // Clear memory tokens
    memoryToken = null;
    memoryRefreshToken = null;

    // Clear state
    setTokenWithSideEffects(null);
    setUser(null);
    setHasBootstrapped(false);

    // Clear all storage (localStorage, sessionStorage, cookies)
    clearAllUserData();

    // Navigate to signin page
    router.push(`/${locale}/auth/signin`);
  }, [setTokenWithSideEffects, setUser, setHasBootstrapped, router, locale]);

  // ============================================================================
  // Token Refresh
  // ============================================================================

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      // Guard: do not attempt refresh without a refresh token
      if (!memoryRefreshToken) {
        return null;
      }

      const response = await authService.refreshToken({ refreshToken: memoryRefreshToken });

      if (response.accessToken) {
        setTokenWithSideEffects(response.accessToken);
      }

      if (response.refreshToken) {
        memoryRefreshToken = response.refreshToken;
      }

      if (response.user) {
        setUser(response.user);
        // Update localStorage with refreshed user
        local.set('authUser', response.user);
      }

      return response.accessToken ?? null;
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw error;
    }
  }, [logout, setTokenWithSideEffects, setUser]);

  // ============================================================================
  // Bootstrap (Restore Session)
  // ============================================================================

  const bootstrap = useCallback(async (): Promise<void> => {
    // Prevent multiple bootstrap attempts
    if (isBootstrapping || hasBootstrapped) return;

    setBootstrapping(true);
    try {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setTokenWithSideEffects(null);
        setHasBootstrapped(true);
        return;
      }

      // Restore token
      setTokenWithSideEffects(storedToken);

      // Restore user from localStorage (no extra API call)
      const storedUser = local.get<TAuthUser>('authUser');
      if (storedUser) {
        setUser(storedUser);
      }
      // Do not call /auth/me; rely solely on cached user
    } catch {
      // If bootstrap fails, clear everything
      setTokenWithSideEffects(null);
      setUser(null);
    } finally {
      setBootstrapping(false);
      setHasBootstrapped(true);
    }
  }, [isBootstrapping, hasBootstrapped, setHasBootstrapped, setTokenWithSideEffects, setUser]);

  // ============================================================================
  // HTTP Interceptors Setup
  // ============================================================================

  useEffect(() => {
    configureHttpInterceptors({
      getAccessToken: () => memoryToken,
      refreshAccessToken,
      onUnauthorized: () => {
        logout();
        router.replace(`/${locale}/auth/signin`);
      },
      getLocale: () => locale,
    });
  }, [locale, logout, router, refreshAccessToken]);

  // ============================================================================
  // Return API
  // ============================================================================

  return useMemo(
    () => ({
      user,
      token,
      isAuthenticated: hasBootstrapped ? isAuthenticated : Boolean(token),
      hasBootstrapped,
      isBootstrapping,
      isLoading: isBootstrapping || isAuthenticating,
      signIn,
      logout,
      bootstrap,
      setSession,
    }),
    [user, token, isAuthenticated, hasBootstrapped, isBootstrapping, isAuthenticating, signIn, logout, bootstrap, setSession]
  );
};
