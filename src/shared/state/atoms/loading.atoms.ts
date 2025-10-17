import { atom } from 'recoil';

export const globalLoadingState = atom<number>({
  key: 'global/loading',
  default: 0,
});
