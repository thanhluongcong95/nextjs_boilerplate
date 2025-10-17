'use client';

import { useState, useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useToast } from '@/shared/hooks/useToast';
import { handleError } from '@/shared/lib/errors/error-handler';

import { userService } from '../api/users.service';
import { usersListState } from '../model/users.atoms';
import type { TCreateUserPayload, TUpdateUserPayload } from '../model/users.schemas';

export function useUserMutations() {
  const setUsers = useSetRecoilState(usersListState);
  const { showError, showSuccess } = useToast();
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createUser = useCallback(
    async (payload: TCreateUserPayload) => {
      setCreating(true);
      try {
        const user = await userService.create(payload);
        setUsers(prev => [...prev, user]);
        showSuccess('User created successfully');
        return user;
      } catch (error) {
        showError(handleError(error).message);
        throw error;
      } finally {
        setCreating(false);
      }
    },
    [setUsers, showError, showSuccess]
  );

  const updateUser = useCallback(
    async (id: string, payload: TUpdateUserPayload) => {
      setUpdating(true);
      try {
        const user = await userService.update(id, payload);
        setUsers(prev => prev.map(item => (item.id === id ? user : item)));
        showSuccess('User updated');
        return user;
      } catch (error) {
        showError(handleError(error).message);
        throw error;
      } finally {
        setUpdating(false);
      }
    },
    [setUsers, showError, showSuccess]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      setDeleting(true);
      setUsers(prev => prev.filter(user => user.id !== id));
      try {
        await userService.delete(id);
        showSuccess('User removed');
      } catch (error) {
        showError(handleError(error).message);
        throw error;
      } finally {
        setDeleting(false);
      }
    },
    [setUsers, showError, showSuccess]
  );

  return {
    createUser,
    updateUser,
    deleteUser,
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
  };
}
