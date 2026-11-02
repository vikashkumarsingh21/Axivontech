import { Metadata } from "next";
import { AppModeAdminSettings } from "@/features/app-mode/admin/AppModeAdminSettings";

export const metadata: Metadata = {
  title: "Android App Settings | Axivon Admin",
  description: "Configure Axivon mobile app releases, update gates, and download prompt modals.",
};

export default function AdminAppSettingsPage() {
  return <AppModeAdminSettings />;
}
