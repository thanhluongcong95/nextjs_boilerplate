'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { registerTokenGetter } from '@/shared/lib/http/http.interceptors';

import { authService } from '../api/auth.service';
import { authBootstrapState, authTokenState, authUserState } from '../model/auth.atoms';
import type { TLoginPayload } from '../model/auth.schemas';
import { isAuthenticatedSelector } from '../model/auth.selectors';

let memoryToken: string | null = null;

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useRecoilState(authTokenState);
  const [user, setUser] = useRecoilState(authUserState);
  const [hasBootstrapped, setHasBootstrapped] = useRecoilState(authBootstrapState);
  const [isBootstrapping, setBootstrapping] = useState(false);
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const [isAuthenticating, setAuthenticating] = useState(false);

  const setTokenWithSideEffects = useCallback(
    (nextToken: string | null) => {
      memoryToken = nextToken;
      setToken(nextToken);
      if (typeof window !== 'undefined') {
        if (nextToken) {
          sessionStorage.setItem('authToken', nextToken);
        } else {
          sessionStorage.removeItem('authToken');
        }
      }
    },
    [setToken]
  );

  useEffect(() => {
    registerTokenGetter(() => memoryToken);
  }, []);

  const login = useCallback(
    async (payload: TLoginPayload) => {
      setAuthenticating(true);
      try {
        console.log('Attempting login with:', payload);
        const response = await authService.login(payload);
        console.log('Login response:', response);
        setTokenWithSideEffects(response.accessToken);
        const profile = await authService.getMe();
        console.log('User profile:', profile);
        setUser(profile);
        setHasBootstrapped(true);

        // Navigate to dashboard after successful login
        console.log('Login successful, navigating to dashboard...');
        router.push('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        throw error; // Re-throw để LoginForm có thể hiển thị lỗi
      } finally {
        setAuthenticating(false);
      }
    },
    [setTokenWithSideEffects, setUser, setHasBootstrapped, router]
  );

  const logout = useCallback(() => {
    setTokenWithSideEffects(null);
    setUser(null);
    setHasBootstrapped(false);
  }, [setTokenWithSideEffects, setUser, setHasBootstrapped]);

  const bootstrap = useCallback(async () => {
    if (isBootstrapping || hasBootstrapped) return;
    setBootstrapping(true);
    try {
      const storedToken =
        typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
      if (!storedToken) {
        setTokenWithSideEffects(null);
        return;
      }
      setTokenWithSideEffects(storedToken);
      const profile = await authService.getMe();
      setUser(profile);
    } catch {
      setTokenWithSideEffects(null);
      setUser(null);
    } finally {
      setBootstrapping(false);
      setHasBootstrapped(true);
    }
  }, [
    isBootstrapping,
    hasBootstrapped,
    setHasBootstrapped,
    setTokenWithSideEffects,
    setUser,
  ]);

  return useMemo(
    () => ({
      user,
      token,
      isAuthenticated: hasBootstrapped ? isAuthenticated : Boolean(token),
      hasBootstrapped,
      isBootstrapping,
      isLoading: isBootstrapping || isAuthenticating,
      login,
      logout,
      bootstrap,
    }),
    [
      user,
      token,
      isAuthenticated,
      hasBootstrapped,
      isBootstrapping,
      isAuthenticating,
      login,
      logout,
      bootstrap,
    ]
  );
}
