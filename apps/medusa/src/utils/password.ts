/**
 * Password validation utilities
 */

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (optional but recommended)
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (password.length > 128) {
    errors.push("Password must be no more than 128 characters long")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  // Common weak passwords check
  const commonWeakPasswords = [
    "password",
    "12345678",
    "qwerty123",
    "abc12345",
    "password1",
    "123456789",
    "qwertyui",
  ]
  if (commonWeakPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common, please choose a stronger password")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get a user-friendly password requirements message
 */
export function getPasswordRequirements(): string {
  return "Password must be at least 8 characters and contain uppercase, lowercase, and numbers"
}
