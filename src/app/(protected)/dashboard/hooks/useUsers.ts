'use client';

import { useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useToast } from '@/shared/hooks/useToast';
import { handleError } from '@/shared/lib/errors/error-handler';

import { userService } from '../api/users.service';
import {
  filteredUsersSelector,
  usersListState,
  usersLoadingState,
} from '../model/users.atoms';

export function useUsers(keyword: string = '') {
  const users = useRecoilValue(usersListState);
  const [isLoading, setLoading] = useRecoilState(usersLoadingState);
  const filteredUsers = useRecoilValue(filteredUsersSelector(keyword));
  const { showError } = useToast();
  const setUsersState = useSetRecoilState(usersListState);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsersState(response.items);
    } catch (error) {
      const appError = handleError(error);
      showError(appError.message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUsersState, showError]);

  useEffect(() => {
    if (users.length === 0) {
      void fetchUsers();
    }
  }, [users.length, fetchUsers]);

  return {
    users,
    filteredUsers,
    isLoading,
    refetch: fetchUsers,
  };
}
