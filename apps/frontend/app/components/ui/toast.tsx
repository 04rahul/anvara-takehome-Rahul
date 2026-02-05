'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

export type ToastVariant = 'default' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastItem extends Required<ToastOptions> {
  id: string;
}

type ToastListener = (toast: ToastItem) => void;

const listeners = new Set<ToastListener>();

function emitToast(item: ToastItem) {
  listeners.forEach((l) => l(item));
}

export function toast(options: ToastOptions) {
  emitToast({
    id: crypto.randomUUID(),
    title: options.title,
    description: options.description ?? '',
    variant: options.variant ?? 'default',
    durationMs: options.durationMs ?? (options.variant === 'error' ? 7000 : 4000),
  });
}

const variantClasses: Record<ToastVariant, string> = {
  default: 'border-[--color-border] bg-[--color-background] text-[--color-foreground]',
  success: 'border-green-200 bg-green-50 text-green-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    const listener: ToastListener = (t) => {
      setItems((prev) => [t, ...prev].slice(0, 5));
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      {items.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          duration={t.durationMs}
          onOpenChange={(open) => {
            if (!open) setItems((prev) => prev.filter((x) => x.id !== t.id));
          }}
          className={cn(
            'group relative w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border p-4 shadow-lg',
            'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95',
            'data-[state=closed]:opacity-0',
            variantClasses[t.variant]
          )}
        >
          <div className="pr-8">
            <div className="font-semibold">{t.title}</div>
            {t.description ? <div className="mt-1 text-sm opacity-90">{t.description}</div> : null}
          </div>
          <ToastPrimitive.Close asChild>
            <button
              type="button"
              aria-label="Dismiss notification"
              className={cn(
                'absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full',
                'border border-[--color-border] bg-[--color-background]/60',
                'opacity-0 transition-opacity group-hover:opacity-100',
                'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]'
              )}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}

      <ToastPrimitive.Viewport
        className={cn(
          'fixed bottom-4 right-4 z-[var(--z-toast)] flex max-h-[calc(100vh-2rem)] w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none'
        )}
      />
    </ToastPrimitive.Provider>
  );
}

