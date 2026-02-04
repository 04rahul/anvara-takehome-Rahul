'use client';

import { useActionState } from 'react';
import { useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import {
  createAdSlotAction,
  updateAdSlotAction,
  type AdSlotFormState,
} from '../actions';
import type { AdSlot } from '@/lib/types';

interface AdSlotFormProps {
  adSlot?: AdSlot | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[--color-primary] px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Saving...' : isEdit ? 'Update Ad Slot' : 'Create Ad Slot'}
    </button>
  );
}

export function AdSlotForm({ adSlot, onSuccess, onCancel }: AdSlotFormProps) {
  const isEdit = !!adSlot;
  const action = isEdit ? updateAdSlotAction : createAdSlotAction;
  const [state, formAction] = useActionState<AdSlotFormState | null, FormData>(action, null);

  // Close form on successful submission
  useEffect(() => {
    if (state?.success) {
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [state?.success, onSuccess]);

  return (
    <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-6 text-[--color-foreground]">
      <h2 className="mb-4 text-xl font-bold">
        {isEdit ? 'Edit Ad Slot' : 'Create New Ad Slot'}
      </h2>

      {state?.error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-600">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {isEdit && <input type="hidden" name="id" value={adSlot.id} />}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[--color-foreground]">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={adSlot?.name || ''}
            className="mt-1 w-full rounded border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] placeholder:text-[--color-muted]"
          />
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[--color-foreground]">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={adSlot?.description || ''}
            className="mt-1 w-full rounded border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] placeholder:text-[--color-muted]"
          />
          {state?.fieldErrors?.description && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-[--color-foreground]">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={adSlot?.type || 'DISPLAY'}
            className="mt-1 w-full rounded border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground]"
          >
            <option value="DISPLAY">Display</option>
            <option value="VIDEO">Video</option>
            <option value="NEWSLETTER">Newsletter</option>
            <option value="PODCAST">Podcast</option>
          </select>
          {state?.fieldErrors?.type && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.type}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="width" className="block text-sm font-medium text-[--color-foreground]">
              Width (px)
            </label>
            <input
              type="number"
              id="width"
              name="width"
              min="1"
              defaultValue={adSlot?.width?.toString() || ''}
              className="mt-1 w-full rounded border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] placeholder:text-[--color-muted]"
            />
            {state?.fieldErrors?.width && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.width}</p>
            )}
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium text-[--color-foreground]">
              Height (px)
            </label>
            <input
              type="number"
              id="height"
              name="height"
              min="1"
              defaultValue={adSlot?.height?.toString() || ''}
              className="mt-1 w-full rounded border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] placeholder:text-[--color-muted]"
            />
            {state?.fieldErrors?.height && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.height}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-[--color-foreground]">
            Position
          </label>
          <input
            type="text"
            id="position"
            name="position"
            defaultValue={adSlot?.position || ''}
            className="mt-1 w-full rounded border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] placeholder:text-[--color-muted]"
          />
          {state?.fieldErrors?.position && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.position}</p>
          )}
        </div>

        <div>
          <label htmlFor="basePrice" className="block text-sm font-medium text-[--color-foreground]">
            Base Price ($/month) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="basePrice"
            name="basePrice"
            required
            min="0"
            step="0.01"
            defaultValue={adSlot?.basePrice?.toString() || ''}
            className="mt-1 w-full rounded border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] placeholder:text-[--color-muted]"
          />
          {state?.fieldErrors?.basePrice && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.basePrice}</p>
          )}
        </div>

        {isEdit && (
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isAvailable"
                value="true"
                defaultChecked={adSlot?.isAvailable ?? true}
                className="rounded border-[--color-border]"
              />
              <span className="text-sm font-medium text-[--color-foreground]">Available</span>
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <SubmitButton isEdit={isEdit} />
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[--color-border] px-4 py-2 font-semibold text-[--color-foreground] hover:bg-[--color-muted]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
