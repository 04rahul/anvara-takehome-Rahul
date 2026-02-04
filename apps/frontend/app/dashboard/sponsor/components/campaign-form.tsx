'use client';

import { useActionState } from 'react';
import { useEffect } from 'react';
import { useFormStatus } from 'react-dom';
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
    <button
      type="submit"
      disabled={pending}
      className="min-h-[44px] rounded-lg bg-[--color-primary] px-6 py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[--color-primary-hover] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] disabled:opacity-50"
    >
      {pending ? 'Saving...' : isEdit ? 'Update Campaign' : 'Create Campaign'}
    </button>
  );
}

// Helper to format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export function CampaignForm({ campaign, onSuccess, onCancel }: CampaignFormProps) {
  const isEdit = !!campaign;
  const action = isEdit ? updateCampaignAction : createCampaignAction;
  const [state, formAction] = useActionState<CampaignFormState | null, FormData>(action, null);
  const isStartDateLocked =
    isEdit && campaign?.startDate ? new Date(campaign.startDate) <= new Date() : false;

  // Close form on successful submission
  useEffect(() => {
    if (state?.success) {
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [state?.success, onSuccess]);

  return (
    <div className="relative rounded-lg border border-[--color-border] bg-[--color-background] p-6 text-[--color-foreground] shadow-sm">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close modal"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[--color-border] text-[--color-foreground] transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>
      )}
      <h2 className="mb-4 text-2xl font-semibold leading-tight">
        {isEdit ? 'Edit Campaign' : 'Create New Campaign'}
      </h2>

      {state?.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {state.error}
        </div>
      )}

      <form action={formAction} className="flex max-h-[70vh] flex-col">
        {isEdit && <input type="hidden" name="id" value={campaign.id} />}

        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={campaign?.name || ''}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
            />
            {state?.fieldErrors?.name && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>
            )}
          </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-[--color-foreground]">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={campaign?.description || ''}
            className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
          />
          {state?.fieldErrors?.description && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="budget" className="mb-2 block text-sm font-medium text-[--color-foreground]">
            Budget ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            required
            min="1"
            step="0.01"
            defaultValue={campaign?.budget?.toString() || ''}
            className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
          />
          {state?.fieldErrors?.budget && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.budget}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cpmRate" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              CPM Rate ($)
            </label>
            <input
              type="number"
              id="cpmRate"
              name="cpmRate"
              min="0"
              step="0.01"
              defaultValue={campaign?.cpmRate?.toString() || ''}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
            />
            {state?.fieldErrors?.cpmRate && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.cpmRate}</p>
            )}
          </div>

          <div>
            <label htmlFor="cpcRate" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              CPC Rate ($)
            </label>
            <input
              type="number"
              id="cpcRate"
              name="cpcRate"
              min="0"
              step="0.01"
              defaultValue={campaign?.cpcRate?.toString() || ''}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
            />
            {state?.fieldErrors?.cpcRate && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.cpcRate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              required={!isEdit}
              disabled={isStartDateLocked}
              defaultValue={formatDateForInput(campaign?.startDate)}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
            />
            {state?.fieldErrors?.startDate && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              required={!isEdit}
              defaultValue={formatDateForInput(campaign?.endDate)}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
            />
            {state?.fieldErrors?.endDate && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.endDate}</p>
            )}
          </div>
        </div>

        {isEdit && (
          <div>
            <label htmlFor="status" className="mb-2 block text-sm font-medium text-[--color-foreground]">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={campaign?.status || 'DRAFT'}
              className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
            {state?.fieldErrors?.status && (
              <p className="mt-1 text-sm text-red-600">{state.fieldErrors.status}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="targetCategories" className="mb-2 block text-sm font-medium text-[--color-foreground]">
            Target Categories (comma-separated)
          </label>
          <input
            type="text"
            id="targetCategories"
            name="targetCategories"
            defaultValue={
              campaign?.targetCategories
                ? Array.isArray(campaign.targetCategories)
                  ? campaign.targetCategories.join(', ')
                  : campaign.targetCategories
                : ''
            }
            placeholder="e.g., Technology, Business, Health"
            className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
          />
          {state?.fieldErrors?.targetCategories && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.targetCategories}</p>
          )}
        </div>

        <div>
          <label htmlFor="targetRegions" className="mb-2 block text-sm font-medium text-[--color-foreground]">
            Target Regions (comma-separated)
          </label>
          <input
            type="text"
            id="targetRegions"
            name="targetRegions"
            defaultValue={
              campaign?.targetRegions
                ? Array.isArray(campaign.targetRegions)
                  ? campaign.targetRegions.join(', ')
                  : campaign.targetRegions
                : ''
            }
            placeholder="e.g., US, UK, CA"
            className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-[--color-foreground] placeholder:text-[--color-muted] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent"
          />
          {state?.fieldErrors?.targetRegions && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.targetRegions}</p>
          )}
        </div>

        </div>

        <div className="flex gap-3 pt-4">
          <SubmitButton isEdit={isEdit} />
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] rounded-lg border border-[--color-border] bg-[--color-background] px-6 py-2.5 font-medium text-[--color-foreground] transition-colors duration-200 hover:bg-[--color-border] hover:text-[--color-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
