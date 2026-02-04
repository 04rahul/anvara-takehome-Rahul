'use client';

import { useState } from 'react';
import { CampaignForm } from './campaign-form';

export function CreateCampaignButton() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-[--color-primary] px-4 py-2 font-semibold text-white hover:opacity-90"
      >
        Create Campaign
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg border border-[--color-border] bg-[--color-background] p-6 text-[--color-foreground] opacity-100 shadow-lg transition-all duration-300 animate-in fade-in zoom-in-95">
        <CampaignForm
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}
