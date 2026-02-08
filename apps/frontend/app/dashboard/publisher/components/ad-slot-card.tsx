'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { AdSlot } from '@/lib/types';
import { AdSlotForm } from './ad-slot-form';
import { deleteAdSlotAction } from '../actions';
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
import {
  ArrowUpRightIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  typeColors,
} from '@/app/components/icons';

interface AdSlotCardProps {
  adSlot: AdSlot;
}

export function AdSlotCard({ adSlot }: AdSlotCardProps) {
  const availabilityLabel = adSlot.isAvailable ? 'Available' : 'Booked';
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteState, deleteAction] = useActionState(deleteAdSlotAction, null);
  const lastDeleteToastKeyRef = useRef<string | null>(null);
  const router = useRouter();

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
      const successKey = 'delete-success';
      if (lastDeleteToastKeyRef.current !== successKey) {
        lastDeleteToastKeyRef.current = successKey;
        toast({
          title: 'Ad slot deleted',
          description: 'The ad slot was removed.',
          variant: 'success',
        });
      }
      // Delay refresh to ensure toast renders before component unmounts
      setTimeout(() => {
        router.refresh();
        setIsDeleteOpen(false);
      }, 150);
    }
  }, [deleteState?.success, router]);

  useEffect(() => {
    if (!deleteState?.error) return;

    const key = `delete-error:${deleteState.error}`;
    if (lastDeleteToastKeyRef.current === key) return;
    lastDeleteToastKeyRef.current = key;

    toast({
      title: 'Delete failed',
      description: deleteState.error,
      variant: 'error',
    });
  }, [deleteState?.error]);

  const actionButtonClassName =
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] bg-[--color-background] text-[--color-foreground] transition-all duration-200 hover:bg-[--color-surface-hover] hover:border-[--color-primary-light] hover:shadow-[var(--shadow-sm)] active:bg-[--color-surface-pressed] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]';

  return (
    <>
      <div className="group relative rounded-lg border border-[--color-border] bg-[--color-background] p-4 transition-all duration-200 hover:shadow-md hover:border-[--color-primary-light] hover:scale-[1.01] focus-within:outline-none focus-within:ring-2 focus-within:ring-[--color-primary]/30">
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <Link
            href={`/marketplace/${adSlot.id}`}
            className={actionButtonClassName}
            aria-label={`View ${adSlot.name} in marketplace`}
          >
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className={`${actionButtonClassName} ${!adSlot.isAvailable ? 'cursor-not-allowed opacity-50 hover:bg-[--color-background] hover:border-[--color-border] hover:shadow-none active:scale-100' : ''}`}
            aria-disabled={!adSlot.isAvailable}
            onClick={() => {
              if (!adSlot.isAvailable) {
                toast({
                  title: 'Booked placement',
                  description: 'This placement is already booked and cannot be edited.',
                  variant: 'default',
                });
                return;
              }
              setIsEditOpen(true);
            }}
            aria-label={`Edit ${adSlot.name}`}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`${actionButtonClassName} text-red-600 hover:border-red-300 focus-visible:ring-red-500 ${!adSlot.isAvailable ? 'cursor-not-allowed opacity-50 hover:bg-[--color-background] hover:border-[--color-border] hover:shadow-none active:scale-100' : ''}`}
            aria-disabled={!adSlot.isAvailable}
            onClick={() => {
              if (!adSlot.isAvailable) {
                toast({
                  title: 'Booked placement',
                  description: 'This placement is already booked and cannot be deleted.',
                  variant: 'default',
                });
                return;
              }
              setIsDeleteOpen(true);
            }}
            aria-label={`Delete ${adSlot.name}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 flex items-start justify-between pr-36">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{adSlot.name}</h3>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${typeColors[adSlot.type] || 'bg-gray-100 text-gray-700'
              }`}
          >
            <TagIcon className="h-3.5 w-3.5" />
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && (
          <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{adSlot.description}</p>
        )}

        <div className="mb-1 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 text-sm ${adSlot.isAvailable ? 'text-green-700' : 'text-[--color-muted]'
              }`}
          >
            {adSlot.isAvailable ? (
              <CheckCircleIcon className="h-4 w-4" />
            ) : (
              <XCircleIcon className="h-4 w-4" />
            )}
            {availabilityLabel}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-[--color-primary]">
            ${Number(adSlot.basePrice).toLocaleString()}/mo
          </span>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Edit Ad Slot</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <AdSlotForm
              adSlot={adSlot}
              onSuccess={() => setIsEditOpen(false)}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Ad Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{adSlot.name}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {deleteState?.error && (
            <Alert variant="error" className="mb-4">
              {deleteState.error}
            </Alert>
          )}

          <form
            action={deleteAction}
            className="flex gap-3"
            onSubmit={() => {
              // Allow a toast to show again for a repeated attempt.
              lastDeleteToastKeyRef.current = null;
            }}
          >
            <input type="hidden" name="id" value={adSlot.id} />
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
