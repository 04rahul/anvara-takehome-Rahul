'use client';

import type React from 'react';
import { ToastProvider } from './toast';
import { ThemeProvider } from '@/app/components/theme-provider';

export function UIProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

