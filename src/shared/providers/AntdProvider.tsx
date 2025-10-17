'use client';

import { App, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';

import { NotificationBridge } from './NotificationBridge';

/**
 * Props for the AntdProvider component
 */
interface AntdProviderProps {
  /** The children components to be wrapped by the provider */
  children: ReactNode;
}

/**
 * AntdProvider - Main provider component for Ant Design configuration
 *
 * This component sets up the Ant Design ecosystem for the application by:
 * - Configuring the global theme (colors, border radius, etc.)
 * - Providing the App context for message, notification, and modal APIs
 * - Connecting the notification API to the global error handler via NotificationBridge
 *
 * Provider Hierarchy:
 * ConfigProvider → App → NotificationBridge → children
 *
 * @example
 * ```tsx
 * // In your root layout
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AntdProvider>
 *           {children}
 *         </AntdProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @param props - The component props
 * @param props.children - The child components to render within the provider
 * @returns The provider component wrapping the children
 */
export function AntdProvider({ children }: Readonly<AntdProviderProps>) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <App>
        <NotificationBridge>{children}</NotificationBridge>
      </App>
    </ConfigProvider>
  );
}
