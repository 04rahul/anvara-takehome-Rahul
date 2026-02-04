'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createCampaign, updateCampaign, deleteCampaign } from '@/lib/api';

export interface CampaignFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createCampaignAction(
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

    // Extract and validate form data
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const budget = formData.get('budget') as string;
    const cpmRate = formData.get('cpmRate') as string | null;
    const cpcRate = formData.get('cpcRate') as string | null;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const targetCategories = formData.get('targetCategories') as string | null;
    const targetRegions = formData.get('targetRegions') as string | null;

    const fieldErrors: Record<string, string> = {};

    if (!name || name.trim().length === 0) {
      fieldErrors.name = 'Name is required';
    }

    if (!budget || isNaN(Number(budget)) || Number(budget) < 1) {
      fieldErrors.budget = 'Budget must be a valid number >= 1';
    }

    if (!startDate) {
      fieldErrors.startDate = 'Start date is required';
    } else {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        fieldErrors.startDate = 'Start date must be a valid date';
      } else if (start < new Date()) {
        fieldErrors.startDate = 'Start date must be in the future';
      }
    }

    if (!endDate) {
      fieldErrors.endDate = 'End date is required';
    } else {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        fieldErrors.endDate = 'End date must be a valid date';
      } else if (end < new Date()) {
        fieldErrors.endDate = 'End date must be in the future';
      }
    }

    // Validate date relationship
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
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
      return { fieldErrors };
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
    };
  }
}

export async function updateCampaignAction(
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

    // Extract form data
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const budget = formData.get('budget') as string;
    const cpmRate = formData.get('cpmRate') as string | null;
    const cpcRate = formData.get('cpcRate') as string | null;
    const startDate = formData.get('startDate') as string | null;
    const endDate = formData.get('endDate') as string | null;
    const status = formData.get('status') as string | null;
    const targetCategories = formData.get('targetCategories') as string | null;
    const targetRegions = formData.get('targetRegions') as string | null;

    const fieldErrors: Record<string, string> = {};

    if (!id) {
      return { error: 'Campaign ID is required' };
    }

    if (!name || name.trim().length === 0) {
      fieldErrors.name = 'Name is required';
    }

    if (!budget || isNaN(Number(budget)) || Number(budget) < 1) {
      fieldErrors.budget = 'Budget must be a valid number >= 1';
    }

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        fieldErrors.startDate = 'Start date must be a valid date';
      } else if (start < new Date()) {
        fieldErrors.startDate = 'Start date must be in the future';
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        fieldErrors.endDate = 'End date must be a valid date';
      } else if (end < new Date()) {
        fieldErrors.endDate = 'End date must be in the future';
      }
    }

    // Validate date relationship
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
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
      return { fieldErrors };
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

    if (status) {
      data.status = status;
    }

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

    // Revalidate the dashboard page
    revalidatePath('/dashboard/sponsor');

    return { success: true };
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete campaign',
    };
  }
}
