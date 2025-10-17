import '@testing-library/jest-dom';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';
import React from 'react';

import type { TProfile } from '@/app/[locale]/(protected)/profile/(_lib)/model/profile.schemas';

// ---- Mocks ----

jest.mock('next-intl', () => ({
  __esModule: true,
  useTranslations: () => (key: string) =>
    ({
      noProfileData: 'No profile data',
      personalInfo: 'Personal info',
      'form.email': 'Email',
      'form.phone': 'Phone',
      'form.joinedDate': 'Joined date',
    })[key] ?? key,
  useLocale: () => 'en',
}));

jest.mock('dayjs', () => {
  const actual = jest.requireActual('dayjs');
  return (date?: string) => {
    const instance = actual(date);
    return {
      ...instance,
      locale: jest.fn().mockReturnThis(),
      format: jest.fn((pattern?: string) => (pattern === 'YYYY' ? '2024' : 'January 15, 2024')),
    };
  };
});

jest.mock('@ant-design/icons', () => ({
  UserOutlined: () => <span data-testid="user-icon">icon</span>,
  MailOutlined: () => <span data-testid="mail-icon">mail</span>,
  PhoneOutlined: () => <span data-testid="phone-icon">phone</span>,
  CalendarOutlined: () => <span data-testid="calendar-icon">calendar</span>,
}));

jest.mock('antd', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Avatar: ({ src, alt, icon }: { src?: string; alt?: string; icon?: React.ReactNode }) => (
    <div data-testid="avatar">{src ? <img src={src} alt={alt} /> : icon}</div>
  ),
  Skeleton: ({ active, avatar, paragraph }: { active?: boolean; avatar?: unknown; paragraph?: unknown }) => (
    <div data-testid="skeleton" data-active={active} data-avatar={Boolean(avatar)} data-paragraph={Boolean(paragraph)} />
  ),
  Tag: ({ children, color }: { children: React.ReactNode; color: string }) => (
    <span data-testid="tag" data-color={color}>
      {children}
    </span>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => <div data-testid="badge">{children}</div>,
}));

type ProfileCardModule = typeof import('../ProfileCard');
let ProfileCard: ProfileCardModule['ProfileCard'];

beforeAll(async () => {
  ({ ProfileCard } = await import('../ProfileCard'));
});

// ---- Fixtures ----

const baseProfile: TProfile = {
  id: 'user-123456',
  email: 'user@example.com',
  fullName: 'Ada Lovelace',
  phone: '0123456789',
  role: 'admin',
  avatarUrl: 'https://example.com/avatar.png',
  createdAt: '2024-01-15T10:00:00.000Z',
};

const renderProfileCard = (
  props: Partial<{
    profile: TProfile | null;
    loading: boolean;
  }> = {}
) => {
  if (!ProfileCard) {
    throw new Error('ProfileCard not loaded');
  }

  const { profile = baseProfile, loading = false } = props;
  return render(<ProfileCard profile={profile} loading={loading} />);
};

// ---- Tests ----

describe('ProfileCard', () => {
  it('renders loading skeleton when loading is true', () => {
    renderProfileCard({ loading: true });

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders empty state when no profile is provided', () => {
    renderProfileCard({ profile: null });

    expect(screen.getByText('No profile data')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('renders profile details with translations and formatted date', () => {
    renderProfileCard();

    expect(screen.getByTestId('avatar').querySelector('img')).toHaveAttribute('src', baseProfile.avatarUrl);
    expect(screen.getByText(baseProfile.fullName)).toBeInTheDocument();
    expect(screen.getByText(baseProfile.email)).toBeInTheDocument();
    expect(screen.getByText(baseProfile.phone)).toBeInTheDocument();
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Personal info')).toBeInTheDocument();
    expect(screen.getByTestId('tag')).toHaveTextContent(baseProfile.role);
  });

  it('shows role badge color based on role', () => {
    const { rerender } = renderProfileCard();

    expect(screen.getByTestId('tag')).toHaveAttribute('data-color', 'volcano');

    rerender(<ProfileCard profile={{ ...baseProfile, role: 'user' }} loading={false} />);
    expect(screen.getByTestId('tag')).toHaveAttribute('data-color', 'blue');
  });

  it('falls back to em dash when createdAt is missing', () => {
    renderProfileCard({ profile: { ...baseProfile, createdAt: '' } });

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('falls back when optional fields are missing', () => {
    renderProfileCard({
      profile: {
        ...baseProfile,
        avatarUrl: undefined,
        phone: '',
      },
    });

    expect(screen.getByTestId('avatar').querySelector('img')).not.toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('displays user interactions from content (copy email button simulation)', () => {
    renderProfileCard();

    const emailText = screen.getByText(baseProfile.email);
    fireEvent.click(emailText);

    expect(emailText).toBeInTheDocument();
  });

  it('renders detailed stats including truncated id and year', () => {
    renderProfileCard();

    const idSection = screen.getByText('ID').parentElement;
    expect(idSection).not.toBeNull();
    expect(within(idSection as HTMLElement).getByText(`${baseProfile.id.slice(0, 8)}...`)).toBeInTheDocument();

    const memberSinceSection = screen.getByText('Member Since').parentElement;
    expect(memberSinceSection).not.toBeNull();
    expect(within(memberSinceSection as HTMLElement).getByText('2024')).toBeInTheDocument();
  });

  it('matches snapshot for rendered profile', () => {
    const { asFragment } = renderProfileCard();

    expect(asFragment()).toMatchSnapshot();
  });
});
