'use client';

import { useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { useNotificationStore, type Toast } from '@/store/notification-store';

const intentStyles: Record<Toast['type'], string> = {
  success: 'bg-emerald-500/90 text-white',
  error: 'bg-rose-500/90 text-white',
  info: 'bg-slate-900/90 text-white',
};

export function NotificationCenter() {
  const { items, dismiss } = useNotificationStore();

  useEffect(() => {
    if (!items.length) return;
    const timers = items.map((toast) => window.setTimeout(() => dismiss(toast.id), 4200));
    return () => timers.forEach(clearTimeout);
  }, [items, dismiss]);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {items.map((toast) => (
        <article
          key={toast.id}
          className={cn(
            'pointer-events-auto rounded-2xl p-4 shadow-2xl ring-1 shadow-black/25 ring-white/15 backdrop-blur-md transition',
            intentStyles[toast.type],
          )}
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.message ? <p className="text-xs text-white/90">{toast.message}</p> : null}
            </div>
            <button
              className="rounded-full bg-white/10 p-1 text-xs text-white/90 transition hover:bg-white/20"
              onClick={() => dismiss(toast.id)}
              aria-label="Закрыть уведомление"
            >
              ✕
            </button>
          </header>
        </article>
      ))}
    </div>
  );
}
