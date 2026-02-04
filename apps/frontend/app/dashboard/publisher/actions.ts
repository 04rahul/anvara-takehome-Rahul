'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createAdSlot, updateAdSlot, deleteAdSlot } from '@/lib/api';

export interface AdSlotFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createAdSlotAction(
  prevState: AdSlotFormState | null,
  formData: FormData
): Promise<AdSlotFormState> {
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
    const type = formData.get('type') as string;
    const width = formData.get('width') as string | null;
    const height = formData.get('height') as string | null;
    const position = formData.get('position') as string | null;
    const basePrice = formData.get('basePrice') as string;

    const fieldErrors: Record<string, string> = {};

    if (!name || name.trim().length === 0) {
      fieldErrors.name = 'Name is required';
    }

    if (!type) {
      fieldErrors.type = 'Type is required';
    }

    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) < 0) {
      fieldErrors.basePrice = 'Base price must be a valid number >= 0';
    }

    if (width && (isNaN(Number(width)) || Number(width) < 1)) {
      fieldErrors.width = 'Width must be a valid number >= 1';
    }

    if (height && (isNaN(Number(height)) || Number(height) < 1)) {
      fieldErrors.height = 'Height must be a valid number >= 1';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors };
    }

    // Prepare data for API
    const data: any = {
      name: name.trim(),
      type,
      basePrice: Number(basePrice),
    };

    if (description && description.trim().length > 0) {
      data.description = description.trim();
    }

    if (width) {
      data.width = Number(width);
    }

    if (height) {
      data.height = Number(height);
    }

    if (position && position.trim().length > 0) {
      data.position = position.trim();
    }

    // Call backend API
    await createAdSlot(data, cookieHeader);

    // Revalidate the dashboard page
    revalidatePath('/dashboard/publisher');

    return { success: true };
  } catch (error) {
    console.error('Error creating ad slot:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create ad slot',
    };
  }
}

export async function updateAdSlotAction(
  prevState: AdSlotFormState | null,
  formData: FormData
): Promise<AdSlotFormState> {
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
    const type = formData.get('type') as string;
    const width = formData.get('width') as string | null;
    const height = formData.get('height') as string | null;
    const position = formData.get('position') as string | null;
    const basePrice = formData.get('basePrice') as string;
    const isAvailable = formData.get('isAvailable') as string | null;

    const fieldErrors: Record<string, string> = {};

    if (!id) {
      return { error: 'Ad slot ID is required' };
    }

    if (!name || name.trim().length === 0) {
      fieldErrors.name = 'Name is required';
    }

    if (!type) {
      fieldErrors.type = 'Type is required';
    }

    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) < 0) {
      fieldErrors.basePrice = 'Base price must be a valid number >= 0';
    }

    if (width && (isNaN(Number(width)) || Number(width) < 1)) {
      fieldErrors.width = 'Width must be a valid number >= 1';
    }

    if (height && (isNaN(Number(height)) || Number(height) < 1)) {
      fieldErrors.height = 'Height must be a valid number >= 1';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors };
    }

    // Prepare data for API
    const data: any = {
      name: name.trim(),
      type,
      basePrice: Number(basePrice),
    };

    if (description !== null) {
      data.description = description && description.trim().length > 0 ? description.trim() : null;
    }

    if (width !== null) {
      data.width = width ? Number(width) : null;
    }

    if (height !== null) {
      data.height = height ? Number(height) : null;
    }

    if (position !== null) {
      data.position = position && position.trim().length > 0 ? position.trim() : null;
    }

    if (isAvailable !== null) {
      data.isAvailable = isAvailable === 'true';
    }

    // Call backend API
    await updateAdSlot(id, data, cookieHeader);

    // Revalidate the dashboard page
    revalidatePath('/dashboard/publisher');

    return { success: true };
  } catch (error) {
    console.error('Error updating ad slot:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to update ad slot',
    };
  }
}

export async function deleteAdSlotAction(
  prevState: AdSlotFormState | null,
  formData: FormData
): Promise<AdSlotFormState> {
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

    // Extract ad slot ID
    const id = formData.get('id') as string;

    if (!id) {
      return { error: 'Ad slot ID is required' };
    }

    // Call backend API
    await deleteAdSlot(id, cookieHeader);

    // Revalidate the dashboard page
    revalidatePath('/dashboard/publisher');

    return { success: true };
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete ad slot',
    };
  }
}
