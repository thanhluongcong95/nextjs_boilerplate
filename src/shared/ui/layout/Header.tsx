'use client';

import { LockOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useAuth } from '@/app/[locale]/(public)/auth/(_lib)/hooks/useAuth';
import { authUserState } from '@/app/[locale]/(public)/auth/(_lib)/model/auth.atoms';
import { siteConfig } from '@/shared/config/site';
import { ChangePasswordModal } from '@/shared/ui/feedback/modals';
import { LanguageSwitcher } from '@/shared/ui/navigation/LanguageSwitcher';

export const Header = () => {
  const locale = useLocale();
  const headerTranslations = useTranslations('layout.header');
  const sidebarTranslations = useTranslations('layout.sidebar');
  const router = useRouter();
  const user = useRecoilValue(authUserState);
  const { logout } = useAuth();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleGoDashboard = () => {
    router.push(`/${locale}/dashboard`);
  };

  const handleMenuClick = (info: { key: string }) => {
    switch (info.key) {
      case 'profile':
        router.push(`/${locale}/profile`);
        break;
      case 'changePassword':
        setIsChangePasswordModalOpen(true);
        break;
      case 'settings':
        router.push(`/${locale}/settings`);
        break;
      case 'signout':
        logout();
        break;
      default:
        break;
    }
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: headerTranslations('profile'),
      icon: <UserOutlined />,
    },
    {
      key: 'changePassword',
      label: headerTranslations('changePassword'),
      icon: <LockOutlined />,
    },
    {
      key: 'settings',
      label: headerTranslations('settings'),
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'signout',
      label: headerTranslations('signOut'),
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <header className="from-white/98 to-white/98 sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/60 bg-gradient-to-r via-white/95 px-4 py-4 shadow-lg backdrop-blur-md sm:px-6 lg:px-8">
      {/* Logo Section */}
      <div className="flex cursor-pointer items-center gap-4" onClick={handleGoDashboard} role="button" aria-label={sidebarTranslations('dashboard')}>
        <div className="group relative">
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-25 blur transition duration-300 group-hover:opacity-40" />
          <div className="relative rounded-xl bg-white p-1 shadow-sm">
            <Image
              src="/assets/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-lg transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </div>
        <div className="hidden sm:block">
          <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-xl font-bold text-transparent">
            {siteConfig.name}
          </h1>
          <p className="text-xs font-medium text-slate-500">{headerTranslations('tagline')}</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* User Profile Section */}
        <div className="flex items-center gap-3">
          {/* User Info */}
          <div className="hidden text-right md:block">
            <div className="text-sm font-semibold text-slate-900">{getUserDisplayName()}</div>
          </div>

          {/* Settings Dropdown */}
          <Dropdown
            placement="bottomRight"
            trigger={['click']}
            menu={{
              items,
              onClick: handleMenuClick,
            }}
          >
            <Button
              className="flex items-center justify-center rounded-xl border-0 bg-transparent p-2 transition-all duration-200 hover:bg-slate-100/80 hover:shadow-md"
              size="middle"
            >
              <SettingOutlined className="text-slate-600 transition-colors duration-200 hover:text-slate-800" />
            </Button>
          </Dropdown>
        </div>
        {/* Language Switcher */}
        <div className="hidden sm:block">
          <div className="rounded-lg border border-slate-200/50 bg-slate-50/80 p-1 backdrop-blur-sm">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Language Switcher */}
        <div className="sm:hidden">
          <div className="rounded-lg border border-slate-200/50 bg-slate-50/80 p-1 backdrop-blur-sm">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal open={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} />
    </header>
  );
};
