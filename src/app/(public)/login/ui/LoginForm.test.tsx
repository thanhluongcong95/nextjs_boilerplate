import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useAuth } from '../hooks/useAuth';

import { LoginForm } from './LoginForm';

jest.mock('../hooks/useAuth');

const createAuthState = () => ({
  login: jest.fn(),
  logout: jest.fn(),
  bootstrap: jest.fn(),
  isBootstrapping: false,
  hasBootstrapped: true,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  user: null,
});

describe('LoginForm', () => {
  const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    mockedUseAuth.mockReset();
    mockedUseAuth.mockReturnValue(createAuthState());
  });

  it('submits valid credentials', async () => {
    const loginMock = jest.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({
      ...createAuthState(),
      login: loginMock,
    });

    render(
      <RecoilRoot>
        <LoginForm />
      </RecoilRoot>
    );

    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
