import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Patch React internals required by Recoil when running under Jest
const mockDispatcher = {
  current: {
    readContext: jest.fn(),
    use: jest.fn(),
  },
};

const reactAny = React as unknown as {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
    ReactCurrentDispatcher?: { current: unknown } | undefined;
  };
};

reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  ...(reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ?? {}),
  ReactCurrentDispatcher: mockDispatcher,
};

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
