import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a cryptographically secure, readable password.
 * Default 14 characters, containing uppercase, lowercase, numbers, and safe symbols.
 * Excludes confusing characters (0, O, o, 1, l, I) to prevent partner confusion when manually copying.
 */
export function generateStrongPassword(length = 14): string {
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // No I, O
  const lowers = "abcdefghijkmnpqrstuvwxyz"; // No l, o
  const numbers = "23456789"; // No 0, 1
  const symbols = "!@#$%^&*()_+-=";

  const allChars = uppers + lowers + numbers + symbols;

  // Ensure at least 2 of each class
  const required = [
    uppers[crypto.randomInt(0, uppers.length)],
    uppers[crypto.randomInt(0, uppers.length)],
    lowers[crypto.randomInt(0, lowers.length)],
    lowers[crypto.randomInt(0, lowers.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    symbols[crypto.randomInt(0, symbols.length)],
    symbols[crypto.randomInt(0, symbols.length)],
  ];

  const remainingLength = Math.max(0, length - required.length);
  const remaining = [];
  for (let i = 0; i < remainingLength; i++) {
    remaining.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // Shuffle together cryptographically
  const combined = [...required, ...remaining];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join("");
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length < 10) {
    errors.push("Password must be at least 10 characters long.");
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Must contain at least one uppercase letter (A-Z).");
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Must contain at least one lowercase letter (a-z).");
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Must contain at least one digit (0-9).");
  } else {
    score += 1;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Must contain at least one special character (!@#$%^&* etc.).");
  }

  const isValid = errors.length === 0;
  return { isValid, score, errors };
}
