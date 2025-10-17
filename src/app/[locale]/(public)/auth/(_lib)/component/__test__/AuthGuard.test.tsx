import { render, screen, waitFor } from '@testing-library/react';

import AuthGuard from '../AuthGuard';

const mockReplace = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('AuthGuard', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUseAuth.mockReset();
  });

  it('invokes bootstrap and renders loading state during bootstrapping', async () => {
    const bootstrap = jest.fn();

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      token: null,
      bootstrap,
      isBootstrapping: true,
      hasBootstrapped: false,
    });

    render(
      <AuthGuard>
        <div>protected</div>
      </AuthGuard>
    );

    await waitFor(() => expect(bootstrap).toHaveBeenCalled());
    expect(screen.getByText('checkingSession')).toBeInTheDocument();
  });

  it('redirects to sign-in when unauthenticated after bootstrapping', async () => {
    const bootstrap = jest.fn();

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      token: null,
      bootstrap,
      isBootstrapping: false,
      hasBootstrapped: true,
    });

    render(
      <AuthGuard>
        <div>protected</div>
      </AuthGuard>
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/en/auth/signin'));
  });

  it('renders children when authenticated', () => {
    const bootstrap = jest.fn();

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      token: 'token',
      bootstrap,
      isBootstrapping: false,
      hasBootstrapped: true,
    });

    render(
      <AuthGuard>
        <div>protected</div>
      </AuthGuard>
    );

    expect(screen.getByText('protected')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
