import { Spin } from 'antd';

type Mode = 'fullscreen' | 'card';

type RouteLoadingProps = {
  message?: string;
  description?: string;
  mode?: Mode;
};

export function RouteLoading({ message = 'Loading…', description, mode = 'fullscreen' }: Readonly<RouteLoadingProps>) {
  if (mode === 'card') {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-4">
        <Spin size="large" tip={message}>
          <div className="min-h-[100px]" />
        </Spin>
        {description ? <span className="text-xs text-slate-400">{description}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Spin size="large" tip={message}>
        <div className="min-h-[100px]" />
      </Spin>
      {description ? <span className="sr-only"> {description}</span> : null}
    </div>
  );
}

export type { RouteLoadingProps };
