/**
 * Reusable Zod validators for common business data patterns
 *
 * Provides pre-built Zod schemas for validating:
 * - Email addresses (RFC 5322 simplified)
 * - Phone numbers (with international format support)
 * - URLs (with protocol validation)
 * - VAT IDs (EU VAT format)
 * - Currency amounts (positive decimals with 2 decimal places)
 * - Slugs (URL-safe identifiers)
 * - Hexadecimal colors
 *
 * These validators can be used standalone or composed into larger schemas.
 *
 * @example
 * // Standalone usage
 * const email = await emailValidator.parseAsync(userInput)
 *
 * @example
 * // Composed in larger schema
 * const userSchema = z.object({
 *   email: emailValidator,
 *   phone: phoneValidator.optional(),
 *   website: urlValidator.optional(),
 * })
 */

import { z } from 'zod'
import { isValidPhoneNumber } from '../phone'

// ====== Email Validator ======
/**
 * Validates email addresses with simplified RFC 5322 pattern
 * Allows most common email formats used in business applications
 *
 * @example
 * emailValidator.parse('user@example.com') // ✓
 * emailValidator.parse('invalid.email@') // ✗
 */
export const emailValidator = z
  .string()
  .min(1, 'Email is required')
  .max(254, 'Email must be less than 254 characters')
  .email('Invalid email address')
  .toLowerCase()
  .trim()

/**
 * Optional email validator - allows null/undefined
 */
export const emailValidatorOptional = emailValidator.optional()

// ====== Phone Validator ======
/**
 * Validates international phone numbers with country code
 * Requires E.164 format (starts with +)
 *
 * @example
 * phoneValidator.parse('+1234567890') // ✓
 * phoneValidator.parse('1234567890') // ✗ (missing country code)
 * phoneValidator.parse('+123456') // ✗ (too short)
 */
export const phoneValidator = z
  .string()
  .min(1, 'Phone number is required')
  .trim()
  .refine(
    (value) => isValidPhoneNumber(value),
    {
      message: 'Phone number must start with + and contain 7-15 digits',
    },
  )

/**
 * Optional phone validator - allows null/undefined
 */
export const phoneValidatorOptional = phoneValidator.optional()

// ====== URL Validator ======
/**
 * Validates URLs with common protocols (http, https, ftp)
 * Ensures URLs are properly formatted
 *
 * @example
 * urlValidator.parse('https://example.com') // ✓
 * urlValidator.parse('example.com') // ✗ (missing protocol)
 */
export const urlValidator = z
  .string()
  .min(1, 'URL is required')
  .url('Invalid URL')
  .refine(
    (url) => /^(https?|ftp):\/\//i.test(url),
    {
      message: 'URL must start with http://, https://, or ftp://',
    },
  )
  .toLowerCase()
  .trim()

/**
 * Optional URL validator - allows null/undefined
 */
export const urlValidatorOptional = urlValidator.optional()

// ====== VAT ID Validator (EU format) ======
/**
 * Validates EU VAT IDs in standard format (country code + number)
 * Examples: DE123456789, FR12345678901, IT12345678901
 *
 * @example
 * vatIdValidator.parse('DE123456789') // ✓
 * vatIdValidator.parse('XX123456789') // ✗ (invalid country code)
 */
const EU_COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]

export const vatIdValidator = z
  .string()
  .min(1, 'VAT ID is required')
  .max(14, 'VAT ID must be less than 14 characters')
  .toUpperCase()
  .trim()
  .refine(
    (vatId) => {
      const countryCode = vatId.substring(0, 2)
      const number = vatId.substring(2)
      return EU_COUNTRY_CODES.includes(countryCode) && /^\d+$/.test(number) && number.length >= 6
    },
    {
      message: 'Invalid VAT ID format. Must be valid EU country code followed by 6+ digits',
    },
  )

/**
 * Optional VAT ID validator
 */
export const vatIdValidatorOptional = vatIdValidator.optional()

// ====== Currency Amount Validator ======
/**
 * Validates positive decimal amounts with up to 2 decimal places
 * Common for currency amounts in business applications
 *
 * @example
 * currencyAmountValidator.parse(99.99) // ✓
 * currencyAmountValidator.parse('99.99') // ✓
 * currencyAmountValidator.parse(-10) // ✗ (negative not allowed)
 * currencyAmountValidator.parse(99.999) // ✗ (too many decimals)
 */
export const currencyAmountValidator = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
  .refine((val) => val > 0, 'Amount must be greater than 0')
  .refine(
    (val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
    'Amount must have at most 2 decimal places',
  )

/**
 * Optional currency amount validator
 */
export const currencyAmountValidatorOptional = currencyAmountValidator.optional()

// ====== Slug Validator ======
/**
 * Validates URL-safe slugs (lowercase letters, numbers, hyphens, underscores)
 * Commonly used for product IDs, URL paths, etc.
 *
 * @example
 * slugValidator.parse('my-product-name') // ✓
 * slugValidator.parse('my_product_123') // ✓
 * slugValidator.parse('My Product') // ✗ (spaces and uppercase)
 */
export const slugValidator = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .toLowerCase()
  .trim()
  .refine(
    (slug) => /^[a-z0-9_-]+$/.test(slug),
    'Slug can only contain lowercase letters, numbers, hyphens, and underscores',
  )

/**
 * Optional slug validator
 */
export const slugValidatorOptional = slugValidator.optional()

// ====== Hex Color Validator ======
/**
 * Validates hexadecimal color codes (3 or 6 digits)
 * Supports both #RGB and #RRGGBB formats
 *
 * @example
 * hexColorValidator.parse('#FF0000') // ✓
 * hexColorValidator.parse('#F00') // ✓
 * hexColorValidator.parse('FF0000') // ✗ (missing #)
 */
export const hexColorValidator = z
  .string()
  .min(1, 'Color is required')
  .toUpperCase()
  .trim()
  .refine(
    (color) => /^#([A-F0-9]{3}|[A-F0-9]{6})$/.test(color),
    'Color must be a valid hex code (#RGB or #RRGGBB)',
  )

/**
 * Optional hex color validator
 */
export const hexColorValidatorOptional = hexColorValidator.optional()

// ====== Percentage Validator ======
/**
 * Validates percentage values (0-100)
 * Useful for discount rates, tax rates, etc.
 *
 * @example
 * percentageValidator.parse(50) // ✓
 * percentageValidator.parse('75.5') // ✓
 * percentageValidator.parse(150) // ✗ (exceeds 100)
 */
export const percentageValidator = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
  .refine((val) => val >= 0 && val <= 100, 'Percentage must be between 0 and 100')

/**
 * Optional percentage validator
 */
export const percentageValidatorOptional = percentageValidator.optional()

// ====== Positive Integer Validator ======
/**
 * Validates positive integers (1 or greater)
 * Common for quantities, counts, etc.
 *
 * @example
 * positiveIntValidator.parse(5) // ✓
 * positiveIntValidator.parse('10') // ✓
 * positiveIntValidator.parse(0) // ✗ (must be > 0)
 */
export const positiveIntValidator = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
  .refine((val) => Number.isInteger(val) && val > 0, 'Must be a positive integer')

/**
 * Optional positive integer validator
 */
export const positiveIntValidatorOptional = positiveIntValidator.optional()

// ====== Non-Negative Integer Validator ======
/**
 * Validates non-negative integers (0 or greater)
 * Common for optional quantities, days, etc.
 *
 * @example
 * nonNegativeIntValidator.parse(0) // ✓
 * nonNegativeIntValidator.parse('5') // ✓
 * nonNegativeIntValidator.parse(-1) // ✗ (negative not allowed)
 */
export const nonNegativeIntValidator = z
  .union([z.number(), z.string()])
  .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
  .refine((val) => Number.isInteger(val) && val >= 0, 'Must be a non-negative integer')

/**
 * Optional non-negative integer validator
 */
export const nonNegativeIntValidatorOptional = nonNegativeIntValidator.optional()

// ====== Username Validator ======
/**
 * Validates usernames (3-30 characters, letters/numbers/underscore/hyphen)
 * Cannot start or end with hyphen or underscore
 *
 * @example
 * usernameValidator.parse('john_doe') // ✓
 * usernameValidator.parse('user-123') // ✓
 * usernameValidator.parse('-invalid') // ✗ (starts with hyphen)
 */
export const usernameValidator = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .toLowerCase()
  .trim()
  .refine(
    (username) => /^[a-z0-9]([a-z0-9_-]{1,28}[a-z0-9])?$/.test(username),
    'Username can only contain letters, numbers, hyphens, and underscores. Cannot start or end with hyphen or underscore',
  )

/**
 * Optional username validator
 */
export const usernameValidatorOptional = usernameValidator.optional()

// ====== ISO Date String Validator ======
/**
 * Validates ISO 8601 date strings (YYYY-MM-DD)
 * Ensures dates are valid and formatted correctly
 *
 * @example
 * isoDateValidator.parse('2026-06-13') // ✓
 * isoDateValidator.parse('2026-13-01') // ✗ (invalid month)
 */
export const isoDateValidator = z
  .string()
  .trim()
  .refine(
    (dateString) => {
      const date = new Date(dateString)
      return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0]
    },
    'Must be a valid ISO 8601 date (YYYY-MM-DD)',
  )

/**
 * Optional ISO date validator
 */
export const isoDateValidatorOptional = isoDateValidator.optional()
