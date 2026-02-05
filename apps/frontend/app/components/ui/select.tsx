'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5',
        'text-[--color-foreground]',
        'transition-all duration-200',
        'hover:bg-[--color-surface-hover] active:bg-[--color-surface-pressed]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:border-transparent',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-background]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

