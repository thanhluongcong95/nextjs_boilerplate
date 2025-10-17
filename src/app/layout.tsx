import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { siteConfig } from '@/shared/config/site';
import { AntdProvider } from '@/shared/providers/AntdProvider';
import { RecoilProvider } from '@/shared/providers/RecoilProvider';

import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: Readonly<RootLayoutProps>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <AntdRegistry>
          <AntdProvider>
            <RecoilProvider>{children}</RecoilProvider>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
