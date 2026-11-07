"use client";

import { useEffect, useState } from "react";
import { Building, Calendar, ExternalLink, ShieldCheck, Lock } from "lucide-react";

export function ProjectLoader({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<any | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/project-library/${projectId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProject(json.data.project);
          setCanWrite(Boolean(json.data.canWrite));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-xs font-semibold">Loading verified project record...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="text-sm">Project record not found or inaccessible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            {project.industry}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            {project.name}
          </h2>
        </div>
        {project.status && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {project.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>Project Field / Industry</span>
          </p>
          <p className="text-sm font-bold text-slate-800">{project.industry}</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completion Date</span>
          </p>
          <p className="text-sm font-bold text-slate-800">
            {project.completionDate
              ? new Date(project.completionDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Verified"}
          </p>
        </div>
      </div>

      {project.liveUrl && (
        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
          <p className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Live Website URL</span>
          </p>
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-600 hover:underline break-all"
          >
            {project.liveUrl}
          </a>
        </div>
      )}

      {/* For write users, display full technical summary and overview */}
      {canWrite && project.shortDescription && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Project Overview
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {project.shortDescription}
            </p>
          </div>

          {project.features?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Delivered Features
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.features.map((f: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!canWrite && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <span>
            This record provides verified completion credentials for potential client presentations and proof of delivery. Technical architecture and internal metadata are restricted to authorized engineering personnel.
          </span>
        </div>
      )}
    </div>
  );
}
