type Mode = 'fullscreen' | 'card';

type RouteLoadingProps = {
  message?: string;
  description?: string;
  mode?: Mode;
};

export function RouteLoading({
  message = 'Loading…',
  description,
  mode = 'fullscreen',
}: RouteLoadingProps) {
  if (mode === 'card') {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-slate-200/80">
        <span className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute h-12 w-12 animate-[ping_1.5s_ease-in-out_infinite] rounded-full bg-indigo-500/30" />
          <span className="relative h-6 w-6 animate-spin rounded-full border-2 border-indigo-300/80 border-r-transparent border-t-transparent" />
        </span>
        <span className="text-sm font-medium tracking-wide text-slate-200/80">
          {message}
        </span>
        {description ? (
          <span className="text-xs text-slate-400/80">{description}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <span className="animate-pulse text-sm font-medium text-slate-500">{message}</span>
      {description ? <span className="sr-only"> {description}</span> : null}
    </div>
  );
}

export type { RouteLoadingProps };
