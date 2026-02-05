'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    // Use explicit var(...) so the styles work even if Tailwind's CSS-var shorthand isn't enabled.
    'border border-transparent bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-hover)] hover:shadow-md active:scale-[0.98] focus-visible:ring-[var(--color-primary)]',
  secondary:
    'border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-pressed)] focus-visible:ring-[var(--color-primary)]',
  outline:
    'border-2 border-[var(--color-primary)] bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus-visible:ring-[var(--color-primary)]',
  ghost:
    'bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-pressed)] focus-visible:ring-[var(--color-primary)]',
  destructive:
    'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-hover)] active:bg-[var(--color-error-pressed)] active:scale-[0.98] focus-visible:ring-[var(--color-error)]',
  link: 'bg-transparent p-0 text-[var(--color-primary)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-primary)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-2 text-sm',
  md: 'min-h-[44px] px-6 py-2.5 text-sm font-medium',
  lg: 'min-h-12 px-7 py-3 text-base font-semibold',
};

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className,
  isDisabled,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  isDisabled?: boolean;
}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg select-none',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]',
    isDisabled ? 'opacity-50 cursor-not-allowed' : '',
    isDisabled ? 'pointer-events-none' : 'cursor-pointer',
    variant === 'link' ? '' : sizeClasses[size],
    variantClasses[variant],
    className
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props },
  ref
) {
  const isDisabled = disabled || isLoading;
  const showSpinner = isLoading && variant !== 'link';

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(buttonClassName({ variant, size, className }), 'disabled:opacity-50 disabled:cursor-not-allowed')}
      {...props}
    >
      {showSpinner && (
        <span
          aria-hidden="true"
          className={cn(
            'inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent',
            variant === 'secondary' || variant === 'ghost' || variant === 'outline'
              ? 'border-[var(--color-primary)]/40 border-t-transparent'
              : ''
          )}
        />
      )}
      {children}
    </button>
  );
});

