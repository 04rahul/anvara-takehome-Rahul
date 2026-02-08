'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createAdSlot, updateAdSlot, deleteAdSlot, getAdSlot, updatePlacementStatus } from '@/lib/api';

export interface AdSlotFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: AdSlotFormValues;
}

export interface AdSlotFormValues {
  id?: string;
  name: string;
  description: string;
  type: string;
  width: string;
  height: string;
  position: string;
  basePrice: string;
}

export async function createAdSlotAction(
  prevState: AdSlotFormState | null,
  formData: FormData
): Promise<AdSlotFormState> {
  try {
    const values: AdSlotFormValues = {
      name: (formData.get('name') as string) ?? '',
      description: (formData.get('description') as string | null) ?? '',
      type: (formData.get('type') as string) ?? 'DISPLAY',
      width: (formData.get('width') as string | null) ?? '',
      height: (formData.get('height') as string | null) ?? '',
      position: (formData.get('position') as string | null) ?? '',
      basePrice: (formData.get('basePrice') as string) ?? '',
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
    const type = values.type;
    // If type is PODCAST, force width/height to null (skip validation)
    const width = type === 'PODCAST' ? null : (values.width || null);
    const height = type === 'PODCAST' ? null : (values.height || null);
    const position = values.position || null;
    const basePrice = values.basePrice;

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
      return { fieldErrors, values };
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
      values: {
        name: (formData.get('name') as string) ?? '',
        description: (formData.get('description') as string | null) ?? '',
        type: (formData.get('type') as string) ?? 'DISPLAY',
        width: (formData.get('width') as string | null) ?? '',
        height: (formData.get('height') as string | null) ?? '',
        position: (formData.get('position') as string | null) ?? '',
        basePrice: (formData.get('basePrice') as string) ?? '',
      },
    };
  }
}

export async function updateAdSlotAction(
  prevState: AdSlotFormState | null,
  formData: FormData
): Promise<AdSlotFormState> {
  try {
    const values: AdSlotFormValues = {
      id: (formData.get('id') as string) ?? '',
      name: (formData.get('name') as string) ?? '',
      description: (formData.get('description') as string | null) ?? '',
      type: (formData.get('type') as string) ?? 'DISPLAY',
      width: (formData.get('width') as string | null) ?? '',
      height: (formData.get('height') as string | null) ?? '',
      position: (formData.get('position') as string | null) ?? '',
      basePrice: (formData.get('basePrice') as string) ?? '',
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
    const description = values.description || null;
    const type = values.type;
    // If type is PODCAST, force width/height to null (skip validation)
    const width = type === 'PODCAST' ? null : (values.width || null);
    const height = type === 'PODCAST' ? null : (values.height || null);
    const position = values.position || null;
    const basePrice = values.basePrice;

    const fieldErrors: Record<string, string> = {};

    if (!id) {
      return { error: 'Ad slot ID is required', values };
    }

    // Backend validation: Check if ad slot is booked before allowing updates
    try {
      const adSlot = await getAdSlot(id);
      if (!adSlot.isAvailable) {
        return { error: 'This ad slot is already booked and cannot be edited.', values };
      }
    } catch (error) {
      console.error('Error fetching ad slot for validation:', error);
      return { error: 'Failed to validate ad slot status', values };
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
      return { fieldErrors, values };
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

    if (type === 'PODCAST') {
      // Explicitly clear width/height for PODCAST
      data.width = null;
      data.height = null;
    } else {
      if (width !== null) {
        data.width = width ? Number(width) : null;
      }

      if (height !== null) {
        data.height = height ? Number(height) : null;
      }
    }

    if (position !== null) {
      data.position = position && position.trim().length > 0 ? position.trim() : null;
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
      values: {
        id: (formData.get('id') as string) ?? '',
        name: (formData.get('name') as string) ?? '',
        description: (formData.get('description') as string | null) ?? '',
        type: (formData.get('type') as string) ?? 'DISPLAY',
        width: (formData.get('width') as string | null) ?? '',
        height: (formData.get('height') as string | null) ?? '',
        position: (formData.get('position') as string | null) ?? '',
        basePrice: (formData.get('basePrice') as string) ?? '',
      },
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

    // Backend validation: Check if ad slot is booked before allowing deletion
    try {
      const adSlot = await getAdSlot(id);
      if (!adSlot.isAvailable) {
        return { error: 'This ad slot is already booked and cannot be deleted.' };
      }
    } catch (error) {
      console.error('Error fetching ad slot for validation:', error);
      return { error: 'Failed to validate ad slot status' };
    }

    // Call backend API
    await deleteAdSlot(id, cookieHeader);

    // Don't use revalidatePath here - it causes immediate component unmount
    // Use router.refresh() in client component for timing control to show toast
    // revalidatePath('/dashboard/publisher');

    return { success: true };
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete ad slot',
    };
  }
}

export async function approvePlacementAction(formData: FormData): Promise<void> {
  const placementId = (formData.get('placementId') as string) ?? '';
  if (!placementId) return;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('better-auth.session_token');
  const cookieHeader = sessionCookie ? `better-auth.session_token=${sessionCookie.value}` : undefined;
  if (!cookieHeader) return;

  await updatePlacementStatus(placementId, 'APPROVED', cookieHeader);
  revalidatePath('/dashboard/publisher');
}

export async function rejectPlacementAction(formData: FormData): Promise<void> {
  const placementId = (formData.get('placementId') as string) ?? '';
  if (!placementId) return;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('better-auth.session_token');
  const cookieHeader = sessionCookie ? `better-auth.session_token=${sessionCookie.value}` : undefined;
  if (!cookieHeader) return;

  await updatePlacementStatus(placementId, 'REJECTED', cookieHeader);
  revalidatePath('/dashboard/publisher');
}
