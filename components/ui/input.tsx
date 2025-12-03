'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-white/20 bg-white/5 px-3 text-sm text-white shadow-inner shadow-white/10 transition outline-none placeholder:text-slate-200 focus:border-emerald-300 focus:bg-white/10',
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
