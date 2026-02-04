'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteCampaignAction } from '../actions';
import { CampaignForm } from './campaign-form';
import type { Campaign } from '@/lib/types';

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

interface CampaignCardProps {
  campaign: Campaign;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteState, deleteAction] = useActionState(deleteCampaignAction, null);

  const progress =
    campaign.budget > 0 ? (Number(campaign.spent) / Number(campaign.budget)) * 100 : 0;

  // Close delete modal on success
  if (deleteState?.success && isDeleteOpen) {
    setIsDeleteOpen(false);
  }

  return (
    <>
      <div className="rounded-lg border border-[--color-border] p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold">{campaign.name}</h3>
          <span
            className={`rounded px-2 py-0.5 text-xs ${statusColors[campaign.status] || 'bg-gray-100'}`}
          >
            {campaign.status}
          </span>
        </div>

        {campaign.description && (
          <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{campaign.description}</p>
        )}

        <div className="mb-2">
          <div className="flex justify-between text-sm">
            <span className="text-[--color-muted]">Budget</span>
            <span>
              ${Number(campaign.spent).toLocaleString()} / ${Number(campaign.budget).toLocaleString()}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-[--color-primary]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="mb-3 text-xs text-[--color-muted]">
          {new Date(campaign.startDate).toLocaleDateString()} -{' '}
          {new Date(campaign.endDate).toLocaleDateString()}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg border border-[--color-border] bg-[--color-background] p-6 text-[--color-foreground] opacity-100 shadow-lg transition-all duration-300 animate-in fade-in zoom-in-95">
            <CampaignForm
              campaign={campaign}
              onSuccess={() => setIsEditOpen(false)}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md rounded-lg border border-[--color-border] bg-[--color-background] p-6 text-[--color-foreground] shadow-lg">
            <h3 className="mb-4 text-lg font-bold">Delete Campaign</h3>
            <p className="mb-4 text-[--color-muted]">
              Are you sure you want to delete &quot;{campaign.name}&quot;? This action cannot be undone.
            </p>
            {deleteState?.error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-600">
                {deleteState.error}
              </div>
            )}
            <form action={deleteAction} className="flex gap-3">
              <input type="hidden" name="id" value={campaign.id} />
              <DeleteButton />
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 min-h-[44px] rounded-lg border border-[--color-border] bg-[--color-background] px-6 py-2.5 font-medium text-[--color-foreground] transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
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
