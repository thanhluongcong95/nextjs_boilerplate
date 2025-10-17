import {
  RouteLoading,
  type RouteLoadingProps,
} from '@/shared/components/status/RouteLoading';

type RouteLoadingOptions = RouteLoadingProps;

export function createRouteLoading(options: RouteLoadingOptions = {}) {
  const config: RouteLoadingOptions = { ...options };

  const RouteLoadingComponent = function RouteLoadingComponent() {
    return <RouteLoading {...config} />;
  };

  RouteLoadingComponent.displayName = `RouteLoading(${config.message ?? 'Loading…'})`;

  return RouteLoadingComponent;
}
