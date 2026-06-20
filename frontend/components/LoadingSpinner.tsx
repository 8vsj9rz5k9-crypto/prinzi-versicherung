type LoadingSpinnerProps = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

export default function LoadingSpinner({
  label = 'Loading…',
  fullScreen = false,
  className
}: LoadingSpinnerProps) {
  const content = (
    <div className={`flex items-center gap-3 text-sm text-slate-500 ${className ?? ''}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      <span>{label}</span>
    </div>
  );

  if (fullScreen) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50">{content}</div>;
  }

  return content;
}
