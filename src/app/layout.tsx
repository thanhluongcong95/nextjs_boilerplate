import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

import { RecoilProvider } from '@/shared/components/providers/RecoilProvider';
import { siteConfig } from '@/shared/constants/site';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RecoilProvider>{children}</RecoilProvider>
      </body>
    </html>
  );
}
