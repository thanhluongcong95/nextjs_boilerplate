import { atom, selector } from 'recoil';

import type { TProfile } from '@/app/[locale]/(protected)/profile/(_lib)/model/profile.schemas';
import { authUserState } from '@/app/[locale]/(public)/auth/(_lib)/model';

/**
 * Profile state - derived from auth user
 * This is the source of truth for profile data
 */
export const profileSelector = selector<TProfile | null>({
  key: 'profile/selector',
  get: ({ get }) => {
    const authUser = get(authUserState);
    if (!authUser) return null;

    // Map auth user to profile format (consistent field names)
    return {
      id: authUser.id,
      email: authUser.email,
      fullName: authUser.fullName ?? authUser.name ?? '',
      phone: '', // empty until backend provides phone
      role: authUser.role,
      avatarUrl: authUser.avatarUrl,
      createdAt: authUser.createdAt ?? new Date().toISOString(),
    };
  },
});

/**
 * @deprecated - Use profileSelector instead
 * Keeping for backward compatibility during migration
 */
export const profileState = atom<TProfile | null>({
  key: 'profile/state',
  default: null,
});

export const profileLoadingState = atom<boolean>({
  key: 'profile/loading',
  default: false,
});

export const profileModalState = atom({
  key: 'profile/modals',
  default: {
    edit: false,
    changePassword: false,
  },
});
