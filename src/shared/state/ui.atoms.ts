import { atom } from 'recoil';

type ThemeMode = 'light' | 'dark';

export const themeModeState = atom<ThemeMode>({
  key: 'ui/themeMode',
  default: 'light',
});
