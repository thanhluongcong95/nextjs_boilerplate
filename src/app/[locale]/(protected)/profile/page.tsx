'use client';

import { EditOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useTranslations } from 'next-intl';

import { EditProfileModal } from '@/app/[locale]/(protected)/profile/(_lib)/components/modals/EditProfileModal';
import { ProfileCard } from '@/app/[locale]/(protected)/profile/(_lib)/components/ProfileCard';
import { useProfile } from '@/app/[locale]/(protected)/profile/(_lib)/hooks/useProfile';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { profile, isLoading, setModalState } = useProfile();

  const handleEdit = () => {
    setModalState(prev => ({ ...prev, edit: true }));
  };

  const _handleChangePassword = () => {
    setModalState(prev => ({ ...prev, changePassword: true }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{t('subtitle') || 'Manage your profile and preferences'}</p>
          </div>

          <Space size="middle" className="flex-wrap">
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit} size="large" disabled={!profile}>
              {t('editProfile')}
            </Button>
          </Space>
        </div>

        {/* Profile Card */}
        <ProfileCard profile={profile} loading={isLoading} />

        {/* Modals */}
        <EditProfileModal />
      </div>
    </div>
  );
}
