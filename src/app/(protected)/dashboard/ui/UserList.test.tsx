import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import UserList from './UserList';

// Mock the dynamically imported component using the same relative path
jest.mock('./UserListContent', () => ({
  __esModule: true,
  default: () => <h2>Team</h2>,
}));

jest.mock('../hooks/useUsers', () => ({
  useUsers: () => ({
    filteredUsers: [],
    isLoading: false,
  }),
}));

jest.mock('../hooks/useUserMutations', () => ({
  useUserMutations: () => ({
    createUser: jest.fn(),
    deleteUser: jest.fn(),
  }),
}));

describe('UserList', () => {
  let consoleErrorSpy: jest.SpyInstance;
  const originalError = console.error;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      if (String(args[0]).includes('not wrapped in act')) {
        return;
      }
      originalError(...args);
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders the heading', () => {
    render(
      <RecoilRoot>
        <UserList />
      </RecoilRoot>
    );
    expect(screen.getByText(/team/i)).toBeInTheDocument();
  });
});
