'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 space-y-1', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex gap-3', className)} {...props} />;
}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-xl font-bold text-[--color-foreground]', className)}
      {...props}
    />
  );
});

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-[--color-muted]', className)}
      {...props}
    />
  );
});

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(function DialogContent({ className, children, showCloseButton = true, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-[var(--z-dialog)] bg-[--color-dialog-overlay] backdrop-blur-sm',
          'data-[state=open]:animate-in data-[state=open]:fade-in'
        )}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-[calc(var(--z-dialog)+1)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2',
          'rounded-lg border border-[--color-border] bg-[--color-dialog-surface] p-6 text-[--color-foreground]',
          'ring-1 ring-[--color-dialog-ring] shadow-[var(--shadow-lg)]',
          'focus-visible:outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95',
          className
        )}
        {...props}
      >
        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              aria-label="Close dialog"
              className={cn(
                'group absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full',
                'border border-[--color-border] text-[--color-foreground]',
                'transition-all duration-200',
                'hover:bg-[--color-surface-hover] hover:border-[--color-primary-light] hover:text-[--color-primary] hover:shadow-[var(--shadow-sm)]',
                'active:bg-[--color-surface-pressed] active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]'
              )}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

