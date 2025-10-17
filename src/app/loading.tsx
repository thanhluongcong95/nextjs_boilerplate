import { RouteLoading } from '@/shared/components/status/RouteLoading';

export default function RootLoading() {
  return (
    <RouteLoading
      message="Loading application shell…"
      description="Initializing providers and preparing the experience."
    />
  );
}
