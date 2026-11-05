import { db } from "@/lib/db";
import { DeviceTokenRecord } from "./types";

const TOKEN_PREFIX = "device_token:";
const USER_TOKENS_PREFIX = "user_device_tokens:";

/**
 * Registers an Android / mobile device token for push notifications.
 * Automatically handles token refresh and updates user association.
 */
export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: "ANDROID" | "IOS" | "WEB" = "ANDROID",
  deviceInfo?: string | null
): Promise<DeviceTokenRecord> {
  const normalizedToken = token.trim();
  const nowIso = new Date().toISOString();

  const record: DeviceTokenRecord = {
    token: normalizedToken,
    userId,
    platform,
    deviceInfo: deviceInfo || null,
    lastActiveAt: nowIso,
    createdAt: nowIso,
  };

  // 1. Store individual token record
  await db.organizationSetting.upsert({
    where: { key: `${TOKEN_PREFIX}${normalizedToken}` },
    create: {
      key: `${TOKEN_PREFIX}${normalizedToken}`,
      value: record as any,
    },
    update: {
      value: {
        ...record,
        lastActiveAt: nowIso,
      } as any,
    },
  });

  // 2. Add to user device tokens collection
  try {
    const userTokensSetting = await db.organizationSetting.findUnique({
      where: { key: `${USER_TOKENS_PREFIX}${userId}` },
    });

    let currentTokens: DeviceTokenRecord[] = [];
    if (userTokensSetting?.value && Array.isArray(userTokensSetting.value)) {
      currentTokens = userTokensSetting.value as unknown as DeviceTokenRecord[];
    }

    // Filter out existing matching token if already present, then prepend latest
    const filtered = currentTokens.filter((t) => t.token !== normalizedToken);
    filtered.unshift(record);

    // Limit to 5 active devices per user to prevent unbounded growth
    const capped = filtered.slice(0, 5);

    await db.organizationSetting.upsert({
      where: { key: `${USER_TOKENS_PREFIX}${userId}` },
      create: {
        key: `${USER_TOKENS_PREFIX}${userId}`,
        value: capped as any,
      },
      update: {
        value: capped as any,
      },
    });
  } catch (err) {
    console.warn(`[PushService] Failed to update user device tokens index for ${userId}`, err);
  }

  return record;
}

/**
 * Unregisters a device token (e.g. upon user logout or revoked token).
 */
export async function unregisterDeviceToken(token: string): Promise<boolean> {
  const normalizedToken = token.trim();
  try {
    // 1. Fetch token record to know the userId
    const tokenRecord = await db.organizationSetting.findUnique({
      where: { key: `${TOKEN_PREFIX}${normalizedToken}` },
    });

    if (tokenRecord?.value) {
      const data = tokenRecord.value as unknown as DeviceTokenRecord;
      const userId = data.userId;

      // 2. Remove from user token list
      if (userId) {
        const userTokensSetting = await db.organizationSetting.findUnique({
          where: { key: `${USER_TOKENS_PREFIX}${userId}` },
        });

        if (userTokensSetting?.value && Array.isArray(userTokensSetting.value)) {
          const currentTokens = userTokensSetting.value as unknown as DeviceTokenRecord[];
          const filtered = currentTokens.filter((t) => t.token !== normalizedToken);

          await db.organizationSetting.update({
            where: { key: `${USER_TOKENS_PREFIX}${userId}` },
            data: { value: filtered as any },
          });
        }
      }
    }

    // 3. Delete the token record
    await db.organizationSetting.deleteMany({
      where: { key: `${TOKEN_PREFIX}${normalizedToken}` },
    });

    return true;
  } catch (err) {
    console.warn(`[PushService] Error unregistering token ${token}`, err);
    return false;
  }
}

/**
 * Retrieves all registered active device tokens for a given user.
 */
export async function getUserDeviceTokens(userId: string): Promise<DeviceTokenRecord[]> {
  try {
    const userTokensSetting = await db.organizationSetting.findUnique({
      where: { key: `${USER_TOKENS_PREFIX}${userId}` },
    });

    if (userTokensSetting?.value && Array.isArray(userTokensSetting.value)) {
      return userTokensSetting.value as unknown as DeviceTokenRecord[];
    }
  } catch (err) {
    console.warn(`[PushService] Failed to fetch device tokens for user ${userId}`, err);
  }
  return [];
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: "normal" | "high";
  link?: string | null;
  category?: string | null;
}

/**
 * Sends a push notification to a list of device tokens via Firebase Cloud Messaging.
 * Never throws an uncaught error. Handles invalid tokens automatically.
 */
export async function sendPushNotification(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<{ sentCount: number; failedCount: number; errors?: string[] }> {
  if (!tokens || tokens.length === 0) {
    return { sentCount: 0, failedCount: 0 };
  }

  const fcmServerKey =
    process.env.FCM_SERVER_KEY ||
    process.env.FIREBASE_SERVER_KEY ||
    process.env.FIREBASE_MESSAGING_KEY;

  const isTestOrDev =
    !fcmServerKey ||
    process.env.NODE_ENV === "test" ||
    process.env.NODE_ENV === "development";

  // Development & Test Mode or Missing Key fallback
  if (isTestOrDev) {
    console.log(
      `[PushService] [${!fcmServerKey ? "SIMULATED_PUSH" : "DEV_PUSH"}] Recipient Devices: ${tokens.length} | Title: "${payload.title}" | Body: "${payload.body}" | Link: ${payload.link || "none"}`
    );
    return {
      sentCount: tokens.length,
      failedCount: 0,
    };
  }

  // Live FCM Dispatch via Legacy FCM endpoint or Cloud Function
  let sentCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  try {
    for (const token of tokens) {
      try {
        const response = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${fcmServerKey}`,
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title: payload.title,
              body: payload.body,
              sound: "default",
              android_channel_id: "axivon_enterprise_alerts",
            },
            data: {
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              link: payload.link || "/app",
              category: payload.category || "GENERAL",
              ...(payload.data || {}),
            },
            priority: payload.priority === "high" ? "high" : "normal",
          }),
        });

        const resData = await response.json();
        if (response.ok && resData.success >= 1) {
          sentCount++;
        } else {
          failedCount++;
          const errCode = resData.results?.[0]?.error || "FCM_DISPATCH_FAILED";
          errors.push(errCode);

          // If token is invalid or unregistered, clean it up immediately
          if (errCode === "NotRegistered" || errCode === "InvalidRegistration") {
            await unregisterDeviceToken(token);
          }
        }
      } catch (err: any) {
        failedCount++;
        errors.push(err.message || "Network error sending push");
      }
    }
  } catch (err: any) {
    console.error("[PushService] Critical error in FCM dispatch batch", err);
    errors.push(err.message || "Batch dispatch error");
  }

  return { sentCount, failedCount, errors: errors.length > 0 ? errors : undefined };
}
