// Simple API client
// FIXME: This client has no error response parsing - when API returns { error: "..." },
// we should extract and throw that message instead of generic "API request failed"

// TODO: Add authentication token to requests
// Hint: Include credentials: 'include' for cookie-based auth, or
// add Authorization header for token-based auth

import type { Campaign, AdSlot, Placement } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

interface Stats {
  [key: string]: unknown;
}

/**
 * API client that works in both client-side and server-side contexts.
 * For server-side usage, pass cookies via the cookieHeader parameter.
 */
export async function api<T>(
  endpoint: string,
  options?: RequestInit & { cookieHeader?: string }
): Promise<T> {
  const { cookieHeader, ...fetchOptions } = options || {};

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(cookieHeader && { Cookie: cookieHeader }),
    ...fetchOptions?.headers,
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers,
      credentials: 'include', // For client-side requests
      ...fetchOptions,
    });
    
    if (!res.ok) {
      let errorMessage = 'API request failed';
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  } catch (error) {
    // Improve error message for fetch failures
    if (error instanceof TypeError && error.message === 'fetch failed') {
      throw new Error(`Failed to connect to API server at ${API_URL}. Please ensure the backend server is running.`);
    }
    throw error;
  }
}

// Campaigns
export const getCampaigns = (sponsorId?: string, cookieHeader?: string): Promise<Campaign[]> =>
  api<Campaign[]>(sponsorId ? `/api/campaigns?sponsorId=${sponsorId}` : '/api/campaigns', { cookieHeader });
export const getCampaign = (id: string, cookieHeader?: string): Promise<Campaign> => 
  api<Campaign>(`/api/campaigns/${id}`, { cookieHeader });
export const createCampaign = (data: unknown, cookieHeader?: string): Promise<Campaign> =>
  api<Campaign>('/api/campaigns', { method: 'POST', body: JSON.stringify(data), cookieHeader });
export const updateCampaign = (id: string, data: unknown, cookieHeader?: string): Promise<Campaign> =>
  api<Campaign>(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data), cookieHeader });
export const deleteCampaign = async (id: string, cookieHeader?: string): Promise<void> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(cookieHeader && { Cookie: cookieHeader }),
  };
  const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
    headers,
    credentials: 'include',
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'API request failed' }));
    throw new Error(error.error || 'API request failed');
  }
  // DELETE returns 204 No Content, so no body to parse
};

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Ad Slots
export const getAdSlots = (params?: {
  publisherId?: string;
  type?: string;
  available?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}, cookieHeader?: string): Promise<PaginatedResponse<AdSlot>> => {
  const queryParams = new URLSearchParams();
  if (params?.publisherId) queryParams.set('publisherId', params.publisherId);
  if (params?.type) queryParams.set('type', params.type);
  if (params?.available) queryParams.set('available', params.available);
  if (params?.minPrice) queryParams.set('minPrice', params.minPrice);
  if (params?.maxPrice) queryParams.set('maxPrice', params.maxPrice);
  if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.category) queryParams.set('category', params.category);
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  
  const query = queryParams.toString();
  return api<PaginatedResponse<AdSlot>>(
    `/api/ad-slots${query ? `?${query}` : ''}`, 
    { cookieHeader }
  );
};
export const getAdSlot = (id: string): Promise<AdSlot> => api<AdSlot>(`/api/ad-slots/${id}`);
export const createAdSlot = (data: unknown, cookieHeader?: string): Promise<AdSlot> =>
  api<AdSlot>('/api/ad-slots', { method: 'POST', body: JSON.stringify(data), cookieHeader });
export const updateAdSlot = (id: string, data: unknown, cookieHeader?: string): Promise<AdSlot> =>
  api<AdSlot>(`/api/ad-slots/${id}`, { method: 'PUT', body: JSON.stringify(data), cookieHeader });
export const deleteAdSlot = async (id: string, cookieHeader?: string): Promise<void> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(cookieHeader && { Cookie: cookieHeader }),
  };
  const res = await fetch(`${API_URL}/api/ad-slots/${id}`, {
    headers,
    credentials: 'include',
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'API request failed' }));
    throw new Error(error.error || 'API request failed');
  }
  // DELETE returns 204 No Content, so no body to parse
};

// Placements
export const getPlacements = (
  params?: { status?: string; campaignId?: string },
  cookieHeader?: string
): Promise<Placement[]> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);
  if (params?.campaignId) queryParams.set('campaignId', params.campaignId);
  const query = queryParams.toString();
  return api<Placement[]>(`/api/placements${query ? `?${query}` : ''}`, { cookieHeader });
};
export const createPlacement = (data: unknown): Promise<Placement> =>
  api<Placement>('/api/placements', { method: 'POST', body: JSON.stringify(data) });

export const updatePlacementStatus = (
  id: string,
  status: 'APPROVED' | 'REJECTED',
  cookieHeader?: string
): Promise<Placement> =>
  api<Placement>(`/api/placements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    cookieHeader,
  });

// Dashboard
export const getStats = (): Promise<Stats> => api<Stats>('/api/dashboard/stats');
