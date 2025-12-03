'use client';

import { type LabelHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label className={cn('text-sm font-semibold text-white', className)} {...props}>
      {children}
    </label>
  );
}
