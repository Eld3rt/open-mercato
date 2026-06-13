import {
  emailValidator,
  phoneValidator,
  urlValidator,
  vatIdValidator,
  currencyAmountValidator,
  slugValidator,
  hexColorValidator,
  percentageValidator,
  positiveIntValidator,
  nonNegativeIntValidator,
  usernameValidator,
  isoDateValidator,
} from '../data/zod-validators'

describe('Zod Validators', () => {
  describe('emailValidator', () => {
    it('accepts valid email addresses', () => {
      expect(emailValidator.parse('user@example.com')).toBe('user@example.com')
      expect(emailValidator.parse('john.doe+tag@company.co.uk')).toBe('john.doe+tag@company.co.uk')
    })

    it('normalizes email to lowercase and trims whitespace', () => {
      expect(emailValidator.parse('  USER@EXAMPLE.COM  ')).toBe('user@example.com')
    })

    it('rejects invalid email formats', () => {
      expect(() => emailValidator.parse('invalid.email@')).toThrow()
      expect(() => emailValidator.parse('no-at-sign.com')).toThrow()
      expect(() => emailValidator.parse('')).toThrow()
    })

    it('rejects email exceeding max length', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(() => emailValidator.parse(longEmail)).toThrow()
    })
  })

  describe('phoneValidator', () => {
    it('accepts valid E.164 formatted phone numbers', () => {
      expect(phoneValidator.parse('+1234567890')).toBe('+1234567890')
      expect(phoneValidator.parse('  +48 123 456 789  ')).toBe('+48 123 456 789')
    })

    it('rejects phone numbers without country code', () => {
      expect(() => phoneValidator.parse('1234567890')).toThrow()
    })

    it('rejects phone numbers that are too short', () => {
      expect(() => phoneValidator.parse('+123')).toThrow()
    })

    it('trims whitespace from phone numbers', () => {
      expect(phoneValidator.parse('  +1234567890  ')).toBe('+1234567890')
    })
  })

  describe('urlValidator', () => {
    it('accepts valid URLs with http/https/ftp protocols', () => {
      expect(urlValidator.parse('https://example.com')).toBe('https://example.com')
      expect(urlValidator.parse('http://example.com/path')).toBe('http://example.com/path')
      expect(urlValidator.parse('ftp://files.example.com')).toBe('ftp://files.example.com')
    })

    it('normalizes URL to lowercase', () => {
      expect(urlValidator.parse('HTTPS://EXAMPLE.COM')).toBe('https://example.com')
    })

    it('rejects URLs without protocol', () => {
      expect(() => urlValidator.parse('example.com')).toThrow()
    })

    it('rejects URLs with invalid protocols', () => {
      expect(() => urlValidator.parse('gopher://example.com')).toThrow()
    })

    it('trims whitespace from URLs', () => {
      expect(urlValidator.parse('  https://example.com  ')).toBe('https://example.com')
    })
  })

  describe('vatIdValidator', () => {
    it('accepts valid EU VAT IDs', () => {
      expect(vatIdValidator.parse('de123456789')).toBe('DE123456789')
      expect(vatIdValidator.parse('FR12345678901')).toBe('FR12345678901')
      expect(vatIdValidator.parse('IT123456789')).toBe('IT123456789')
    })

    it('normalizes VAT ID to uppercase', () => {
      expect(vatIdValidator.parse('de123456789')).toBe('DE123456789')
    })

    it('rejects invalid country codes', () => {
      expect(() => vatIdValidator.parse('XX123456789')).toThrow()
      expect(() => vatIdValidator.parse('US123456789')).toThrow()
    })

    it('rejects VAT IDs with insufficient digits', () => {
      expect(() => vatIdValidator.parse('DE12345')).toThrow()
    })

    it('rejects VAT IDs with non-numeric part after country code', () => {
      expect(() => vatIdValidator.parse('DEABCDEFGHI')).toThrow()
    })

    it('trims whitespace from VAT IDs', () => {
      expect(vatIdValidator.parse('  DE123456789  ')).toBe('DE123456789')
    })
  })

  describe('currencyAmountValidator', () => {
    it('accepts positive numbers and numeric strings', () => {
      expect(currencyAmountValidator.parse(99.99)).toBe(99.99)
      expect(currencyAmountValidator.parse('99.99')).toBe(99.99)
      expect(currencyAmountValidator.parse(100)).toBe(100)
    })

    it('accepts whole numbers with implicit .00', () => {
      expect(currencyAmountValidator.parse('50')).toBe(50)
    })

    it('rejects negative amounts', () => {
      expect(() => currencyAmountValidator.parse(-10)).toThrow()
      expect(() => currencyAmountValidator.parse('-99.99')).toThrow()
    })

    it('rejects amounts with more than 2 decimal places', () => {
      expect(() => currencyAmountValidator.parse(99.999)).toThrow()
      expect(() => currencyAmountValidator.parse('99.999')).toThrow()
    })

    it('rejects zero and negative zero', () => {
      expect(() => currencyAmountValidator.parse(0)).toThrow()
      expect(() => currencyAmountValidator.parse('0')).toThrow()
    })
  })

  describe('slugValidator', () => {
    it('accepts valid slugs with letters, numbers, hyphens, and underscores', () => {
      expect(slugValidator.parse('my-product-name')).toBe('my-product-name')
      expect(slugValidator.parse('my_product_123')).toBe('my_product_123')
      expect(slugValidator.parse('product1')).toBe('product1')
    })

    it('normalizes slug to lowercase', () => {
      expect(slugValidator.parse('My-Product-NAME')).toBe('my-product-name')
    })

    it('rejects slugs with spaces', () => {
      expect(() => slugValidator.parse('my product')).toThrow()
    })

    it('rejects slugs with special characters', () => {
      expect(() => slugValidator.parse('my@product')).toThrow()
      expect(() => slugValidator.parse('my.product')).toThrow()
    })

    it('trims whitespace from slugs', () => {
      expect(slugValidator.parse('  my-product  ')).toBe('my-product')
    })
  })

  describe('hexColorValidator', () => {
    it('accepts valid 6-digit hex colors', () => {
      expect(hexColorValidator.parse('#FF0000')).toBe('#FF0000')
      expect(hexColorValidator.parse('#00FF00')).toBe('#00FF00')
    })

    it('accepts valid 3-digit hex colors', () => {
      expect(hexColorValidator.parse('#F00')).toBe('#F00')
      expect(hexColorValidator.parse('#0F0')).toBe('#0F0')
    })

    it('normalizes hex colors to uppercase', () => {
      expect(hexColorValidator.parse('#ff0000')).toBe('#FF0000')
    })

    it('rejects colors without hash prefix', () => {
      expect(() => hexColorValidator.parse('FF0000')).toThrow()
    })

    it('rejects invalid hex values', () => {
      expect(() => hexColorValidator.parse('#GGGGGG')).toThrow()
      expect(() => hexColorValidator.parse('#12')).toThrow()
    })

    it('trims whitespace from colors', () => {
      expect(hexColorValidator.parse('  #FF0000  ')).toBe('#FF0000')
    })
  })

  describe('percentageValidator', () => {
    it('accepts percentages between 0 and 100', () => {
      expect(percentageValidator.parse(0)).toBe(0)
      expect(percentageValidator.parse(50)).toBe(50)
      expect(percentageValidator.parse(100)).toBe(100)
      expect(percentageValidator.parse('75.5')).toBe(75.5)
    })

    it('accepts string representations of percentages', () => {
      expect(percentageValidator.parse('25')).toBe(25)
    })

    it('rejects negative percentages', () => {
      expect(() => percentageValidator.parse(-1)).toThrow()
    })

    it('rejects percentages exceeding 100', () => {
      expect(() => percentageValidator.parse(101)).toThrow()
      expect(() => percentageValidator.parse('150')).toThrow()
    })
  })

  describe('positiveIntValidator', () => {
    it('accepts positive integers', () => {
      expect(positiveIntValidator.parse(1)).toBe(1)
      expect(positiveIntValidator.parse(100)).toBe(100)
      expect(positiveIntValidator.parse('50')).toBe(50)
    })

    it('rejects zero', () => {
      expect(() => positiveIntValidator.parse(0)).toThrow()
    })

    it('rejects negative integers', () => {
      expect(() => positiveIntValidator.parse(-5)).toThrow()
    })

    it('rejects non-integer values', () => {
      expect(() => positiveIntValidator.parse(5.5)).toThrow()
      expect(() => positiveIntValidator.parse('5.5')).toThrow()
    })
  })

  describe('nonNegativeIntValidator', () => {
    it('accepts zero and positive integers', () => {
      expect(nonNegativeIntValidator.parse(0)).toBe(0)
      expect(nonNegativeIntValidator.parse(100)).toBe(100)
      expect(nonNegativeIntValidator.parse('50')).toBe(50)
    })

    it('rejects negative integers', () => {
      expect(() => nonNegativeIntValidator.parse(-1)).toThrow()
    })

    it('rejects non-integer values', () => {
      expect(() => nonNegativeIntValidator.parse(5.5)).toThrow()
    })
  })

  describe('usernameValidator', () => {
    it('accepts valid usernames', () => {
      expect(usernameValidator.parse('john_doe')).toBe('john_doe')
      expect(usernameValidator.parse('user-123')).toBe('user-123')
      expect(usernameValidator.parse('alice')).toBe('alice')
    })

    it('normalizes username to lowercase', () => {
      expect(usernameValidator.parse('JOHN_DOE')).toBe('john_doe')
    })

    it('enforces minimum length of 3 characters', () => {
      expect(() => usernameValidator.parse('ab')).toThrow()
    })

    it('enforces maximum length of 30 characters', () => {
      expect(() => usernameValidator.parse('a'.repeat(31))).toThrow()
    })

    it('rejects usernames starting or ending with hyphen/underscore', () => {
      expect(() => usernameValidator.parse('-invalid')).toThrow()
      expect(() => usernameValidator.parse('invalid-')).toThrow()
      expect(() => usernameValidator.parse('_invalid')).toThrow()
      expect(() => usernameValidator.parse('invalid_')).toThrow()
    })

    it('rejects usernames with spaces or special characters', () => {
      expect(() => usernameValidator.parse('john doe')).toThrow()
      expect(() => usernameValidator.parse('john@doe')).toThrow()
    })

    it('trims whitespace from usernames', () => {
      expect(usernameValidator.parse('  john_doe  ')).toBe('john_doe')
    })
  })

  describe('isoDateValidator', () => {
    it('accepts valid ISO 8601 dates', () => {
      expect(isoDateValidator.parse('2026-06-13')).toBe('2026-06-13')
      expect(isoDateValidator.parse('2000-01-01')).toBe('2000-01-01')
    })

    it('rejects invalid dates', () => {
      expect(() => isoDateValidator.parse('2026-13-01')).toThrow() // invalid month
      expect(() => isoDateValidator.parse('2026-02-30')).toThrow() // invalid day
    })

    it('rejects non-ISO date formats', () => {
      expect(() => isoDateValidator.parse('06/13/2026')).toThrow()
      expect(() => isoDateValidator.parse('2026-06-13T10:30:00Z')).toThrow() // includes time
    })

    it('trims whitespace from dates', () => {
      expect(isoDateValidator.parse('  2026-06-13  ')).toBe('2026-06-13')
    })
  })
})
