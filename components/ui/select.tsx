'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white shadow-inner shadow-white/10 transition outline-none focus:border-emerald-300 focus:bg-white/10',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = 'Select';
