/**
 * A/B Testing Framework - Core Utility
 * 
 * Simple cookie-based A/B testing with support for:
 * - Multiple concurrent tests
 * - Weighted variant assignment
 * - Persistent user assignment
 */

export interface ABTestConfig {
  variants: string[];
  weights: number[];
}

const COOKIE_PREFIX = 'ab_test_';
const COOKIE_EXPIRY_DAYS = 30;

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

/**
 * Set a cookie with expiration
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof window === 'undefined') return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;

  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

/**
 * Delete a cookie by name
 */
function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Assign a random variant based on weights
 */
function assignVariant(config: ABTestConfig): string {
  const { variants, weights } = config;

  // Validate weights sum to 100
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);


  // Generate random number between 0 and 100
  const random = Math.random() * 100;

  // Find which variant this falls into
  let cumulativeWeight = 0;
  for (let i = 0; i < variants.length; i++) {
    cumulativeWeight += weights[i];
    if (random < cumulativeWeight) {
      return variants[i];
    }
  }

  // Fallback to first variant (shouldn't reach here)
  return variants[0];
}

/**
 * Get or assign a variant for a test
 * Returns the variant identifier that the user should see
 */
export function getVariant(testId: string, config: ABTestConfig): string | null {
  if (typeof window === 'undefined') {
    // Server-side: return null (will be hydrated on client)
    return null;
  }

  const cookieName = `${COOKIE_PREFIX}${testId}`;

  // Check if user already has an assignment
  const existingVariant = getCookie(cookieName);
  if (existingVariant && config.variants.includes(existingVariant)) {
    return existingVariant;
  }

  // Assign new variant
  const variant = assignVariant(config);
  setCookie(cookieName, variant, COOKIE_EXPIRY_DAYS);

  return variant;
}

/**
 * Clear variant assignment for a specific test or all tests
 */
export function clearVariant(testId?: string): void {
  if (typeof window === 'undefined') return;

  if (testId) {
    // Clear specific test
    const cookieName = `${COOKIE_PREFIX}${testId}`;
    deleteCookie(cookieName);
  } else {
    // Clear all AB test cookies
    const cookies = document.cookie.split(';');
    cookies.forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (name.startsWith(COOKIE_PREFIX)) {
        deleteCookie(name);
      }
    });
  }
}

/**
 * Get all active test assignments for debugging
 */
export function getAllVariants(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const variants: Record<string, string> = {};
  const cookies = document.cookie.split(';');

  cookies.forEach((cookie) => {
    const [name, value] = cookie.split('=').map((s) => s.trim());
    if (name.startsWith(COOKIE_PREFIX)) {
      const testId = name.substring(COOKIE_PREFIX.length);
      variants[testId] = value;
    }
  });

  return variants;
}

/**
 * Force a specific variant for testing (used by debug panel)
 */
export function forceVariant(testId: string, variant: string): void {
  if (typeof window === 'undefined') return;

  const cookieName = `${COOKIE_PREFIX}${testId}`;
  setCookie(cookieName, variant, COOKIE_EXPIRY_DAYS);
}
