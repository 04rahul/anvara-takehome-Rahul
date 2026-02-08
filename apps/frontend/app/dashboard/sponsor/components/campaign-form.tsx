'use client';

import { useActionState, useEffect, useMemo, useState, type WheelEventHandler } from 'react';
import { useFormStatus } from 'react-dom';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import {
  createCampaignAction,
  updateCampaignAction,
  type CampaignFormState,
} from '../actions';
import type { Campaign } from '@/lib/types';

interface CampaignFormProps {
  campaign?: Campaign | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="min-w-[160px]">
      {pending ? 'Saving…' : isEdit ? 'Update Campaign' : 'Create Campaign'}
    </Button>
  );
}

// Helper to format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

type CampaignFormClientValues = {
  id: string;
  spent: string;
  name: string;
  description: string;
  budget: string;
  cpmRate: string;
  cpcRate: string;
  startDate: string;
  endDate: string;
  status: string;
  targetCategories: string;
  targetRegions: string;
};

export function CampaignForm({ campaign, onSuccess, onCancel }: CampaignFormProps) {
  const isEdit = !!campaign;
  const action = isEdit ? updateCampaignAction : createCampaignAction;
  const [state, formAction] = useActionState<CampaignFormState | null, FormData>(action, null);
  const isStartDateLocked =
    isEdit && campaign?.startDate ? new Date(campaign.startDate) <= new Date() : false;
  const spentAmount = isEdit ? Number(campaign?.spent ?? 0) : 0;
  const blurOnWheel: WheelEventHandler<HTMLInputElement> = (e) => {
    // Prevent scroll-wheel from changing number inputs (common "2999.91" style bugs in modals).
    if (e.currentTarget === document.activeElement) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const initialValues: CampaignFormClientValues = useMemo(() => {
    const targetCategories = campaign?.targetCategories
      ? Array.isArray(campaign.targetCategories)
        ? campaign.targetCategories.join(', ')
        : campaign.targetCategories
      : '';

    const targetRegions = campaign?.targetRegions
      ? Array.isArray(campaign.targetRegions)
        ? campaign.targetRegions.join(', ')
        : campaign.targetRegions
      : '';

    return {
      id: campaign?.id ?? '',
      spent: String(campaign?.spent ?? 0),
      name: campaign?.name ?? '',
      description: campaign?.description ?? '',
      budget: campaign?.budget?.toString() ?? '',
      cpmRate: campaign?.cpmRate?.toString() ?? '',
      cpcRate: campaign?.cpcRate?.toString() ?? '',
      startDate: formatDateForInput(campaign?.startDate),
      endDate: formatDateForInput(campaign?.endDate),
      status: campaign?.status ?? 'DRAFT',
      targetCategories,
      targetRegions,
    };
  }, [
    campaign?.id,
    campaign?.spent,
    campaign?.name,
    campaign?.description,
    campaign?.budget,
    campaign?.cpmRate,
    campaign?.cpcRate,
    campaign?.startDate,
    campaign?.endDate,
    campaign?.status,
    // These can be arrays, so depend on a stable string representation
    Array.isArray(campaign?.targetCategories)
      ? campaign?.targetCategories.join(',')
      : campaign?.targetCategories,
    Array.isArray(campaign?.targetRegions) ? campaign?.targetRegions.join(',') : campaign?.targetRegions,
  ]);

  const [values, setValues] = useState<CampaignFormClientValues>(initialValues);

  // Reset values when switching between create/edit or different entities
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  // Hydrate values returned from the server action on errors (prevents input reset)
  useEffect(() => {
    const serverValues = state?.values;
    if (!serverValues) return;

    setValues((prev) => ({
      ...prev,
      ...serverValues,
      status: serverValues.status ?? prev.status,
    }));
  }, [state?.values]);

  // Close form on successful submission
  useEffect(() => {
    if (state?.success) {
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [state?.success, onSuccess]);

  return (
    <div className="text-[--color-foreground]">
      <div className="mb-6 space-y-1 pr-10">
        <h2 className="text-xl font-bold leading-tight">
          {isEdit ? 'Edit Campaign' : 'Create Campaign'}
        </h2>
        <p className="text-sm text-[--color-muted]">
          Set your budget, schedule, and targeting. You can update details later.
        </p>
      </div>

      {state?.error && (
        <Alert variant="error" className="mb-4">
          {state.error}
        </Alert>
      )}

      <form action={formAction} className="flex flex-col">
        {isEdit && <input type="hidden" name="id" value={values.id} />}
        {isEdit && <input type="hidden" name="spent" value={values.spent} />}

        <div className="space-y-5 pr-1">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Name <span className="text-[var(--color-error)]">*</span>
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
              <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-[--color-foreground]">
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
              <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="budget" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Budget ($) <span className="text-[var(--color-error)]">*</span>
            </label>
            <Input
              type="number"
              id="budget"
              name="budget"
              required
              min={isEdit ? spentAmount : 1}
              step="0.01"
              value={values.budget}
              onWheel={blurOnWheel}
              onChange={(e) => setValues((v) => ({ ...v, budget: e.target.value }))}
            />
            {isEdit && spentAmount > 0 && (
              <p className="mt-1 text-xs text-[--color-muted]">
                Already spent: <span className="font-medium text-[--color-foreground]">${spentAmount.toLocaleString()}</span> (budget can’t be set lower)
              </p>
            )}
            {state?.fieldErrors?.budget && (
              <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.budget}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cpmRate" className="mb-2 block text-sm font-medium text-[--color-foreground]">
                CPM Rate ($)
              </label>
              <Input
                type="number"
                id="cpmRate"
                name="cpmRate"
                min="0"
                step="0.01"
                value={values.cpmRate}
                onWheel={blurOnWheel}
                onChange={(e) => setValues((v) => ({ ...v, cpmRate: e.target.value }))}
              />
              {state?.fieldErrors?.cpmRate && (
                <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.cpmRate}</p>
              )}
            </div>

            <div>
              <label htmlFor="cpcRate" className="mb-2 block text-sm font-medium text-[--color-foreground]">
                CPC Rate ($)
              </label>
              <Input
                type="number"
                id="cpcRate"
                name="cpcRate"
                min="0"
                step="0.01"
                value={values.cpcRate}
                onWheel={blurOnWheel}
                onChange={(e) => setValues((v) => ({ ...v, cpcRate: e.target.value }))}
              />
              {state?.fieldErrors?.cpcRate && (
                <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.cpcRate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-[--color-foreground]">
                Start Date <span className="text-[var(--color-error)]">*</span>
              </label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                required={!isEdit}
                disabled={isStartDateLocked}
                value={values.startDate}
                onChange={(e) => setValues((v) => ({ ...v, startDate: e.target.value }))}
              />
              {state?.fieldErrors?.startDate && (
                <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-[--color-foreground]">
                End Date <span className="text-[var(--color-error)]">*</span>
              </label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                required={!isEdit}
                value={values.endDate}
                onChange={(e) => setValues((v) => ({ ...v, endDate: e.target.value }))}
              />
              {state?.fieldErrors?.endDate && (
                <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.endDate}</p>
              )}
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPaused"
                name="isPaused"
                value="true"
                checked={values.status === 'PAUSED'}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setValues((v) => ({ ...v, status: isChecked ? 'PAUSED' : 'ACTIVE' }));
                }}
                className="h-4 w-4 rounded border-gray-300 text-[--color-primary] focus:ring-[--color-primary]"
              />
              <label htmlFor="isPaused" className="text-sm font-medium text-[--color-foreground]">
                Pause Campaign
              </label>
            </div>
          )}

          <div>
            <label htmlFor="targetCategories" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Target Categories (comma-separated)
            </label>
            <Input
              type="text"
              id="targetCategories"
              name="targetCategories"
              value={values.targetCategories}
              onChange={(e) => setValues((v) => ({ ...v, targetCategories: e.target.value }))}
              placeholder="e.g., Technology, Business, Health"
            />
            {state?.fieldErrors?.targetCategories && (
              <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.targetCategories}</p>
            )}
          </div>

          <div>
            <label htmlFor="targetRegions" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Target Regions (comma-separated)
            </label>
            <Input
              type="text"
              id="targetRegions"
              name="targetRegions"
              value={values.targetRegions}
              onChange={(e) => setValues((v) => ({ ...v, targetRegions: e.target.value }))}
              placeholder="e.g., US, UK, CA"
            />
            {state?.fieldErrors?.targetRegions && (
              <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.targetRegions}</p>
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
