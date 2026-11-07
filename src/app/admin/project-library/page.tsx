import { Metadata } from "next";
import { ProjectLibraryDashboard } from "@/components/project-library/ProjectLibraryDashboard";

export const metadata: Metadata = {
  title: "Project Library — Admin Control Center",
  description: "Centralized completed projects archive and management system.",
};

export default function AdminProjectLibraryPage() {
  return <ProjectLibraryDashboard />;
}
