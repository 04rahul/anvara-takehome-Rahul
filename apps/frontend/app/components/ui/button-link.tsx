'use client';

import Link from 'next/link';
import type React from 'react';
import { cn } from '@/lib/utils';
import { buttonClassName, type ButtonSize, type ButtonVariant } from './button';

export interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({ className, variant = 'primary', size = 'md', ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClassName({ variant, size, className }))} {...props} />
  );
}

