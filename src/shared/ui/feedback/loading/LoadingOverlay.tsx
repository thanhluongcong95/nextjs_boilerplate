'use client';

import { Spin } from 'antd';
import { useTranslations } from 'next-intl';

type Props = {
  message?: string;
};

export const LoadingOverlay = ({ message }: Props) => {
  const t = useTranslations('common');
  const resolvedMessage = message ?? t('loadingResources');

  return (
    <div className="flex min-h-[200px] items-center justify-center p-6">
      <Spin size="large" tip={resolvedMessage}>
        <div className="min-h-[100px]" />
      </Spin>
    </div>
  );
};
