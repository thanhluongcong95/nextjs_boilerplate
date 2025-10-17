import { render, waitFor } from '@testing-library/react';

import { AuthRedirect } from '../AuthRedirect';

const mockReplace = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('next-intl', () => ({
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

describe('AuthRedirect', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUseAuth.mockReset();
  });

  it('redirects to dashboard when user is authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      hasBootstrapped: true,
      isBootstrapping: false,
    });

    render(<AuthRedirect />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/en/dashboard'));
  });

  it('redirects to provided path when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      hasBootstrapped: true,
      isBootstrapping: false,
    });

    render(<AuthRedirect redirectTo="/profile" />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/en/profile'));
  });

  it('does nothing while bootstrapping', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      hasBootstrapped: false,
      isBootstrapping: true,
    });

    render(<AuthRedirect />);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
