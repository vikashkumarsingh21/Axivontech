import { Metadata } from "next";
import { ProjectLibraryDashboard } from "@/components/project-library/ProjectLibraryDashboard";

export const metadata: Metadata = {
  title: "Project Library — Executive Portal",
  description: "Completed projects archive and executive client showcase.",
};

export default function ExecutiveProjectLibraryPage() {
  return <ProjectLibraryDashboard />;
}
