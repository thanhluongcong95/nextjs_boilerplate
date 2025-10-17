import type { TAuthUser } from './auth.schemas';

export type TAuthUserViewModel = TAuthUser & {
  displayName: string;
};
