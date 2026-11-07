import { Metadata } from "next";
import { ProjectLibraryDashboard } from "@/components/project-library/ProjectLibraryDashboard";

export const metadata: Metadata = {
  title: "Project Library — Department Manager Portal",
  description: "Completed projects archive and department deliverables.",
};

export default function ManagerProjectLibraryPage() {
  return <ProjectLibraryDashboard />;
}
