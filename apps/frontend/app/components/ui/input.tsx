'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5',
        'text-[--color-foreground] placeholder:text-[--color-muted]',
        'transition-all duration-200',
        'focus:outline-none focus:border-[--color-primary] focus:ring-0',
        'focus:-translate-y-0.5 focus:shadow-md focus:bg-[--color-surface-hover]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
});

