import { createRouteLoading } from '@/shared/components/status/createRouteLoading';

export default createRouteLoading({
  message: 'Preparing secure login…',
  description: 'Performing compliance checks and session handshakes.',
  mode: 'card',
});
