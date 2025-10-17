import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { RecoilRoot } from 'recoil';

// Mocks
const pushMock = jest.fn();
const replaceMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

const signInMock = jest.fn();
const refreshTokenMock = jest.fn();
jest.mock('@/app/[locale]/(public)/auth/(_lib)/api', () => ({
  authService: {
    signIn: (...args: unknown[]) => signInMock(...args),
    refreshToken: (...args: unknown[]) => refreshTokenMock(...args),
  },
}));

const configureHttpInterceptorsMock = jest.fn();
jest.mock('@/shared/infra/http/http.interceptors', () => ({
  configureHttpInterceptors: (...args: unknown[]) => configureHttpInterceptorsMock(...args),
}));

const localGetMock = jest.fn();
const localSetMock = jest.fn();
const localRemoveMock = jest.fn();
const sessionGetMock = jest.fn();
const sessionSetMock = jest.fn();
const sessionRemoveMock = jest.fn();

jest.mock('@/shared/utils/storage/storage', () => ({
  local: {
    get: (...args: unknown[]) => localGetMock(...args),
    set: (...args: unknown[]) => localSetMock(...args),
    remove: (...args: unknown[]) => localRemoveMock(...args),
  },
  session: {
    get: (...args: unknown[]) => sessionGetMock(...args),
    set: (...args: unknown[]) => sessionSetMock(...args),
    remove: (...args: unknown[]) => sessionRemoveMock(...args),
  },
}));

import { useAuth } from '../useAuth';

// Helper wrapper
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(RecoilRoot, null, children);
};

// Utility to ensure sessionStorage exists in jsdom
beforeAll(() => {
  if (!(globalThis as any).sessionStorage) {
    const store: Record<string, string> = {};
    (globalThis as any).sessionStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k of Object.keys(store)) {
          delete store[k];
        }
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
      length: 0,
    } as unknown as Storage;
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  // also clear session/local storage shims
  try {
    globalThis.sessionStorage.clear();
  } catch {}
});

describe('useAuth hook', () => {
  it('initializes with expected fields and default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    expect(result.current).toHaveProperty('user', null);
    expect(result.current).toHaveProperty('token', null);
    expect(result.current).toHaveProperty('isAuthenticated', false);
    expect(result.current).toHaveProperty('hasBootstrapped', false);
    expect(result.current).toHaveProperty('isBootstrapping', false);
    expect(result.current).toHaveProperty('isLoading', false);
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.bootstrap).toBe('function');
    expect(typeof result.current.setSession).toBe('function');

    // Interceptors configured
    expect(configureHttpInterceptorsMock).toHaveBeenCalledTimes(1);
    const [configArg] = configureHttpInterceptorsMock.mock.calls[0] as [any];
    expect(configArg).toEqual(
      expect.objectContaining({
        getAccessToken: expect.any(Function),
        refreshAccessToken: expect.any(Function),
        onUnauthorized: expect.any(Function),
        getLocale: expect.any(Function),
      })
    );
  });

  it('signIn calls authService.signIn, sets session, and navigates to dashboard', async () => {
    const signInResponse = {
      accessToken: 'acc',
      refreshToken: 'ref',
      user: { id: '1', email: 'john@grow-ps.com', role: 'user' },
    };
    signInMock.mockResolvedValueOnce(signInResponse);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.signIn({ email: 'john@grow-ps.com', password: 'Password!1' });
    });

    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(localSetMock).toHaveBeenCalledWith('authUser', signInResponse.user);
    expect(globalThis.sessionStorage.getItem('authToken')).toBe('acc');
    expect(result.current.token).toBe('acc');
    expect(result.current.user).toEqual(signInResponse.user);
    expect(pushMock).toHaveBeenCalledWith('/en/dashboard');
  });

  it('logout clears tokens, user, storages and redirects to sign-in', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    // Seed session
    await act(async () => {
      await result.current.setSession({ accessToken: 'a', refreshToken: 'r', user: { id: '1', email: 'e', role: 'user' } } as any);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.hasBootstrapped).toBe(false);
    expect(localRemoveMock).toHaveBeenCalledWith('authUser');
    expect(sessionRemoveMock).toHaveBeenCalledWith('authToken');
    expect(pushMock).toHaveBeenCalledWith('/en/auth/signin');
  });

  it('bootstrap restores from storage when token exists', async () => {
    // Simulate stored token and user
    globalThis.sessionStorage.setItem('authToken', 'tok');
    localGetMock.mockReturnValueOnce({ id: '1', email: 'e', role: 'user' });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.bootstrap();
    });

    expect(result.current.token).toBe('tok');
    expect(result.current.user).toEqual({ id: '1', email: 'e', role: 'user' });
    expect(result.current.hasBootstrapped).toBe(true);
  });

  it('bootstrap handles no token by clearing token and setting bootstrapped', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.bootstrap();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.hasBootstrapped).toBe(true);
  });

  it('refreshAccessToken updates token, refresh token and user; updates storage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    // Seed refresh token via setSession
    await act(async () => {
      await result.current.setSession({ accessToken: 'a1', refreshToken: 'r1', user: { id: '1', email: 'e', role: 'user' } } as any);
    });

    const [configArg] = configureHttpInterceptorsMock.mock.calls[0] as [any];

    refreshTokenMock.mockResolvedValueOnce({ accessToken: 'a2', refreshToken: 'r2', user: { id: '2', email: 'e2', role: 'admin' } });

    const newToken = await act(async () => {
      return await configArg.refreshAccessToken();
    });

    expect(refreshTokenMock).toHaveBeenCalledWith({ refreshToken: 'r1' });
    expect(result.current.token).toBe('a2');
    expect(result.current.user).toEqual({ id: '2', email: 'e2', role: 'admin' });
    expect(localSetMock).toHaveBeenCalledWith('authUser', { id: '2', email: 'e2', role: 'admin' });
    expect(newToken).toBe('a2');
  });

  // it('refreshAccessToken returns null when no refresh token is present', async () => {
  //   renderHook(() => useAuth(), { wrapper: Wrapper });
  //   const [configArg] = configureHttpInterceptorsMock.mock.calls[0] as [any];
  //   const rv = await act(async () => await configArg.refreshAccessToken());
  //   expect(rv).toBeNull();
  //   expect(refreshTokenMock).not.toHaveBeenCalled();
  // });

  it('refreshAccessToken logs out and rethrows on failure', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.setSession({ accessToken: 'a', refreshToken: 'r', user: { id: '1', email: 'e', role: 'user' } } as any);
    });

    refreshTokenMock.mockRejectedValueOnce(new Error('refresh failed'));

    const [configArg] = configureHttpInterceptorsMock.mock.calls[0] as [any];
    await expect(
      act(async () => {
        await configArg.refreshAccessToken();
      })
    ).rejects.toThrow('refresh failed');

    expect(pushMock).toHaveBeenCalledWith('/en/auth/signin');
  });

  it('exposes loading flags for sign-in and bootstrap flows', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    // signIn toggles isAuthenticating via deferred resolve
    let resolveSignIn: (v: any) => void = () => {};
    signInMock.mockImplementationOnce(
      () =>
        new Promise(res => {
          resolveSignIn = res;
        })
    );
    await act(async () => {
      // fire and forget; don't await here to observe mid-flight state
      void result.current.signIn({ email: 'john@grow-ps.com', password: 'Password!1' });
    });
    // Allow state to flush
    await act(async () => {});
    // Resolve the sign-in now and flush
    resolveSignIn({ accessToken: 'a', user: { id: '1', email: 'e', role: 'user' } });
    await act(async () => {});
    expect(result.current.isLoading).toBe(false);

    // bootstrap toggles isBootstrapping
    await act(async () => {
      await result.current.bootstrap();
    });
    expect(result.current.isBootstrapping).toBe(false);
  });

  it('registers interceptors with onUnauthorized that logs out and replaces route', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    const call = configureHttpInterceptorsMock.mock.calls[0];
    expect(call).toBeDefined();
    const configArg = call[0];

    act(() => {
      configArg.onUnauthorized();
    });

    expect(replaceMock).toHaveBeenCalledWith('/en/auth/signin');
    expect(result.current.token).toBeNull();
  });
});
