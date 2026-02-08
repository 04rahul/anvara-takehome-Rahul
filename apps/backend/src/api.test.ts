import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import app from './index.js';
import { prisma } from './db.js';
import { requireAuth, roleMiddleware, type AuthRequest } from './auth.js';

// Mock Prisma Client
vi.mock('./db.js', () => ({
  prisma: {
    sponsor: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    publisher: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    campaign: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    creative: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    adSlot: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    placement: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

// Mock Auth Middleware
vi.mock('./auth.js', () => {
  const mockRequireAuth = vi.fn((req: AuthRequest, res: any, next: any) => {
    next();
  });
  const mockRoleMiddleware = vi.fn((roles: string[]) => (req: AuthRequest, res: any, next: any) => {
    next();
  });
  return {
    requireAuth: mockRequireAuth,
    roleMiddleware: mockRoleMiddleware,
  };
});

// Test user data
const mockSponsorUser = {
  id: 'user1',
  email: 'sponsor@test.com',
  role: 'SPONSOR' as const,
  sponsorId: 'sponsor1',
};

const mockPublisherUser = {
  id: 'user2',
  email: 'publisher@test.com',
  role: 'PUBLISHER' as const,
  publisherId: 'publisher1',
};

// Helper functions for auth mocking
function setMockSponsorAuth() {
  (requireAuth as any).mockImplementation((req: AuthRequest, res: any, next: any) => {
    req.user = mockSponsorUser;
    next();
  });
  (roleMiddleware as any).mockImplementation(
    (roles: string[]) => (req: AuthRequest, res: any, next: any) => {
      if (req.user && roles.includes(req.user.role || '')) {
        next();
      } else {
        res.status(403).json({ error: 'Insufficient permissions' });
      }
    }
  );
}

function setMockPublisherAuth() {
  (requireAuth as any).mockImplementation((req: AuthRequest, res: any, next: any) => {
    req.user = mockPublisherUser;
    next();
  });
  (roleMiddleware as any).mockImplementation(
    (roles: string[]) => (req: AuthRequest, res: any, next: any) => {
      if (req.user && roles.includes(req.user.role || '')) {
        next();
      } else {
        res.status(403).json({ error: 'Insufficient permissions' });
      }
    }
  );
}

function setMockUnauthenticated() {
  (requireAuth as any).mockImplementation((req: AuthRequest, res: any, next: any) => {
    next();
  });
  (roleMiddleware as any).mockImplementation(() => (req: AuthRequest, res: any, next: any) => {
    next();
  });
}

// Test data factories
function createMockSponsor() {
  return {
    id: 'sponsor1',
    name: 'Test Sponsor',
    email: 'sponsor@test.com',
    website: 'https://test.com',
    logo: null,
    description: 'Test description',
    industry: 'Tech',
    subscriptionTier: 'FREE',
    subscriptionEndsAt: null,
    isVerified: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { campaigns: 0 },
  };
}

function createMockPublisher() {
  return {
    id: 'publisher1',
    name: 'Test Publisher',
    email: 'publisher@test.com',
    website: 'https://publisher.com',
    avatar: null,
    bio: 'Test bio',
    monthlyViews: 10000,
    subscriberCount: 500,
    category: 'Tech',
    isVerified: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { adSlots: 0, placements: 0 },
  };
}

function createMockCampaign() {
  return {
    id: 'campaign1',
    name: 'Test Campaign',
    description: 'Test description',
    budget: 1000,
    spent: 0,
    cpmRate: 5,
    cpcRate: 0.5,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    targetCategories: ['Tech'],
    targetRegions: ['US'],
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
    sponsorId: 'sponsor1',
    sponsor: { id: 'sponsor1', name: 'Test Sponsor', logo: null },
    _count: { creatives: 0, placements: 0 },
  };
}

function createMockAdSlot() {
  return {
    id: 'adslot1',
    name: 'Test Ad Slot',
    description: 'Test description',
    type: 'DISPLAY',
    position: 'header',
    width: 728,
    height: 90,
    basePrice: 100,
    cpmFloor: 50,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    publisherId: 'publisher1',
    publisher: { id: 'publisher1', name: 'Test Publisher', category: 'Tech', monthlyViews: 10000 },
    _count: { placements: 0 },
  };
}

function createMockPlacement() {
  return {
    id: 'placement1',
    impressions: 0,
    clicks: 0,
    conversions: 0,
    agreedPrice: 100,
    pricingModel: 'CPM',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    campaignId: 'campaign1',
    creativeId: 'creative1',
    adSlotId: 'adslot1',
    publisherId: 'publisher1',
    campaign: { id: 'campaign1', name: 'Test Campaign' },
    creative: { id: 'creative1', name: 'Test Creative', type: 'BANNER' },
    adSlot: { id: 'adslot1', name: 'Test Ad Slot', type: 'DISPLAY' },
    publisher: { id: 'publisher1', name: 'Test Publisher' },
  };
}

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockUnauthenticated();
  });

  // ============================================================================
  // Health Endpoint
  // ============================================================================

  describe('GET /api/health', () => {
    it('should return health status with database connected', async () => {
      vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }] as any);

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // ============================================================================
  // Auth Routes
  // ============================================================================

  describe('POST /api/auth/login', () => {
    it('should return 400 with helpful message', async () => {
      const response = await request(app).post('/api/auth/login');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('frontend');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return authenticated user', async () => {
      setMockSponsorAuth();

      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSponsorUser);
    });
  });

  describe('GET /api/auth/role/:userId', () => {
    it('should return user role for sponsor', async () => {
      setMockSponsorAuth();
      // Publisher check should return null for sponsor
      vi.mocked(prisma.publisher.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.sponsor.findUnique).mockResolvedValue({
        id: 'sponsor1',
        name: 'Test Sponsor',
      } as any);

      const response = await request(app).get('/api/auth/role/user1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('role', 'sponsor');
      expect(response.body).toHaveProperty('sponsorId', 'sponsor1');
    });

    it('should return user role for publisher', async () => {
      setMockPublisherAuth();
      // Sponsor check should return null for publisher
      vi.mocked(prisma.sponsor.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.publisher.findUnique).mockResolvedValue({
        id: 'publisher1',
        name: 'Test Publisher',
      } as any);

      const response = await request(app).get('/api/auth/role/user2');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('role', 'publisher');
      expect(response.body).toHaveProperty('publisherId', 'publisher1');
    });
  });

  // ============================================================================
  // Sponsors Routes
  // ============================================================================

  describe('GET /api/sponsors', () => {
    it('should return array of sponsors', async () => {
      const mockSponsors = [createMockSponsor()];
      vi.mocked(prisma.sponsor.findMany).mockResolvedValue(mockSponsors as any);

      const response = await request(app).get('/api/sponsors');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });

  describe('GET /api/sponsors/:id', () => {
    it('should return single sponsor with campaigns', async () => {
      const mockSponsor = {
        ...createMockSponsor(),
        campaigns: [createMockCampaign()],
        payments: [],
      };
      vi.mocked(prisma.sponsor.findUnique).mockResolvedValue(mockSponsor as any);

      const response = await request(app).get('/api/sponsors/sponsor1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'sponsor1');
      expect(response.body).toHaveProperty('campaigns');
    });
  });

  describe('POST /api/sponsors', () => {
    it('should create new sponsor', async () => {
      const newSponsor = createMockSponsor();
      vi.mocked(prisma.sponsor.create).mockResolvedValue(newSponsor as any);

      const response = await request(app)
        .post('/api/sponsors')
        .send({ name: 'New Sponsor', email: 'new@test.com' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Sponsor');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app).post('/api/sponsors').send({ name: 'New Sponsor' }); // Missing email

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // ============================================================================
  // Publishers Routes
  // ============================================================================

  describe('GET /api/publishers', () => {
    it('should return array of publishers', async () => {
      const mockPublishers = [createMockPublisher()];
      vi.mocked(prisma.publisher.findMany).mockResolvedValue(mockPublishers as any);

      const response = await request(app).get('/api/publishers');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });

  describe('GET /api/publishers/:id', () => {
    it('should return single publisher with ad slots', async () => {
      const mockPublisher = {
        ...createMockPublisher(),
        adSlots: [createMockAdSlot()],
        placements: [],
      };
      vi.mocked(prisma.publisher.findUnique).mockResolvedValue(mockPublisher as any);

      const response = await request(app).get('/api/publishers/publisher1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'publisher1');
      expect(response.body).toHaveProperty('adSlots');
    });
  });

  // ============================================================================
  // Campaigns Routes
  // ============================================================================

  describe('GET /api/campaigns', () => {
    it('should return campaigns filtered by sponsorId', async () => {
      setMockSponsorAuth();
      const mockCampaigns = [createMockCampaign()];
      vi.mocked(prisma.campaign.findMany).mockResolvedValue(mockCampaigns as any);

      const response = await request(app).get('/api/campaigns');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/campaigns/:id', () => {
    it('should return campaign with ownership check', async () => {
      setMockSponsorAuth();
      const mockCampaign = {
        ...createMockCampaign(),
        sponsor: createMockSponsor(),
        creatives: [],
        placements: [],
      };
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(mockCampaign as any);

      const response = await request(app).get('/api/campaigns/campaign1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'campaign1');
    });
  });

  describe('POST /api/campaigns', () => {
    it('should create campaign with validation', async () => {
      setMockSponsorAuth();
      const newCampaign = createMockCampaign();
      vi.mocked(prisma.campaign.create).mockResolvedValue(newCampaign as any);

      const response = await request(app).post('/api/campaigns').send({
        name: 'New Campaign',
        budget: 1000,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('PUT /api/campaigns/:id', () => {
    it('should update campaign', async () => {
      setMockSponsorAuth();
      const existingCampaign = {
        ...createMockCampaign(),
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-12-31'),
      };
      vi.mocked(prisma.campaign.findFirst).mockResolvedValue(existingCampaign as any);
      const updatedCampaign = { ...createMockCampaign(), name: 'Updated Campaign' };
      vi.mocked(prisma.campaign.update).mockResolvedValue(updatedCampaign as any);

      const response = await request(app)
        .put('/api/campaigns/campaign1')
        .send({ name: 'Updated Campaign' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'campaign1');
    });
  });

  describe('DELETE /api/campaigns/:id', () => {
    it('should delete campaign', async () => {
      setMockSponsorAuth();
      const existingCampaign = createMockCampaign();
      vi.mocked(prisma.campaign.findFirst).mockResolvedValue(existingCampaign as any);
      vi.mocked(prisma.campaign.delete).mockResolvedValue(existingCampaign as any);

      const response = await request(app).delete('/api/campaigns/campaign1');

      expect(response.status).toBe(204);
    });
  });

  // ============================================================================
  // Ad Slots Routes
  // ============================================================================

  describe('GET /api/ad-slots', () => {
    it('should return array of ad slots', async () => {
      const mockAdSlots = [createMockAdSlot()];
      vi.mocked(prisma.adSlot.count).mockResolvedValue(mockAdSlots.length);
      vi.mocked(prisma.adSlot.findMany).mockResolvedValue(mockAdSlots as any);

      const response = await request(app).get('/api/ad-slots');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by query parameters', async () => {
      const mockAdSlots = [createMockAdSlot()];
      vi.mocked(prisma.adSlot.count).mockResolvedValue(mockAdSlots.length);
      vi.mocked(prisma.adSlot.findMany).mockResolvedValue(mockAdSlots as any);

      const response = await request(app).get('/api/ad-slots?type=DISPLAY&available=true');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/ad-slots/:id', () => {
    it('should return single ad slot', async () => {
      const mockAdSlot = {
        ...createMockAdSlot(),
        publisher: createMockPublisher(),
        placements: [],
      };
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(mockAdSlot as any);

      const response = await request(app).get('/api/ad-slots/adslot1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'adslot1');
    });
  });

  describe('POST /api/ad-slots', () => {
    it('should create ad slot (PUBLISHER auth)', async () => {
      setMockPublisherAuth();
      const newAdSlot = createMockAdSlot();
      vi.mocked(prisma.adSlot.create).mockResolvedValue(newAdSlot as any);

      const response = await request(app).post('/api/ad-slots').send({
        name: 'New Ad Slot',
        type: 'DISPLAY',
        basePrice: 100,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('POST /api/ad-slots/:id/book', () => {
    it('should create placement request (SPONSOR auth) without locking inventory', async () => {
      setMockSponsorAuth();
      const mockAdSlot = {
        ...createMockAdSlot(),
        isAvailable: true,
        publisher: createMockPublisher(),
      };
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(mockAdSlot as any);
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue({
        id: 'campaign1',
        sponsorId: 'sponsor1',
        name: 'Test Campaign',
      } as any);
      vi.mocked(prisma.creative.findUnique).mockResolvedValue({
        id: 'creative1',
        campaignId: 'campaign1',
        name: 'Test Creative',
        type: 'BANNER',
      } as any);
      const newPlacement = createMockPlacement();
      vi.mocked(prisma.placement.create).mockResolvedValue(newPlacement as any);

      const response = await request(app).post('/api/ad-slots/adslot1/book').send({
        campaignId: 'campaign1',
        creativeId: 'creative1',
        agreedPrice: 100,
        pricingModel: 'CPM',
        startDate: '2026-02-01',
        endDate: '2026-03-01',
        message: 'Hello',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('placement');
      expect(prisma.adSlot.update).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/ad-slots/:id/unbook', () => {
    it('should unbook ad slot', async () => {
      const updatedSlot = { ...createMockAdSlot(), isAvailable: true };
      vi.mocked(prisma.adSlot.update).mockResolvedValue(updatedSlot as any);

      const response = await request(app).post('/api/ad-slots/adslot1/unbook');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /api/ad-slots/:id', () => {
    it('should update ad slot (PUBLISHER auth)', async () => {
      setMockPublisherAuth();
      const existingAdSlot = createMockAdSlot();
      vi.mocked(prisma.adSlot.findFirst).mockResolvedValue(existingAdSlot as any);
      const updatedAdSlot = { ...createMockAdSlot(), name: 'Updated Ad Slot' };
      vi.mocked(prisma.adSlot.update).mockResolvedValue(updatedAdSlot as any);

      const response = await request(app)
        .put('/api/ad-slots/adslot1')
        .send({ name: 'Updated Ad Slot' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'adslot1');
    });

    it('should reject update when ad slot is already booked', async () => {
      setMockPublisherAuth();
      const existingAdSlot = { ...createMockAdSlot(), isAvailable: false };
      vi.mocked(prisma.adSlot.findFirst).mockResolvedValue(existingAdSlot as any);

      const response = await request(app)
        .put('/api/ad-slots/adslot1')
        .send({ name: 'Updated Ad Slot' });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(String(response.body.error).toLowerCase()).toContain('booked');
      expect(prisma.adSlot.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/ad-slots/:id', () => {
    it('should delete ad slot (PUBLISHER auth)', async () => {
      setMockPublisherAuth();
      const existingAdSlot = createMockAdSlot();
      vi.mocked(prisma.adSlot.findFirst).mockResolvedValue(existingAdSlot as any);
      vi.mocked(prisma.adSlot.delete).mockResolvedValue(existingAdSlot as any);

      const response = await request(app).delete('/api/ad-slots/adslot1');

      expect(response.status).toBe(204);
    });
  });

  // ============================================================================
  // Placements Routes
  // ============================================================================

  describe('GET /api/placements', () => {
    it('should return array of placements', async () => {
      setMockSponsorAuth();
      const mockPlacements = [createMockPlacement()];
      vi.mocked(prisma.placement.findMany).mockResolvedValue(mockPlacements as any);

      const response = await request(app).get('/api/placements');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by query parameters', async () => {
      setMockSponsorAuth();
      const mockPlacements = [createMockPlacement()];
      vi.mocked(prisma.placement.findMany).mockResolvedValue(mockPlacements as any);

      const response = await request(app).get(
        '/api/placements?campaignId=campaign1&status=PENDING'
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/placements', () => {
    it('should create placement', async () => {
      setMockSponsorAuth();
      const newPlacement = createMockPlacement();
      vi.mocked(prisma.placement.create).mockResolvedValue(newPlacement as any);
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue({
        id: 'adslot1',
        publisherId: 'publisher1',
        isAvailable: true,
      } as any);

      const response = await request(app).post('/api/placements').send({
        campaignId: 'campaign1',
        creativeId: 'creative1',
        adSlotId: 'adslot1',
        agreedPrice: 100,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('PATCH /api/placements/:id', () => {
    it('should approve placement request (PUBLISHER auth) and lock inventory', async () => {
      setMockPublisherAuth();

      (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(prisma));

      vi.mocked(prisma.placement.findUnique).mockResolvedValue({
        ...createMockPlacement(),
        id: 'placement1',
        status: 'PENDING',
        publisherId: 'publisher1',
        adSlotId: 'adslot1',
        adSlot: { id: 'adslot1', isAvailable: true },
      } as any);

      vi.mocked(prisma.adSlot.update).mockResolvedValue({
        ...createMockAdSlot(),
        id: 'adslot1',
        isAvailable: false,
      } as any);
      vi.mocked(prisma.placement.update).mockResolvedValue({
        ...createMockPlacement(),
        id: 'placement1',
        status: 'APPROVED',
      } as any);

      const response = await request(app)
        .patch('/api/placements/placement1')
        .send({ status: 'APPROVED' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'APPROVED');
      expect(prisma.adSlot.update).toHaveBeenCalled();
    });

    it('should reject placement request (PUBLISHER auth) without locking inventory', async () => {
      setMockPublisherAuth();

      (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(prisma));

      vi.mocked(prisma.placement.findUnique).mockResolvedValue({
        ...createMockPlacement(),
        id: 'placement1',
        status: 'PENDING',
        publisherId: 'publisher1',
        adSlotId: 'adslot1',
        adSlot: { id: 'adslot1', isAvailable: true },
      } as any);

      vi.mocked(prisma.placement.update).mockResolvedValue({
        ...createMockPlacement(),
        id: 'placement1',
        status: 'REJECTED',
      } as any);

      const response = await request(app)
        .patch('/api/placements/placement1')
        .send({ status: 'REJECTED' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'REJECTED');
      expect(prisma.adSlot.update).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Dashboard Routes
  // ============================================================================

  describe('GET /api/dashboard/stats', () => {
    it('should return platform statistics', async () => {
      vi.mocked(prisma.sponsor.count).mockResolvedValue(10);
      vi.mocked(prisma.publisher.count).mockResolvedValue(5);
      vi.mocked(prisma.campaign.count).mockResolvedValue(20);
      vi.mocked(prisma.placement.count).mockResolvedValue(50);
      vi.mocked(prisma.placement.aggregate).mockResolvedValue({
        _sum: { impressions: 1000, clicks: 100, conversions: 10 },
      } as any);

      const response = await request(app).get('/api/dashboard/stats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sponsors', 10);
      expect(response.body).toHaveProperty('publishers', 5);
      expect(response.body).toHaveProperty('activeCampaigns', 20);
      expect(response.body).toHaveProperty('totalPlacements', 50);
      expect(response.body).toHaveProperty('metrics');
    });
  });
});
