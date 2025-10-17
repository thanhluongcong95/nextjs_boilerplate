import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { authService } from '../api/auth.service';

import { useAuth } from './useAuth';

jest.mock('../api/auth.service');

const mockedAuthService = jest.mocked(authService);

const wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useAuth', () => {
  let consoleErrorSpy: jest.SpyInstance;
  const originalError = console.error;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      if (String(args[0]).includes('React renderer without React 18+ API support')) {
        return;
      }
      originalError(...args);
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('logs in and stores user data', async () => {
    // Arrange
    mockedAuthService.login.mockResolvedValue({ accessToken: 'token', expiresIn: 3600 });
    mockedAuthService.getMe.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    });

    // Act
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Ensure initial state is loaded
    await waitFor(() => {
      expect(result.current.isBootstrapping).toBe(false);
    });

    // Perform login
    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password123' });
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.hasBootstrapped).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
