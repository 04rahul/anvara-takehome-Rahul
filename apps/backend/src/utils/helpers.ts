// Utility helpers for the API

// Helper to safely extract route/query params
// BUG: Return type should be 'string' but function can return empty string silently
export function getParam(param: unknown): string {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return '';
}

// Helper to format currency values
export function formatCurrency(amount: number, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  return formatter.format(amount);
}

// Helper to calculate percentage change
export function calculatePercentChange(oldValue: number, newValue: number) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// Parse pagination params from query
export function parsePagination(query: { page?: string | string[]; limit?: string | string[] }) {
  const page = parseInt(Array.isArray(query.page) ? query.page[0] : query.page || '1') || 1;
  const limit = parseInt(Array.isArray(query.limit) ? query.limit[0] : query.limit || '10') || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper to build filter object from query params
export const buildFilters = (query: Record<string, unknown>, allowedFields: string[]) => {
  const filters: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (query[field] !== undefined) {
      filters[field] = query[field];
    }
  }

  return filters;
};

// Unused export that should be removed or marked deprecated
export const DEPRECATED_CONFIG = {
  apiVersion: 'v1',
  timeout: 5000,
};

// BUG: This function has a logic error - it doesn't handle negative numbers correctly
export function clampValue(value: number, min: number, max: number): number {
  // Should use Math.max(min, Math.min(max, value)) but this is wrong
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// TODO: Add proper date formatting helper
// This is a stub that candidates might notice and implement
export function formatDate(date: string | Date): string {
  // BUG: Doesn't handle invalid dates
  return new Date(date).toLocaleDateString();
}

// ============================================================================
// INPUT VALIDATION HELPERS
// ============================================================================

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates and sanitizes a string input
 * - Checks if value is a valid string
 * - Trims whitespace
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @param options - Validation options
 * @returns Sanitized string or throws ValidationError
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    allowEmpty?: boolean;
  } = {}
): string {
  const { required = false, maxLength, minLength, allowEmpty = true } = options;

  // Check if value is provided
  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return '';
  }

  // Check if value is a string
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  // Trim whitespace
  const sanitized = value.trim();

  // Check if empty after trim
  if (!allowEmpty && sanitized.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty`);
  }

  // Check min length
  if (minLength !== undefined && sanitized.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
  }

  // Check max length
  if (maxLength !== undefined && sanitized.length > maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`);
  }

  return sanitized;
}

/**
 * Validates and converts a value to a positive integer
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @param options - Validation options
 * @returns Validated integer or null if optional and not provided
 */
export function validateInteger(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    allowNull?: boolean;
  } = {}
): number | null {
  const { required = false, min, max, allowNull = true } = options;

  // Check if value is provided
  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return allowNull ? null : (undefined as any);
  }

  // Convert to number
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  // Check if it's a valid number
  if (isNaN(num) || !isFinite(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  // Check if it's an integer
  if (!Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }

  // Check if it's positive
  if (num < 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }

  // Check min value
  if (min !== undefined && num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`);
  }

  // Check max value
  if (max !== undefined && num > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`);
  }

  return num;
}

/**
 * Validates a decimal/number value
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @param options - Validation options
 * @returns Validated number
 */
export function validateDecimal(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
  } = {}
): number {
  const { required = false, min, max } = options;

  // Check if value is provided
  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    throw new ValidationError(`${fieldName} is required`);
  }

  // Convert to number
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  // Check if it's a valid number
  if (isNaN(num) || !isFinite(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  // Check min value
  if (min !== undefined && num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`);
  }

  // Check max value
  if (max !== undefined && num > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`);
  }

  return num;
}
