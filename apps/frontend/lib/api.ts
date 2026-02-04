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

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers,
    credentials: 'include', // For client-side requests
    ...fetchOptions,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'API request failed' }));
    throw new Error(error.error || 'API request failed');
  }
  return res.json();
}

// Campaigns
export const getCampaigns = (sponsorId?: string, cookieHeader?: string): Promise<Campaign[]> =>
  api<Campaign[]>(sponsorId ? `/api/campaigns?sponsorId=${sponsorId}` : '/api/campaigns', { cookieHeader });
export const getCampaign = (id: string): Promise<Campaign> => api<Campaign>(`/api/campaigns/${id}`);
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

// Ad Slots
export const getAdSlots = (publisherId?: string, cookieHeader?: string): Promise<AdSlot[]> =>
  api<AdSlot[]>(publisherId ? `/api/ad-slots?publisherId=${publisherId}` : '/api/ad-slots', { cookieHeader });
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
export const getPlacements = (): Promise<Placement[]> => api<Placement[]>('/api/placements');
export const createPlacement = (data: unknown): Promise<Placement> =>
  api<Placement>('/api/placements', { method: 'POST', body: JSON.stringify(data) });

// Dashboard
export const getStats = (): Promise<Stats> => api<Stats>('/api/dashboard/stats');
