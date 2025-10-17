'use client';

import { createRouteError } from '@/shared/components/status/createRouteError';
import { logError } from '@/shared/lib/monitoring/logger';

const DashboardError = createRouteError({
  onError: error => logError(error, { location: 'DashboardPage' }),
});

export default DashboardError;
