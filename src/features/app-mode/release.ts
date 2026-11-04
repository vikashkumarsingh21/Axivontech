import { db } from "@/lib/db";
import { isAppModeEnvEnabled } from "./flags";

export interface AppReleaseConfig {
  enabled: boolean;
  popupEnabled: boolean;
  latestVersion: string;
  minVersion: string;
  apkUrl: string;
  sha256: string;
  sizeMb: number;
  notes: string;
  updatedAt: string;
}

const DEFAULT_RELEASE_CONFIG: AppReleaseConfig = {
  enabled: true,
  popupEnabled: true,
  latestVersion: process.env.APP_LATEST_VERSION || "1.0.0",
  minVersion: process.env.APP_MIN_VERSION || "1.0.0",
  apkUrl: process.env.APP_APK_URL || "/downloads/axivon-app.apk",
  sha256: process.env.APP_APK_SHA256 || "",
  sizeMb: parseFloat(process.env.APP_APK_SIZE_MB || "3.6"),
  notes: process.env.APP_RELEASE_NOTES || "Axivon app: attendance, tasks, leave and reports from your phone.",
  updatedAt: new Date().toISOString(),
};

/**
 * Loads the current mobile app release configuration.
 * Pulls from database OrganizationSetting key 'app.release' with fallback to environment variables.
 */
export async function getAppReleaseConfig(): Promise<AppReleaseConfig> {
  // If master environment kill-switch is off, App Mode is disabled
  const envEnabled = isAppModeEnvEnabled();

  try {
    const [releaseSetting, masterSetting, popupSetting] = await Promise.all([
      db.organizationSetting.findUnique({ where: { key: "app.release" } }),
      db.organizationSetting.findUnique({ where: { key: "app.enabled" } }),
      db.organizationSetting.findUnique({ where: { key: "app.downloadPrompt.enabled" } }),
    ]);

    const releaseData = (releaseSetting?.value as Partial<AppReleaseConfig>) || {};
    // Master toggle is considered enabled unless explicitly set to false
    const isMasterDbDisabled = masterSetting?.value === false || (masterSetting?.value as any)?.enabled === false;
    const isPopupDbDisabled = popupSetting?.value === false || (popupSetting?.value as any)?.enabled === false;

    const isMasterDbEnabled = !isMasterDbDisabled;
    const isPopupDbEnabled = !isPopupDbDisabled;

    return {
      enabled: envEnabled && isMasterDbEnabled,
      popupEnabled: isPopupDbEnabled,
      latestVersion: releaseData.latestVersion || DEFAULT_RELEASE_CONFIG.latestVersion,
      minVersion: releaseData.minVersion || DEFAULT_RELEASE_CONFIG.minVersion,
      apkUrl: releaseData.apkUrl || DEFAULT_RELEASE_CONFIG.apkUrl,
      sha256: releaseData.sha256 || DEFAULT_RELEASE_CONFIG.sha256,
      sizeMb: releaseData.sizeMb || DEFAULT_RELEASE_CONFIG.sizeMb,
      notes: releaseData.notes || DEFAULT_RELEASE_CONFIG.notes,
      updatedAt: releaseSetting?.updatedAt?.toISOString() || DEFAULT_RELEASE_CONFIG.updatedAt,
    };
  } catch (error) {
    // If DB is unreachable or during build, use fallback
    return {
      ...DEFAULT_RELEASE_CONFIG,
      enabled: envEnabled,
    };
  }
}

/**
 * Saves updated mobile app release configuration to OrganizationSetting.
 */
export async function updateAppReleaseConfig(
  updates: Partial<AppReleaseConfig>,
  updatedById?: string
): Promise<AppReleaseConfig> {
  const current = await getAppReleaseConfig();

  // 1. Update app.release key
  const updatedData: Partial<AppReleaseConfig> = {
    latestVersion: updates.latestVersion ?? current.latestVersion,
    minVersion: updates.minVersion ?? current.minVersion,
    apkUrl: updates.apkUrl ?? current.apkUrl,
    sha256: updates.sha256 ?? current.sha256,
    sizeMb: updates.sizeMb ?? current.sizeMb,
    notes: updates.notes ?? current.notes,
  };

  await db.organizationSetting.upsert({
    where: { key: "app.release" },
    update: {
      value: updatedData as any,
      updatedById: updatedById || null,
    },
    create: {
      key: "app.release",
      value: updatedData as any,
      updatedById: updatedById || null,
    },
  });

  // 2. Update master toggle if provided
  if (typeof updates.enabled === "boolean") {
    await db.organizationSetting.upsert({
      where: { key: "app.enabled" },
      update: { value: { enabled: updates.enabled }, updatedById: updatedById || null },
      create: { key: "app.enabled", value: { enabled: updates.enabled }, updatedById: updatedById || null },
    });
  }

  // 3. Update popup toggle if provided
  if (typeof updates.popupEnabled === "boolean") {
    await db.organizationSetting.upsert({
      where: { key: "app.downloadPrompt.enabled" },
      update: { value: { enabled: updates.popupEnabled }, updatedById: updatedById || null },
      create: { key: "app.downloadPrompt.enabled", value: { enabled: updates.popupEnabled }, updatedById: updatedById || null },
    });
  }

  return getAppReleaseConfig();
}
