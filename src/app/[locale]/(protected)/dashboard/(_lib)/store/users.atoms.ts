import { atom, atomFamily, selectorFamily } from 'recoil';

import type { TUser } from '@/app/[locale]/(protected)/dashboard/(_lib)/model/users.schemas';

export const usersListState = atom<TUser[]>({
  key: 'users/list',
  default: [],
});

export const usersLoadingState = atom<boolean>({
  key: 'users/loading',
  default: false,
});

export const userByIdState = atomFamily<TUser | null, string>({
  key: 'users/byId',
  default: null,
});

export const filteredUsersSelector = selectorFamily<TUser[], string>({
  key: 'users/filtered',
  get:
    (keyword: string) =>
    ({ get }) => {
      const list = get(usersListState);
      if (!keyword) return list;
      const lower = keyword.toLowerCase();
      return list.filter(user => user.name.toLowerCase().includes(lower) || user.email.toLowerCase().includes(lower));
    },
});
