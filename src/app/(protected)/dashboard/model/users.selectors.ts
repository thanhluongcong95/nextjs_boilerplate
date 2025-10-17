import { selector } from 'recoil';

import { usersListState } from './users.atoms';

export const userStatsSelector = selector({
  key: 'users/stats',
  get: ({ get }) => {
    const users = get(usersListState);
    const active = users.filter(user => user.status === 'active').length;
    const inactive = users.length - active;
    return {
      total: users.length,
      active,
      inactive,
    };
  },
});
