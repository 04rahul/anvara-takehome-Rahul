'use client';

import * as React from 'react';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import type { Campaign } from '@/lib/types';
import { CampaignForm } from './campaign-form';
import { deleteCampaignAction } from '../actions';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { toast } from '@/app/components/ui/toast';

interface CampaignCardProps {
  campaign: Campaign;
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 6l1 16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WalletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 7H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M18 12h4v6h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M17 7V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8 2v3M16 2v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 9h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 4h12a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress =
    campaign.budget > 0 ? (Number(campaign.spent) / Number(campaign.budget)) * 100 : 0;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteState, deleteAction] = useActionState(deleteCampaignAction, null);

  function DeleteButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" variant="destructive" className="flex-1" isLoading={pending}>
        {pending ? 'Deleting...' : 'Delete'}
      </Button>
    );
  }

  // Close delete modal on success
  useEffect(() => {
    if (deleteState?.success) {
      setIsDeleteOpen(false);
      toast({
        title: 'Campaign deleted',
        description: 'The campaign was removed.',
        variant: 'success',
      });
    }
  }, [deleteState?.success]);

  const status = campaign.status;
  const statusDotColor =
    status === 'ACTIVE'
      ? 'text-green-600'
      : status === 'PAUSED' || status === 'PENDING_REVIEW'
        ? 'text-yellow-600'
        : status === 'COMPLETED' || status === 'APPROVED'
          ? 'text-blue-600'
          : status === 'CANCELLED'
            ? 'text-red-600'
            : 'text-gray-500';

  return (
    <>
      <div className="group relative rounded-lg border border-[--color-border] bg-[--color-background] p-4 transition hover:shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-[--color-primary]/30">
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] bg-[--color-background] text-[--color-foreground] transition-all duration-200 hover:bg-[--color-surface-hover] hover:border-[--color-primary-light] hover:shadow-[var(--shadow-sm)] active:bg-[--color-surface-pressed] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
            onClick={() => setIsEditOpen(true)}
            aria-label={`Edit ${campaign.name}`}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] bg-[--color-background] text-red-600 transition-all duration-200 hover:bg-[--color-surface-hover] hover:border-red-300 hover:shadow-[var(--shadow-sm)] active:bg-[--color-surface-pressed] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            onClick={() => setIsDeleteOpen(true)}
            aria-label={`Delete ${campaign.name}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <Link 
          href={`/campaigns/${campaign.id}`}
          className="block"
        >
          <div className="mb-2 flex items-start justify-between pr-24">
            <h3 className="truncate font-semibold hover:text-[--color-primary] transition-colors">{campaign.name}</h3>
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${
                statusColors[campaign.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              <DotIcon className={`h-2.5 w-2.5 ${statusDotColor}`} />
              {status}
            </span>
          </div>
        </Link>

        <Link 
          href={`/campaigns/${campaign.id}`}
          className="block"
        >
          {campaign.description && (
            <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{campaign.description}</p>
          )}

          <div className="mb-2">
            <div className="flex justify-between text-sm">
              <span className="inline-flex items-center gap-1 text-[--color-muted]">
                <WalletIcon className="h-4 w-4" />
                Budget
              </span>
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

          <div className="inline-flex items-center gap-1 text-xs text-[--color-muted]">
            <CalendarIcon className="h-3.5 w-3.5" />
            {new Date(campaign.startDate).toLocaleDateString()} -{' '}
            {new Date(campaign.endDate).toLocaleDateString()}
          </div>
        </Link>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <CampaignForm
              campaign={campaign}
              onSuccess={() => setIsEditOpen(false)}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {deleteState?.error && (
            <Alert variant="error" className="mb-4">
              {deleteState.error}
            </Alert>
          )}

          <form action={deleteAction} className="flex gap-3">
            <input type="hidden" name="id" value={campaign.id} />
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <DeleteButton />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
