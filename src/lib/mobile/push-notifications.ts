/**
 * Axivon Technologies — Android & Mobile Push Notification Client Integration
 *
 * Handles Capacitor Push Notifications:
 * - Permission requests
 * - FCM device token registration with backend
 * - Foreground notification handling
 * - Tap action deep-linking navigation
 * - Device token unregistration on sign-out
 */

export interface MobileNotificationPayload {
  title?: string;
  body?: string;
  data?: {
    link?: string;
    category?: string;
    priority?: string;
    entityType?: string;
    entityId?: string;
    [key: string]: any;
  };
}

let isInitialized = false;

/**
 * Checks if the current environment is running inside Capacitor Native App.
 */
export function isNativeMobilePlatform(): boolean {
  if (typeof window === "undefined") return false;
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
  const isAndroidUA = /AxivonMobileApp|Android.*Version\/[0-9]/i.test(navigator.userAgent);
  return isCapacitor || isAndroidUA;
}

/**
 * Registers device token with AxivonTech backend.
 */
export async function syncDeviceTokenWithBackend(
  token: string,
  platform: "ANDROID" | "IOS" | "WEB" = "ANDROID"
): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/notifications/device-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        platform,
        deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : null,
      }),
    });

    const data = await res.json();
    if (data.success) {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("axivon_fcm_token", token);
      }
      return true;
    }
  } catch (err) {
    console.warn("[MobilePush] Failed to register device token with backend:", err);
  }
  return false;
}

/**
 * Unregisters the device token with the backend upon sign out.
 */
export async function unregisterMobilePushToken(): Promise<void> {
  if (typeof localStorage === "undefined") return;
  const token = localStorage.getItem("axivon_fcm_token");
  if (!token) return;

  try {
    await fetch("/api/v1/notifications/device-token", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    localStorage.removeItem("axivon_fcm_token");
  } catch (err) {
    console.warn("[MobilePush] Failed to unregister device token on logout:", err);
  }
}

/**
 * Initializes Capacitor push notifications and registers listeners.
 */
export async function initMobilePushNotifications(
  onNavigate?: (path: string) => void
): Promise<void> {
  if (typeof window === "undefined" || isInitialized) return;

  const Capacitor = (window as any).Capacitor;
  const PushNotifications = Capacitor?.Plugins?.PushNotifications;

  if (!PushNotifications) {
    // Not running in Capacitor native push environment
    return;
  }

  isInitialized = true;

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      console.info("[MobilePush] User did not grant push notification permissions.");
      return;
    }

    // Register with Apple / Google Push Service
    await PushNotifications.register();

    // 1. On successful registration
    PushNotifications.addListener("registration", async (token: { value: string }) => {
      console.info("[MobilePush] Device registered for push notifications:", token.value);
      await syncDeviceTokenWithBackend(token.value, "ANDROID");
    });

    // 2. On registration error
    PushNotifications.addListener("registrationError", (error: any) => {
      console.warn("[MobilePush] Push registration error:", error);
    });

    // 3. Foreground push notification received
    PushNotifications.addListener("pushNotificationReceived", (notification: MobileNotificationPayload) => {
      console.info("[MobilePush] Notification received in foreground:", notification);
      // Dispatch custom DOM event so in-app toasts/badges can update instantly
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("axivon:push-notification", { detail: notification })
        );
      }
    });

    // 4. Action performed (User tapped notification in notification tray)
    PushNotifications.addListener("pushNotificationActionPerformed", (action: any) => {
      console.info("[MobilePush] Notification tapped by user:", action);
      const notification = action.notification as MobileNotificationPayload;
      const targetLink = notification.data?.link;

      if (targetLink && typeof targetLink === "string") {
        if (onNavigate) {
          onNavigate(targetLink);
        } else if (typeof window !== "undefined") {
          window.location.href = targetLink;
        }
      }
    });
  } catch (err) {
    console.warn("[MobilePush] Failed to initialize push notifications:", err);
  }
}
