'use client';

import 'dayjs/locale/en';

import { CalendarOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Card, Skeleton, Tag } from 'antd';
import dayjs from 'dayjs';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { TProfile } from '@/app/[locale]/(protected)/profile/(_lib)/model/profile.schemas';

interface IProfileCardProps {
  profile?: TProfile | null;
  loading?: boolean;
}

export const ProfileCard: React.FC<IProfileCardProps> = ({ profile, loading }) => {
  const t = useTranslations('profile');
  const locale = useLocale();

  const joinedDate = useMemo(() => {
    if (!profile?.createdAt) return '—';
    return dayjs(profile.createdAt).locale(locale).format('MMMM D, YYYY');
  }, [profile?.createdAt, locale]);

  const roleColor = useMemo(() => {
    return profile?.role === 'admin' ? 'volcano' : 'blue';
  }, [profile?.role]);

  if (loading) {
    return (
      <Card className="mx-auto w-full max-w-5xl overflow-hidden">
        <Skeleton active avatar={{ size: 120, shape: 'circle' }} paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UserOutlined className="mb-4 text-6xl text-gray-300" />
          <p className="text-lg text-gray-500">{t('noProfileData')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-5xl overflow-hidden shadow-lg">
      {/* Header with gradient background */}
      <div className="relative -mx-6 -mt-6 mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 pb-16 pt-8">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Badge dot={false} offset={[-10, 100]}>
                <Avatar
                  size={{ xs: 80, sm: 100, md: 120, lg: 140 }}
                  src={profile.avatarUrl}
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-xl"
                  alt={profile.fullName}
                />
              </Badge>
            </div>
            <Tag color={roleColor} className="self-start text-sm font-semibold uppercase sm:self-auto">
              {profile.role}
            </Tag>
          </div>
        </div>
      </div>

      {/* Profile Information Grid */}
      <div className="space-y-6">
        {/* Name Section */}
        <div className="-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{profile.fullName}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('personalInfo')}</p>
        </div>

        {/* Information Cards Grid - Responsive */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Email Card */}
          <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-4 transition-all hover:border-blue-300 hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2 transition-colors group-hover:bg-blue-200">
                <MailOutlined className="text-lg text-blue-600" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-gray-500">{t('form.email')}</p>
                <p className="mt-1 truncate text-sm font-semibold text-gray-900" title={profile.email}>
                  {profile.email}
                </p>
              </div>
            </div>
          </div>

          {/* Phone Card */}
          <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4 transition-all hover:border-green-300 hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2 transition-colors group-hover:bg-green-200">
                <PhoneOutlined className="text-lg text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">{t('form.phone')}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{profile.phone || '—'}</p>
              </div>
            </div>
          </div>

          {/* Joined Date Card */}
          <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-4 transition-all hover:border-purple-300 hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-100 p-2 transition-colors group-hover:bg-purple-200">
                <CalendarOutlined className="text-lg text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">{t('form.joinedDate')}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{joinedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Optional */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold text-indigo-600">ID</p>
              <p className="mt-1 truncate text-xs text-gray-600" title={profile.id}>
                {profile.id.slice(0, 8)}...
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">Status</p>
              <p className="mt-1 text-xs text-gray-600">Active</p>
            </div>
            <div className="col-span-2">
              <p className="text-2xl font-bold text-pink-600">Member Since</p>
              <p className="mt-1 text-xs text-gray-600">{dayjs(profile.createdAt).format('YYYY')}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
