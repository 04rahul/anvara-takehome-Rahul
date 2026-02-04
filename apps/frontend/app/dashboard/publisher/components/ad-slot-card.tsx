'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteAdSlotAction } from '../actions';
import { AdSlotForm } from './ad-slot-form';
import type { AdSlot } from '@/lib/types';

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
    >
      {pending ? 'Deleting...' : 'Delete'}
    </button>
  );
}

interface AdSlotCardProps {
  adSlot: AdSlot;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

export function AdSlotCard({ adSlot }: AdSlotCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteState, deleteAction] = useActionState(deleteAdSlotAction, null);

  // Close delete modal on success
  if (deleteState?.success && isDeleteOpen) {
    setIsDeleteOpen(false);
  }

  return (
    <>
      <div className="rounded-lg border border-[--color-border] p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold">{adSlot.name}</h3>
          <span className={`rounded px-2 py-0.5 text-xs ${typeColors[adSlot.type] || 'bg-gray-100'}`}>
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && (
          <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{adSlot.description}</p>
        )}

        <div className="mb-3 flex items-center justify-between">
          <span
            className={`text-sm ${adSlot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
          >
            {adSlot.isAvailable ? 'Available' : 'Booked'}
          </span>
          <span className="font-semibold text-[--color-primary]">
            ${Number(adSlot.basePrice).toLocaleString()}/mo
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex-1 rounded border border-[--color-border] px-3 py-1.5 text-sm font-medium text-[--color-foreground] hover:bg-[--color-muted]"
          >
            Edit
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex-1 rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-2xl rounded-lg border border-[--color-border] bg-[--color-background] p-6 text-[--color-foreground] shadow-lg">
            <AdSlotForm
              adSlot={adSlot}
              onSuccess={() => setIsEditOpen(false)}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md rounded-lg border border-[--color-border] bg-[--color-background] p-6 text-[--color-foreground] shadow-lg">
            <h3 className="mb-4 text-lg font-bold">Delete Ad Slot</h3>
            <p className="mb-4 text-[--color-muted]">
              Are you sure you want to delete &quot;{adSlot.name}&quot;? This action cannot be undone.
            </p>
            {deleteState?.error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-600">
                {deleteState.error}
              </div>
            )}
            <form action={deleteAction} className="flex gap-3">
              <input type="hidden" name="id" value={adSlot.id} />
              <DeleteButton />
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 rounded-lg border border-[--color-border] px-4 py-2 font-semibold text-[--color-foreground] hover:bg-[--color-muted]"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
