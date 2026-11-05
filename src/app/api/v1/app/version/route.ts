import { NextResponse } from "next/server";
import { getAppReleaseConfig } from "@/features/app-mode/release";

export const dynamic = "force-dynamic";

export async function GET() {
  const releaseInfo = await getAppReleaseConfig();

  return NextResponse.json({
    success: true,
    data: {
      appName: "AxivonTech",
      packageName: "com.axivon.app",
      version: releaseInfo.latestVersion || "1.0.0",
      versionCode: 100,
      releaseDate: releaseInfo.updatedAt ? releaseInfo.updatedAt.slice(0, 10) : "2026-11-05",
      apkUrl: releaseInfo.apkUrl || "/downloads/axivon-app.apk",
      apkSizeBytes: Math.round((releaseInfo.sizeMb || 5.1) * 1024 * 1024),
      sha256: releaseInfo.sha256,
      mandatoryUpdate: false,
      releaseNotes: [
        "Complete enterprise light mobile UI/UX redesign",
        "Role-tailored dashboards for Admin, Executive, Employee, Broker, and Manager",
        "Biometric authentication support with native platform credentials",
        "Offline network awareness and pull-to-refresh synchronization",
        "Hardware back-button lifecycle navigation",
      ],
    },
  });
}
