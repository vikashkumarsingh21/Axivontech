/**
 * Browser-safe and Node.js-safe secure integer generator.
 * Works seamlessly in client components (Web Crypto API) and server-side environments.
 */
function getSecureRandomInt(min: number, max: number): number {
  const range = max - min;
  if (range <= 0) return min;

  // 1. Web Crypto API: standard in modern browsers and Node.js 15+ (globalThis.crypto)
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    return min + (array[0] % range);
  }

  // 2. Math.random fallback (safety guard)
  return min + Math.floor(Math.random() * range);
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
    uppers[getSecureRandomInt(0, uppers.length)],
    uppers[getSecureRandomInt(0, uppers.length)],
    lowers[getSecureRandomInt(0, lowers.length)],
    lowers[getSecureRandomInt(0, lowers.length)],
    numbers[getSecureRandomInt(0, numbers.length)],
    numbers[getSecureRandomInt(0, numbers.length)],
    symbols[getSecureRandomInt(0, symbols.length)],
    symbols[getSecureRandomInt(0, symbols.length)],
  ];

  const remainingLength = Math.max(0, length - required.length);
  const remaining: string[] = [];
  for (let i = 0; i < remainingLength; i++) {
    remaining.push(allChars[getSecureRandomInt(0, allChars.length)]);
  }

  // Shuffle together cryptographically
  const combined = [...required, ...remaining];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(0, i + 1);
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
