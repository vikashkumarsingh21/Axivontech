import { Metadata } from "next";
import { ProjectLibraryDashboard } from "@/components/project-library/ProjectLibraryDashboard";

export const metadata: Metadata = {
  title: "Project Library — Broker & Partner Portal",
  description: "Completed projects reference library for prospective client meetings.",
};

export default function BrokerProjectLibraryPage() {
  return <ProjectLibraryDashboard />;
}
