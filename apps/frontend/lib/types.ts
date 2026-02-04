// Core types matching the Prisma schema

export type UserRole = 'sponsor' | 'publisher';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  budget: number;
  spent: number;
  cpmRate?: number;
  cpcRate?: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  targetCategories?: string[];
  targetRegions?: string[];
  sponsorId: string;
  sponsor?: { id: string; name: string };
}

export interface AdSlot {
  id: string;
  name: string;
  description?: string;
  type: 'DISPLAY' | 'VIDEO' | 'NEWSLETTER' | 'PODCAST';
  width?: number;
  height?: number;
  position?: string;
  basePrice: number;
  isAvailable: boolean;
  publisherId: string;
  publisher?: { id: string; name: string; website?: string };
}

export interface Placement {
  id: string;
  impressions: number;
  clicks: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  campaignId: string;
  adSlotId: string;
}
