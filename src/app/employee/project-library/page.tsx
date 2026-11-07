import { Metadata } from "next";
import { ProjectLibraryDashboard } from "@/components/project-library/ProjectLibraryDashboard";

export const metadata: Metadata = {
  title: "Project Library — Employee Portal",
  description: "Company completed projects directory and delivery archive.",
};

export default function EmployeeProjectLibraryPage() {
  return <ProjectLibraryDashboard />;
}
