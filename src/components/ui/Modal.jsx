import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative max-h-[90dvh] w-full max-w-[min(100%,calc(100vw-2rem))] ${widths[size]} animate-slide-up overflow-hidden rounded-2xl border border-border-light bg-card-light shadow-2xl dark:border-border-dark dark:bg-card-dark`}
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4 dark:border-border-dark">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
