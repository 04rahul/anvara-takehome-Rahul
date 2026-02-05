/**
 * A/B Test Configuration Registry
 * 
 * Centralized configuration for all active A/B tests.
 * Add new tests here with their variants and weights.
 */

import type { ABTestConfig } from './ab-test';

export const AB_TESTS = {
  /**
   * Test different button styles on marketplace ad slot cards
   * Variant A: Solid blue button (current design)
   * Variant B: Outline style button
   */
  'marketplace-cta-style': {
    variants: ['solid', 'outline'],
    weights: [50, 50],
    description: 'Test solid vs outline button style on marketplace cards',
  },
  
  /**
   * Test different booking form layouts on detail page
   * Variant A: Traditional vertical layout (current design)
   * Variant B: Modern horizontal/compact layout
   */
  'detail-page-layout': {
    variants: ['traditional', 'modern'],
    weights: [50, 50],
    description: 'Test traditional vs modern booking form layout',
  },
} as const satisfies Record<string, ABTestConfig & { description: string }>;

// Export type-safe test IDs
export type ABTestId = keyof typeof AB_TESTS;

// Export type-safe variant types
export type MarketplaceCtaVariant = typeof AB_TESTS['marketplace-cta-style']['variants'][number];
export type DetailPageLayoutVariant = typeof AB_TESTS['detail-page-layout']['variants'][number];
