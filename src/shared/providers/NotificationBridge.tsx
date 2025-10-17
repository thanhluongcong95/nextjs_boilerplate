'use client';

import { App } from 'antd';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { setNotificationApi } from '@/shared/infra/errors/error-handler';

/**
 * Props for the NotificationBridge component
 */
interface NotificationBridgeProps {
  /** The children components to be rendered */
  children: ReactNode;
}

/**
 * NotificationBridge - Bridge component to connect Ant Design notification API with global error handler
 *
 * This component serves as a bridge between Ant Design's App context and the application's
 * global error handling system. It extracts the notification API from the App context and
 * registers it with the error handler, enabling centralized error notifications throughout
 * the application.
 *
 * Key Features:
 * - Accesses notification API via App.useApp() hook
 * - Registers the API with the global error handler on mount
 * - Re-registers when the notification instance changes
 * - Renders children without adding extra DOM nodes (uses Fragment)
 *
 * Usage Requirements:
 * - Must be placed inside an AntdProvider (which includes ConfigProvider and App)
 * - Should only be mounted once at the application root level
 * - Children will have access to the registered notification API through the error handler
 *
 * @example
 * ```tsx
 * // In AntdProvider
 * <ConfigProvider>
 *   <App>
 *     <NotificationBridge>
 *       {children}
 *     </NotificationBridge>
 *   </App>
 * </ConfigProvider>
 *
 * // Elsewhere in the app, errors can trigger notifications
 * import { handleError } from '@/shared/infra/errors/error-handler';
 *
 * try {
 *   await fetchData();
 * } catch (error) {
 *   handleError(error); // Will use registered notification API
 * }
 * ```
 *
 * @param props - The component props
 * @param props.children - The child components to render
 * @returns The children wrapped in a React Fragment
 */
export const NotificationBridge = ({ children }: Readonly<NotificationBridgeProps>) => {
  const { notification } = App.useApp();

  useEffect(() => {
    // Set the notification API for global error handler
    // This should only run once as this component is mounted at root level
    setNotificationApi(notification);
  }, [notification]);

  return <>{children}</>;
};
