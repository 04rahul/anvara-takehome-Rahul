'use client';

import { useEffect, useState } from 'react';
import { getVariant, type ABTestConfig } from '@/lib/ab-test';
import { trackVariantAssignment } from '@/lib/analytics';
import { AB_TESTS } from '@/lib/ab-test-config';

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

    if (testId === 'marketplace-filter-layout') {
      try {
        const key = 'dbg_ab_useABTest_marketplace-filter-layout_v1';
        if (!sessionStorage.getItem(key)) {
          // #region agent log H3/H4
          if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
            fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/ingest/3f0b1e04-39fc-4b7e-98fa-50c590796815`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: 'debug-session',
                runId: 'pre-fix',
                hypothesisId: 'H3',
                location: 'hooks/use-ab-test.ts:useABTest[effect]',
                message: 'useABTest effect running for marketplace-filter-layout',
                data: {
                  testId,
                  variants: config.variants,
                  weights: config.weights,
                  cookieEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : null,
                  hasAbCookie: typeof document !== 'undefined'
                    ? document.cookie.split(';').some((c) => c.trim().startsWith('ab_test_marketplace-filter-layout='))
                    : null,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => { });
          }
          // #endregion agent log H3/H4
          sessionStorage.setItem(key, 'true');
        }
      } catch {
        // ignore instrumentation errors
      }
    }

    // Get or assign variant
    const assignedVariant = getVariant(testId, config);
    setVariant(assignedVariant);

    if (testId === 'marketplace-filter-layout') {
      try {
        const key = 'dbg_ab_useABTest_marketplace-filter-layout_assigned_v1';
        if (!sessionStorage.getItem(key)) {
          // #region agent log H3/H4
          if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
            fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/ingest/3f0b1e04-39fc-4b7e-98fa-50c590796815`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: 'debug-session',
                runId: 'pre-fix',
                hypothesisId: 'H4',
                location: 'hooks/use-ab-test.ts:useABTest[assigned]',
                message: 'Assigned variant for marketplace-filter-layout',
                data: {
                  testId,
                  assignedVariant,
                  cookieNowHasAbCookie: typeof document !== 'undefined'
                    ? document.cookie.split(';').some((c) => c.trim().startsWith('ab_test_marketplace-filter-layout='))
                    : null,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => { });
          }
          // #endregion agent log H3/H4
          sessionStorage.setItem(key, 'true');
        }
      } catch {
        // ignore instrumentation errors
      }
    }

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

export function useMarketplaceCtaTest(): 'solid' | 'outline' | null {
  return useABTest('marketplace-cta-style', AB_TESTS['marketplace-cta-style']) as 'solid' | 'outline' | null;
}

/**
 * Hook specifically for detail page layout test
 * Provides type-safe variant values
 */
export function useDetailPageLayoutTest(): 'traditional' | 'modern' | null {
  return useABTest('detail-page-layout', AB_TESTS['detail-page-layout']) as 'traditional' | 'modern' | null;
}

/**
 * Hook specifically for marketplace filter layout test
 * Provides type-safe variant values
 */
export function useMarketplaceFilterLayoutTest(): 'top' | 'sidebar' | null {
  return useABTest('marketplace-filter-layout', AB_TESTS['marketplace-filter-layout']) as 'top' | 'sidebar' | null;
}