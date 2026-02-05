/**
 * Analytics Tracking Utility
 * 
 * Simple event tracking for A/B tests and user interactions.
 * Currently logs to console for verification.
 * Can be extended to integrate with GA4 or other analytics services.
 */

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  [key: string]: unknown;
}

/**
 * Track an analytics event
 */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  
  const eventData: AnalyticsEvent = {
    event,
    timestamp: Date.now(),
    ...properties,
  };
  
  // Console logging for development/verification
  console.log('[Analytics]', eventData);
  
  // TODO: Integrate with GA4 or other analytics service
  // Example for GA4:
  // if (typeof window.gtag !== 'undefined') {
  //   window.gtag('event', event, properties);
  // }
  
  // Store in sessionStorage for debugging
  try {
    const key = 'analytics_events';
    const existing = sessionStorage.getItem(key);
    const events = existing ? JSON.parse(existing) : [];
    events.push(eventData);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.shift();
    }
    
    sessionStorage.setItem(key, JSON.stringify(events));
  } catch (error) {
    // Ignore storage errors
  }
}

/**
 * Track A/B test variant assignment
 */
export function trackVariantAssignment(testId: string, variant: string): void {
  track('ab_test_assigned', {
    testId,
    variant,
  });
}

/**
 * Track A/B test conversion (user completed desired action)
 */
export function trackConversion(testId: string, variant: string, conversionType: string): void {
  track('ab_test_conversion', {
    testId,
    variant,
    conversionType,
  });
}

/**
 * Get all tracked events from session storage (for debugging)
 */
export function getTrackedEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = 'analytics_events';
    const existing = sessionStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all tracked events
 */
export function clearTrackedEvents(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem('analytics_events');
  } catch {
    // Ignore errors
  }
}
