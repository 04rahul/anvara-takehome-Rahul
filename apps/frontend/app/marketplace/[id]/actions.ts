'use server';

import { cookies } from 'next/headers';
import { api } from '@/lib/api';

export interface RequestPlacementFormValues {
  adSlotId: string;
  campaignId: string;
  creativeId: string;
  basePrice: string;
  pricingModelValue: string;
  pricingModel: string;
  startDate: string;
  endDate: string;
  message?: string;
}

export interface RequestPlacementFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: RequestPlacementFormValues;
}

export async function requestPlacementAction(
  _prevState: RequestPlacementFormState | null,
  formData: FormData
): Promise<RequestPlacementFormState> {
  const values: RequestPlacementFormValues = {
    adSlotId: (formData.get('adSlotId') as string) ?? '',
    campaignId: (formData.get('campaignId') as string) ?? '',
    creativeId: (formData.get('creativeId') as string) ?? '',
    basePrice: (formData.get('basePrice') as string) ?? '',
    pricingModelValue: (formData.get('pricingModelValue') as string) ?? '0',
    pricingModel: (formData.get('pricingModel') as string | null) ?? 'CPM',
    startDate: (formData.get('startDate') as string) ?? '',
    endDate: (formData.get('endDate') as string) ?? '',
    message: (formData.get('message') as string | null) ?? undefined,
  };

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('better-auth.session_token');
    const cookieHeader = sessionCookie ? `better-auth.session_token=${sessionCookie.value}` : undefined;

    if (!cookieHeader) {
      return { error: 'Not authenticated', values };
    }

    const fieldErrors: Record<string, string> = {};

    if (!values.adSlotId) fieldErrors.adSlotId = 'adSlotId is required';
    if (!values.campaignId) fieldErrors.campaignId = 'Campaign is required';
    if (!values.creativeId) fieldErrors.creativeId = 'Creative is required';

    if (!values.basePrice || !Number.isFinite(Number(values.basePrice)) || Number(values.basePrice) < 0) {
      fieldErrors.basePrice = 'Base price must be a number >= 0';
    }

    if (!Number.isFinite(Number(values.pricingModelValue)) || Number(values.pricingModelValue) < 0) {
      fieldErrors.pricingModelValue = 'Pricing model value must be a number >= 0';
    }

    const start = values.startDate ? new Date(values.startDate) : null;
    const end = values.endDate ? new Date(values.endDate) : null;
    if (!start || isNaN(start.getTime())) fieldErrors.startDate = 'Start date is required';
    if (!end || isNaN(end.getTime())) fieldErrors.endDate = 'End date is required';
    if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
      fieldErrors.endDate = 'End date must be after start date';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, values };
    }

    // Calculate total agreed price (base price + pricing model value)
    const agreedPrice = Number(values.basePrice) + Number(values.pricingModelValue);

    await api<{ success: boolean; message?: string }>(`/api/ad-slots/${values.adSlotId}/book`, {
      method: 'POST',
      body: JSON.stringify({
        campaignId: values.campaignId,
        creativeId: values.creativeId,
        agreedPrice: agreedPrice,
        pricingModel: values.pricingModel || 'CPM',
        startDate: values.startDate,
        endDate: values.endDate,
        message: values.message || undefined,
      }),
      cookieHeader,
    });

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to request placement',
      values,
    };
  }
}

