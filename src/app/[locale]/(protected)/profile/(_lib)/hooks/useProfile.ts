import { App } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import type { TProfile, TUpdateProfilePayload } from '@/app/[locale]/(protected)/profile/(_lib)/model/profile.schemas';
import { profileModalState, profileSelector } from '@/app/[locale]/(protected)/profile/(_lib)/store/profile.atoms';
import { authUserState } from '@/app/[locale]/(public)/auth/(_lib)/model';
import { local } from '@/shared/utils/storage/storage';

/**
 * Hook for managing user profile
 * Profile data is sourced from auth user state
 */
export const useProfile = () => {
  const t = useTranslations('profile');
  const { notification } = App.useApp();

  // Get profile from auth user (read-only)
  const profile = useRecoilValue(profileSelector);

  // For updating auth user after profile update
  const setAuthUser = useSetRecoilState(authUserState);

  // Modal state
  const [modalState, setModalState] = useRecoilState(profileModalState);

  // Loading state
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Update profile - this will update the auth user on backend
   */
  // TODO(backend): Replace local-only update with real API integration when
  // the update profile endpoint is available. Suggested flow:
  // 1) Call ProfileService.updateProfile(data)
  // 2) Use the returned profile to update authUserState
  // 3) Persist updated user to localStorage
  const updateProfile = useCallback(
    async (data: TUpdateProfilePayload) => {
      setIsUpdating(true);

      try {
        // Local-only update (no API call). Merge edited fields into current profile
        const current = profile;
        if (!current) {
          notification.error({ message: t('noProfileData') || 'No profile data available.', placement: 'topRight' });
          return null;
        }

        const updated: TProfile = {
          ...current,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl ?? current.avatarUrl,
          phone: data.phone ?? current.phone,
        };

        // Update auth user state (source of truth) and persist to localStorage
        setAuthUser(prevUser => {
          if (!prevUser) return null;
          const nextUser = {
            ...prevUser,
            fullName: updated.fullName,
            avatarUrl: updated.avatarUrl,
          };
          local.set('authUser', nextUser);
          return nextUser as typeof prevUser;
        });

        notification.success({
          message: t('messages.updateSuccess'),
          placement: 'topRight',
        });
        setModalState(prev => ({ ...prev, edit: false }));

        return updated;
      } finally {
        setIsUpdating(false);
      }
    },
    [profile, setAuthUser, t, setModalState, notification]
  );

  return {
    profile,
    isLoading: false, // No loading needed since data comes from auth state
    isUpdating,
    modalState,
    setModalState,
    updateProfile,
  };
};
