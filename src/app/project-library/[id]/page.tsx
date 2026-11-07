import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building, ExternalLink, Calendar, Lock } from "lucide-react";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Project Record — AxivonTech Project Library",
  description: "Verified completed project record.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SingleProjectLibraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reqHeaders = await headers();
  const host = reqHeaders.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/project-library"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Library</span>
          </Link>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Archived Project Record
          </span>
        </div>

        <DirectProjectViewer projectId={id} />
      </div>
    </div>
  );
}

function DirectProjectViewer({ projectId }: { projectId: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <ProjectLoader projectId={projectId} />
    </div>
  );
}

import { ProjectLoader } from "./ProjectLoader";
