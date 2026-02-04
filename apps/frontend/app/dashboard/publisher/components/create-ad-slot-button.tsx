'use client';

import { useState } from 'react';
import { AdSlotForm } from './ad-slot-form';

export function CreateAdSlotButton() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-[--color-primary] px-4 py-2 font-semibold text-white hover:opacity-90"
      >
        Create Ad Slot
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-2xl rounded-lg border border-[--color-border] bg-[--color-background] p-6 text-[--color-foreground] shadow-lg">
        <AdSlotForm
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}
