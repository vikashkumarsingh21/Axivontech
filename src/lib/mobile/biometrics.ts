/**
 * AxivonTech Biometric Authentication Manager
 * Securely supports Android Fingerprint, Face Recognition, and Platform Credentials.
 * Uses W3C WebAuthn standard with platform authenticator attachment.
 * Passwords are NEVER stored.
 */

const BIOMETRIC_KEY = "axivon_biometrics_enabled";
const BIOMETRIC_USER_KEY = "axivon_biometrics_user";

export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function isBiometricsEnrolled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BIOMETRIC_KEY) === "true";
}

export function getEnrolledBiometricUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(BIOMETRIC_USER_KEY);
}

export async function enableBiometrics(userEmail: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const available = await isBiometricsAvailable();
  if (!available) return false;

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Axivon Technologies" },
        user: {
          id: new TextEncoder().encode(userEmail),
          name: userEmail,
          displayName: userEmail.split("@")[0],
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
        },
        timeout: 60000,
      },
    });

    if (credential) {
      localStorage.setItem(BIOMETRIC_KEY, "true");
      localStorage.setItem(BIOMETRIC_USER_KEY, userEmail);
      return true;
    }
    return false;
  } catch (err) {
    console.warn("[Biometrics] Enrollment failed or was cancelled:", err);
    return false;
  }
}

export function disableBiometrics(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BIOMETRIC_KEY);
  localStorage.removeItem(BIOMETRIC_USER_KEY);
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  if (typeof window === "undefined" || !isBiometricsEnrolled()) return false;

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        userVerification: "required",
        timeout: 60000,
      },
    });

    return !!credential;
  } catch (err) {
    console.warn("[Biometrics] Verification failed:", err);
    return false;
  }
}
