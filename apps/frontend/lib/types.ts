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
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  targetCategories?: string[];
  targetRegions?: string[];
  sponsorId: string;
  sponsor?: { id: string; name: string; logo?: string };
  creatives?: Creative[];
  placements?: Placement[];
  _count?: {
    creatives: number;
    placements: number;
  };
}

export interface Creative {
  id: string;
  name: string;
  type: 'BANNER' | 'VIDEO' | 'NATIVE' | 'SPONSORED_POST' | 'PODCAST_READ';
  assetUrl: string;
  clickUrl: string;
  altText?: string;
  width?: number;
  height?: number;
  isApproved: boolean;
  isActive: boolean;
  campaignId: string;
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
  publisher?: {
    id: string;
    name: string;
    website?: string;
    category?: string;
    monthlyViews?: number;
  };
  _count?: {
    placements: number;
  };
}

export interface Placement {
  id: string;
  impressions: number;
  clicks: number;
  conversions?: number;
  agreedPrice?: number;
  pricingModel?: 'CPM' | 'CPC' | 'CPA' | 'FLAT_RATE';
  startDate?: string;
  endDate?: string;
  message?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  campaignId: string;
  creativeId?: string;
  adSlotId: string;
  publisherId?: string;
  campaign?: { id: string; name: string };
  creative?: { id: string; name: string; type: string };
  adSlot?: {
    id: string;
    name: string;
    type: string;
    description?: string;
    basePrice?: number;
  };
  publisher?: {
    id: string;
    name: string;
    category?: string;
    website?: string;
  };
}
