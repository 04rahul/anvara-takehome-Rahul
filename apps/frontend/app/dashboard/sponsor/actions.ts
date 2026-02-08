'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createCampaign, updateCampaign, deleteCampaign } from '@/lib/api';

export interface CampaignFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: CampaignFormValues;
}

export interface CampaignFormValues {
  id?: string;
  spent?: string;
  name: string;
  description: string;
  budget: string;
  cpmRate: string;
  cpcRate: string;
  startDate: string;
  endDate: string;
  status?: string; // Kept for server->client hydration even if not in form input
  targetCategories: string;
  targetRegions: string;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function createCampaignAction(
  prevState: CampaignFormState | null,
  formData: FormData
): Promise<CampaignFormState> {
  try {
    // Extract values early so we can return them on any failure (prevents input reset on errors)
    const values: CampaignFormValues = {
      name: (formData.get('name') as string) ?? '',
      description: (formData.get('description') as string | null) ?? '',
      budget: (formData.get('budget') as string) ?? '',
      cpmRate: (formData.get('cpmRate') as string | null) ?? '',
      cpcRate: (formData.get('cpcRate') as string | null) ?? '',
      startDate: (formData.get('startDate') as string) ?? '',
      endDate: (formData.get('endDate') as string) ?? '',
      targetCategories: (formData.get('targetCategories') as string | null) ?? '',
      targetRegions: (formData.get('targetRegions') as string | null) ?? '',
    };

    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('better-auth.session_token');
    const cookieHeader = sessionCookie
      ? `better-auth.session_token=${sessionCookie.value}`
      : undefined;

    if (!cookieHeader) {
      return { error: 'Not authenticated', values };
    }

    // Extract and validate form data
    const name = values.name;
    const description = values.description || null;
    const budget = values.budget;
    const cpmRate = values.cpmRate || null;
    const cpcRate = values.cpcRate || null;
    const startDate = values.startDate;
    const endDate = values.endDate;
    const targetCategories = values.targetCategories || null;
    const targetRegions = values.targetRegions || null;

    const fieldErrors: Record<string, string> = {};
    const today = startOfToday();

    if (!name || name.trim().length === 0) {
      fieldErrors.name = 'Name is required';
    }

    if (!budget || isNaN(Number(budget)) || Number(budget) < 1) {
      fieldErrors.budget = 'Budget must be a valid number >= 1';
    }

    if (!startDate) {
      fieldErrors.startDate = 'Start date is required';
    } else {
      // Parse as local time to match startOfToday
      const start = new Date(`${startDate}T00:00:00`);
      if (isNaN(start.getTime())) {
        fieldErrors.startDate = 'Start date must be a valid date';
      } else if (start < today) {
        fieldErrors.startDate = 'Start date must be today or in the future';
      }
    }

    if (!endDate) {
      fieldErrors.endDate = 'End date is required';
    } else {
      // Parse as local time to match startOfToday
      const end = new Date(`${endDate}T00:00:00`);
      if (isNaN(end.getTime())) {
        fieldErrors.endDate = 'End date must be a valid date';
      } else if (end < today) {
        fieldErrors.endDate = 'End date must be today or in the future';
      }
    }

    // Validate date relationship
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
        fieldErrors.endDate = 'End date must be after start date';
      }
    }

    if (cpmRate && (isNaN(Number(cpmRate)) || Number(cpmRate) < 0)) {
      fieldErrors.cpmRate = 'CPM rate must be a valid number >= 0';
    }

    if (cpcRate && (isNaN(Number(cpcRate)) || Number(cpcRate) < 0)) {
      fieldErrors.cpcRate = 'CPC rate must be a valid number >= 0';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, values };
    }

    // Prepare data for API
    const data: any = {
      name: name.trim(),
      budget: Number(budget),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      targetCategories: [],
      targetRegions: [],
    };

    if (description && description.trim().length > 0) {
      data.description = description.trim();
    }

    if (cpmRate) {
      data.cpmRate = Number(cpmRate);
    }

    if (cpcRate) {
      data.cpcRate = Number(cpcRate);
    }

    if (targetCategories) {
      try {
        data.targetCategories = JSON.parse(targetCategories);
      } catch {
        // If not JSON, treat as comma-separated string
        data.targetCategories = targetCategories
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
      }
    }

    if (targetRegions) {
      try {
        data.targetRegions = JSON.parse(targetRegions);
      } catch {
        // If not JSON, treat as comma-separated string
        data.targetRegions = targetRegions
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r.length > 0);
      }
    }

    // Call backend API
    await createCampaign(data, cookieHeader);

    // Revalidate the dashboard page
    revalidatePath('/dashboard/sponsor');

    return { success: true };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create campaign',
      values: {
        name: (formData.get('name') as string) ?? '',
        description: (formData.get('description') as string | null) ?? '',
        budget: (formData.get('budget') as string) ?? '',
        cpmRate: (formData.get('cpmRate') as string | null) ?? '',
        cpcRate: (formData.get('cpcRate') as string | null) ?? '',
        startDate: (formData.get('startDate') as string) ?? '',
        endDate: (formData.get('endDate') as string) ?? '',
        targetCategories: (formData.get('targetCategories') as string | null) ?? '',
        targetRegions: (formData.get('targetRegions') as string | null) ?? '',
      },
    };
  }
}

export async function updateCampaignAction(
  prevState: CampaignFormState | null,
  formData: FormData
): Promise<CampaignFormState> {
  try {
    const values: CampaignFormValues = {
      id: (formData.get('id') as string) ?? '',
      spent: (formData.get('spent') as string | null) ?? '',
      name: (formData.get('name') as string) ?? '',
      description: (formData.get('description') as string | null) ?? '',
      budget: (formData.get('budget') as string) ?? '',
      cpmRate: (formData.get('cpmRate') as string | null) ?? '',
      cpcRate: (formData.get('cpcRate') as string | null) ?? '',
      startDate: (formData.get('startDate') as string | null) ?? '',
      endDate: (formData.get('endDate') as string | null) ?? '',
      status: (formData.get('status') as string | null) ?? undefined,
      targetCategories: (formData.get('targetCategories') as string | null) ?? '',
      targetRegions: (formData.get('targetRegions') as string | null) ?? '',
    };

    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('better-auth.session_token');
    const cookieHeader = sessionCookie
      ? `better-auth.session_token=${sessionCookie.value}`
      : undefined;

    if (!cookieHeader) {
      return { error: 'Not authenticated', values };
    }

    // Extract form data
    const id = values.id ?? '';
    const name = values.name;
    const description = values.description === '' ? null : values.description;
    const budget = values.budget;
    const spent = values.spent === '' ? null : values.spent;
    const cpmRate = values.cpmRate === '' ? null : values.cpmRate;
    const cpcRate = values.cpcRate === '' ? null : values.cpcRate;
    const startDate = values.startDate === '' ? null : values.startDate;
    const endDate = values.endDate === '' ? null : values.endDate;
    // const status = values.status ?? null; // Removed handling of raw status
    const isPaused = formData.get('isPaused') === 'true'; // Checkbox value
    const targetCategories = values.targetCategories === '' ? null : values.targetCategories;
    const targetRegions = values.targetRegions === '' ? null : values.targetRegions;

    const fieldErrors: Record<string, string> = {};
    const today = startOfToday();

    if (!id) {
      return { error: 'Campaign ID is required', values };
    }

    if (!name || name.trim().length === 0) {
      fieldErrors.name = 'Name is required';
    }

    if (!budget || isNaN(Number(budget)) || Number(budget) < 1) {
      fieldErrors.budget = 'Budget must be a valid number >= 1';
    }

    // Edit-only validation: budget must not be lower than already spent
    if (!fieldErrors.budget && spent !== null && spent !== '' && !isNaN(Number(spent))) {
      const spentAmount = Number(spent);
      if (Number(budget) < spentAmount) {
        fieldErrors.budget = `Budget cannot be less than already spent ($${spentAmount.toLocaleString()})`;
      }
    }

    if (startDate) {
      // Parse as local time to match startOfToday
      const start = new Date(`${startDate}T00:00:00`);
      if (isNaN(start.getTime())) {
        fieldErrors.startDate = 'Start date must be a valid date';
      } else if (start < today) {
        fieldErrors.startDate = 'Start date must be today or in the future';
      }
    }

    if (endDate) {
      // Parse as local time to match startOfToday
      const end = new Date(`${endDate}T00:00:00`);
      if (isNaN(end.getTime())) {
        fieldErrors.endDate = 'End date must be a valid date';
      } else if (end < today) {
        fieldErrors.endDate = 'End date must be today or in the future';
      }
    }

    // Validate date relationship
    if (startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
        fieldErrors.endDate = 'End date must be after start date';
      }
    }

    if (cpmRate && (isNaN(Number(cpmRate)) || Number(cpmRate) < 0)) {
      fieldErrors.cpmRate = 'CPM rate must be a valid number >= 0';
    }

    if (cpcRate && (isNaN(Number(cpcRate)) || Number(cpcRate) < 0)) {
      fieldErrors.cpcRate = 'CPC rate must be a valid number >= 0';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, values };
    }

    // Prepare data for API
    const data: any = {
      name: name.trim(),
      budget: Number(budget),
    };

    if (description !== null) {
      data.description = description && description.trim().length > 0 ? description.trim() : null;
    }

    if (cpmRate !== null) {
      data.cpmRate = cpmRate ? Number(cpmRate) : null;
    }

    if (cpcRate !== null) {
      data.cpcRate = cpcRate ? Number(cpcRate) : null;
    }

    if (startDate) {
      data.startDate = new Date(startDate).toISOString();
    }

    if (endDate) {
      data.endDate = new Date(endDate).toISOString();
    }

    // Handle Pause/Resume logic
    // If Checked (isPaused=true) -> Send 'PAUSED'
    // If Unchecked -> Send 'ACTIVE' (Backend will recalculate DRAFT/ACTIVE/COMPLETED based on dates)
    data.status = isPaused ? 'PAUSED' : 'ACTIVE';

    if (targetCategories !== null) {
      if (targetCategories) {
        try {
          data.targetCategories = JSON.parse(targetCategories);
        } catch {
          data.targetCategories = targetCategories
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c.length > 0);
        }
      } else {
        data.targetCategories = [];
      }
    }

    if (targetRegions !== null) {
      if (targetRegions) {
        try {
          data.targetRegions = JSON.parse(targetRegions);
        } catch {
          data.targetRegions = targetRegions
            .split(',')
            .map((r) => r.trim())
            .filter((r) => r.length > 0);
        }
      } else {
        data.targetRegions = [];
      }
    }

    // Call backend API
    await updateCampaign(id, data, cookieHeader);

    // Revalidate the dashboard page
    revalidatePath('/dashboard/sponsor');

    return { success: true };
  } catch (error) {
    console.error('Error updating campaign:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to update campaign',
      values: {
        id: (formData.get('id') as string) ?? '',
        spent: (formData.get('spent') as string | null) ?? '',
        name: (formData.get('name') as string) ?? '',
        description: (formData.get('description') as string | null) ?? '',
        budget: (formData.get('budget') as string) ?? '',
        cpmRate: (formData.get('cpmRate') as string | null) ?? '',
        cpcRate: (formData.get('cpcRate') as string | null) ?? '',
        startDate: (formData.get('startDate') as string | null) ?? '',
        endDate: (formData.get('endDate') as string | null) ?? '',
        status: (formData.get('status') as string | null) ?? undefined,
        targetCategories: (formData.get('targetCategories') as string | null) ?? '',
        targetRegions: (formData.get('targetRegions') as string | null) ?? '',
      },
    };
  }
}

export async function deleteCampaignAction(
  prevState: CampaignFormState | null,
  formData: FormData
): Promise<CampaignFormState> {
  try {
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('better-auth.session_token');
    const cookieHeader = sessionCookie
      ? `better-auth.session_token=${sessionCookie.value}`
      : undefined;

    if (!cookieHeader) {
      return { error: 'Not authenticated' };
    }

    // Extract campaign ID
    const id = formData.get('id') as string;

    if (!id) {
      return { error: 'Campaign ID is required' };
    }

    // Call backend API
    await deleteCampaign(id, cookieHeader);

    // Revalidate the dashboard page - moved to client side to show toast
    // revalidatePath('/dashboard/sponsor');

    return { success: true };
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete campaign',
    };
  }
}
