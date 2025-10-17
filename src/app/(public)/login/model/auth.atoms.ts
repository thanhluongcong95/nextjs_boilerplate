import { atom } from 'recoil';

import type { TAuthUser } from './auth.schemas';

export const authTokenState = atom<string | null>({
  key: 'auth/token',
  default: null,
});

export const authUserState = atom<TAuthUser | null>({
  key: 'auth/user',
  default: null,
});

export const authBootstrapState = atom<boolean>({
  key: 'auth/bootstrap',
  default: false,
});
