import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SignInForm } from '../SignInForm';

const mockSignIn = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

jest.mock('@/app/[locale]/(public)/auth/(_lib)/hooks', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    isLoading: false,
  }),
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

describe('SignInForm', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
  });

  it('submits credentials through useAuth.signIn', async () => {
    mockSignIn.mockResolvedValueOnce(undefined);

    render(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText('emailPlaceholder'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('passwordPlaceholder'), {
      target: { value: 'password123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'signIn' }));
    });

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      })
    );
  });

  it('still relies on global handler when signIn rejects', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('boom'));

    render(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText('emailPlaceholder'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('passwordPlaceholder'), {
      target: { value: 'password123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'signIn' }));
    });

    await waitFor(() => expect(mockSignIn).toHaveBeenCalled());
    expect(screen.queryByText('boom')).not.toBeInTheDocument();
  });
});
