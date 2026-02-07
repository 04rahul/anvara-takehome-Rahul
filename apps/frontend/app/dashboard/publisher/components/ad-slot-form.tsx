'use client';

import { useActionState, useEffect, useMemo, useRef, useState, type WheelEventHandler } from 'react';
import { useFormStatus } from 'react-dom';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from '@/app/components/ui/toast';
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
    <Button type="submit" isLoading={pending} className="min-w-[160px]">
      {pending ? 'Saving…' : isEdit ? 'Update Ad Slot' : 'Create Ad Slot'}
    </Button>
  );
}

type AdSlotFormClientValues = {
  id: string;
  currentIsAvailable: string;
  name: string;
  description: string;
  type: string;
  width: string;
  height: string;
  position: string;
  basePrice: string;
  isAvailable: boolean;
};

export function AdSlotForm({ adSlot, onSuccess, onCancel }: AdSlotFormProps) {
  const isEdit = !!adSlot;
  const action = isEdit ? updateAdSlotAction : createAdSlotAction;
  const [state, formAction] = useActionState<AdSlotFormState | null, FormData>(action, null);
  const lastToastKeyRef = useRef<string | null>(null);
  const blurOnWheel: WheelEventHandler<HTMLInputElement> = (e) => {
    // Prevent scroll-wheel from changing number inputs (common surprise behavior in modals).
    if (e.currentTarget === document.activeElement) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const initialValues: AdSlotFormClientValues = useMemo(() => {
    return {
      id: adSlot?.id ?? '',
      currentIsAvailable: String(adSlot?.isAvailable ?? true),
      name: adSlot?.name ?? '',
      description: adSlot?.description ?? '',
      type: adSlot?.type ?? 'DISPLAY',
      width: adSlot?.width?.toString() ?? '',
      height: adSlot?.height?.toString() ?? '',
      position: adSlot?.position ?? '',
      basePrice: adSlot?.basePrice?.toString() ?? '',
      isAvailable: adSlot?.isAvailable ?? true,
    };
  }, [
    adSlot?.id,
    adSlot?.isAvailable,
    adSlot?.name,
    adSlot?.description,
    adSlot?.type,
    adSlot?.width,
    adSlot?.height,
    adSlot?.position,
    adSlot?.basePrice,
  ]);

  const [values, setValues] = useState<AdSlotFormClientValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    const serverValues = state?.values;
    if (!serverValues) return;

    setValues((prev) => ({
      ...prev,
      ...serverValues,
    }));
  }, [state?.values]);

  // Close form on successful submission
  useEffect(() => {
    if (state?.success) {
      const successKey = isEdit ? 'update-success' : 'create-success';
      if (lastToastKeyRef.current !== successKey) {
        lastToastKeyRef.current = successKey;
        toast(
          isEdit
            ? { title: 'Ad slot updated', description: 'Your changes were saved.', variant: 'success' }
            : { title: 'Ad slot created', description: 'Your new ad slot is now available.', variant: 'success' }
        );
      }
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [state?.success, onSuccess, isEdit]);

  useEffect(() => {
    if (!state?.error) return;

    const key = `${isEdit ? 'update' : 'create'}-error:${state.error}`;
    if (lastToastKeyRef.current === key) return;
    lastToastKeyRef.current = key;

    toast({
      title: isEdit ? 'Update failed' : 'Create failed',
      description: state.error,
      variant: 'error',
    });
  }, [state?.error, isEdit]);

  return (
    <div className="text-[--color-foreground]">
      <div className="mb-6 space-y-1 pr-10">
        <h2 className="text-xl font-bold leading-tight">
          {isEdit ? 'Edit Ad Slot' : 'Create Ad Slot'}
        </h2>
        <p className="text-sm text-[--color-muted]">
          Define the placement details and pricing. You can edit this later.
        </p>
      </div>

      {state?.error && (
        <Alert variant="error" className="mb-4">
          {state.error}
        </Alert>
      )}

      <form
        action={formAction}
        className="flex flex-col"
        onSubmit={() => {
          // Allow toasts to fire again for subsequent submissions.
          lastToastKeyRef.current = null;
        }}
      >
        {isEdit && <input type="hidden" name="id" value={values.id} />}
        {isEdit && <input type="hidden" name="currentIsAvailable" value={values.currentIsAvailable} />}

        <div className="space-y-5 pr-1">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Name <span className="text-[--color-error]">*</span>
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
            {state?.fieldErrors?.name && (
              <p className="mt-1 text-sm text-[--color-error]">{state.fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-[--color-foreground]"
            >
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            />
            {state?.fieldErrors?.description && (
              <p className="mt-1 text-sm text-[--color-error]">{state.fieldErrors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Type <span className="text-[--color-error]">*</span>
            </label>
            <Select
              id="type"
              name="type"
              required
              value={values.type}
              onChange={(e) => setValues((v) => ({ ...v, type: e.target.value }))}
            >
              <option value="DISPLAY">Display</option>
              <option value="VIDEO">Video</option>
              <option value="NEWSLETTER">Newsletter</option>
              <option value="PODCAST">Podcast</option>
            </Select>
            {state?.fieldErrors?.type && (
              <p className="mt-1 text-sm text-[--color-error]">{state.fieldErrors.type}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="width" className="mb-2 block text-sm font-medium text-[--color-foreground]">
                Width (px)
              </label>
              <Input
                type="number"
                id="width"
                name="width"
                min="1"
                value={values.width}
                onWheel={blurOnWheel}
                onChange={(e) => setValues((v) => ({ ...v, width: e.target.value }))}
                disabled={values.type === 'PODCAST'}
              />
              {state?.fieldErrors?.width && (
                <p className="mt-1 text-sm text-[--color-error]">{state.fieldErrors.width}</p>
              )}
            </div>

            <div>
              <label htmlFor="height" className="mb-2 block text-sm font-medium text-[--color-foreground]">
                Height (px)
              </label>
              <Input
                type="number"
                id="height"
                name="height"
                min="1"
                value={values.height}
                onWheel={blurOnWheel}
                onChange={(e) => setValues((v) => ({ ...v, height: e.target.value }))}
                disabled={values.type === 'PODCAST'}
              />
              {state?.fieldErrors?.height && (
                <p className="mt-1 text-sm text-[--color-error]">{state.fieldErrors.height}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="position" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Position
            </label>
            <Input
              type="text"
              id="position"
              name="position"
              value={values.position}
              onChange={(e) => setValues((v) => ({ ...v, position: e.target.value }))}
            />
            {state?.fieldErrors?.position && (
              <p className="mt-1 text-sm text-[--color-error]">{state.fieldErrors.position}</p>
            )}
          </div>

          <div>
            <label htmlFor="basePrice" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Base Price ($/month) <span className="text-[--color-error]">*</span>
            </label>
            <Input
              type="number"
              id="basePrice"
              name="basePrice"
              required
              min="0"
              step="0.01"
              value={values.basePrice}
              onWheel={blurOnWheel}
              onChange={(e) => setValues((v) => ({ ...v, basePrice: e.target.value }))}
            />
            {state?.fieldErrors?.basePrice && (
              <p className="mt-1 text-sm text-[--color-error]">{state.fieldErrors.basePrice}</p>
            )}
          </div>


        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <SubmitButton isEdit={isEdit} />
        </div>
      </form>
    </div>
  );
}
