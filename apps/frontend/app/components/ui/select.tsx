'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 pr-10',
          'text-[--color-foreground]',
          'transition-all duration-200',
          'hover:bg-[--color-surface-hover] active:bg-[--color-surface-pressed]',
          'focus:outline-none focus:border-[--color-primary] focus:ring-0',
          'focus:-translate-y-0.5 focus:shadow-md focus:bg-[--color-surface-hover]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </select>

      {/* Chevron icon (keeps styling consistent when native appearance is removed) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className={cn(
          'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2',
          'text-[--color-muted]',
          props.disabled ? 'opacity-50' : 'opacity-90'
        )}
      >
        <path
          d="M5.5 7.5 10 12l4.5-4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

