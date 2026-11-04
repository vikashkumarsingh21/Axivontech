import { Metadata } from "next";
import { getAppReleaseConfig } from "@/features/app-mode/release";
import { DownloadClient } from "./DownloadClient";

export const metadata: Metadata = {
  title: "Download Axivon Mobile App (Official Android APK) | Axivon Technologies",
  description:
    "Download the official Axivon mobile application for Android. Mark attendance, track daily tasks, submit work reports, and manage leave on your phone.",
  alternates: {
    canonical: "https://axivontech.in/download",
  },
};

export const dynamic = "force-dynamic";

export default async function DownloadPage() {
  const config = await getAppReleaseConfig();

  return (
    <DownloadClient
      latestVersion={config.latestVersion}
      sizeMb={config.sizeMb}
      apkUrl="/download/axivon-app"
      notes={config.notes}
    />
  );
}
