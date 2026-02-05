'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const styles: Record<AlertVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-green-200 bg-green-50 text-green-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

export function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  return (
    <div className={cn('rounded-lg border p-4', styles[variant], className)} {...props}>
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div className="text-sm">{children}</div>
    </div>
  );
}

