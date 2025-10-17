type Props = {
  message?: string;
};

export const LoadingOverlay = ({ message = 'Loading resources' }: Props) => {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
      <span className="animate-pulse text-sm font-medium text-slate-500">{message}…</span>
    </div>
  );
};
