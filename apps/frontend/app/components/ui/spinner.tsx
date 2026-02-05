'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-6 w-6 border-[3px]',
};

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      aria-label="Loading"
      role="status"
      className={cn(
        'animate-spin rounded-full border-[--color-primary]/40 border-t-transparent',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

