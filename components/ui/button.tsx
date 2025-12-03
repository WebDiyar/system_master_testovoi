'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white shadow-lg shadow-emerald-500/30 hover:brightness-110',
  secondary:
    'bg-white/10 text-white border border-white/30 hover:border-white/60 hover:bg-white/20',
  ghost: 'text-foreground hover:bg-black/5 border border-transparent',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', disabled, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:pointer-events-none disabled:opacity-60',
      variantStyles[variant],
      className,
    );

    return (
      <button ref={ref} className={classes} disabled={disabled} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
