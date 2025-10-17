import { selector } from 'recoil';

import { authTokenState, authUserState } from './auth.atoms';

export const isAuthenticatedSelector = selector<boolean>({
  key: 'auth/isAuthenticated',
  get: ({ get }) => Boolean(get(authTokenState) && get(authUserState)),
});
