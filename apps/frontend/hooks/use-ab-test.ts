'use client';

import { useEffect, useState } from 'react';
import { getVariant, type ABTestConfig } from '@/lib/ab-test';
import { trackVariantAssignment } from '@/lib/analytics';

/**
 * React hook for A/B testing
 * 
 * Returns the variant identifier for a given test.
 * Handles client-side only execution and automatic tracking.
 * 
 * @example
 * ```tsx
 * const variant = useABTest('my-test', {
 *   variants: ['A', 'B'],
 *   weights: [50, 50]
 * });
 * 
 * return variant === 'A' 
 *   ? <ComponentA />
 *   : <ComponentB />;
 * ```
 */
export function useABTest(testId: string, config: ABTestConfig): string | null {
  const [variant, setVariant] = useState<string | null>(null);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Get or assign variant
    const assignedVariant = getVariant(testId, config);
    setVariant(assignedVariant);

    // Track assignment (only once per session per test)
    if (assignedVariant && !tracked) {
      const trackingKey = `ab_tracked_${testId}`;
      const alreadyTracked = sessionStorage.getItem(trackingKey);
      
      if (!alreadyTracked) {
        trackVariantAssignment(testId, assignedVariant);
        sessionStorage.setItem(trackingKey, 'true');
        setTracked(true);
      }
    }
  }, [testId, config, tracked]);

  return variant;
}

/**
 * Hook specifically for marketplace CTA style test
 * Provides type-safe variant values
 */
export function useMarketplaceCtaTest(): 'solid' | 'outline' | null {
  return useABTest('marketplace-cta-style', {
    variants: ['solid', 'outline'],
    weights: [50, 50],
  }) as 'solid' | 'outline' | null;
}

/**
 * Hook specifically for detail page layout test
 * Provides type-safe variant values
 */
export function useDetailPageLayoutTest(): 'traditional' | 'modern' | null {
  return useABTest('detail-page-layout', {
    variants: ['traditional', 'modern'],
    weights: [50, 50],
  }) as 'traditional' | 'modern' | null;
}
