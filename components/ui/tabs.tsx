'use client';

import { cn } from '@/shared/lib/utils';

type TabItem = {
  value: string;
  label: string;
  description?: string;
};

type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: TabItem[];
};

export function Tabs({ value, onValueChange, items }: TabsProps) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 shadow-inner shadow-white/5">
      <div className="grid grid-cols-2 gap-1">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onValueChange(item.value)}
              className={cn(
                'rounded-xl px-3 py-2 text-left text-sm font-semibold transition',
                active
                  ? 'bg-white text-slate-900 shadow-lg shadow-emerald-400/20'
                  : 'text-white/70 hover:text-white',
              )}
            >
              <div>{item.label}</div>
              {item.description ? (
                <p className="text-xs font-normal text-white/70">{item.description}</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
