import { useAuthStore } from '../../context/authStore';
import { HiOutlineSignalSlash, HiOutlineArrowPath } from 'react-icons/hi2';
import Button from './Button';

export default function OfflineBanner() {
  const error = useAuthStore((s) => s.error);
  const offline = useAuthStore((s) => s.offline);
  const loading = useAuthStore((s) => s.loading);
  const retryConnection = useAuthStore((s) => s.retryConnection);
  const clearError = useAuthStore((s) => s.clearError);

  if (!error) return null;

  return (
    <div
      role="alert"
      className="flex w-full max-w-full min-w-0 flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-100"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <HiOutlineSignalSlash className="mt-0.5 h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          className="!py-1.5 !text-xs"
          onClick={() => retryConnection()}
          loading={loading}
        >
          <HiOutlineArrowPath className="h-4 w-4" />
          Retry
        </Button>
        {!offline && (
          <Button variant="ghost" className="!py-1.5 !text-xs" onClick={clearError}>
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}
