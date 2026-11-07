"use client";

import { useEffect, useState } from "react";
import {
  X,
  ExternalLink,
  Sparkles,
  Layers,
  CheckCircle,
  Eye,
  Monitor,
  ShieldCheck,
  Calendar,
  Building,
} from "lucide-react";

interface PresentationData {
  id: string;
  slug: string;
  name: string;
  industry: string;
  category: string;
  projectType: string;
  completionYear?: number;
  liveUrl?: string | null;
  demoUrl?: string | null;
  shortDescription: string;
  overview: string;
  solutionDelivered?: string | null;
  features: string[];
  technologies: string[];
  thumbnailUrl?: string | null;
  screenshots: string[];
  highlights: string[];
  presenterGuidance?: string | null;
}

interface ProjectPresentationModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectPresentationModal({
  projectId,
  isOpen,
  onClose,
}: ProjectPresentationModalProps) {
  const [data, setData] = useState<PresentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !projectId) return;
    setLoading(true);
    fetch(`/api/v1/project-library/${projectId}/presentation`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.presentation) {
          setData(json.data.presentation);
          setActiveImage(
            json.data.presentation.thumbnailUrl ||
              json.data.presentation.screenshots?.[0] ||
              null
          );
        }
      })
      .catch((err) => console.error("Failed to load presentation:", err))
      .finally(() => setLoading(false));
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0B0D10]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#101318] rounded-2xl shadow-2xl border border-[#1E2530] overflow-hidden my-8 text-[#F3F5F7]">
        {/* Top Header Banner */}
        <div className="bg-[#0E1116] px-6 py-5 text-[#F3F5F7] flex items-center justify-between border-b border-[#1E2530] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-32 bg-[#D6B779]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#D6B779]/10 border border-[#D6B779]/20 flex items-center justify-center text-[#D6B779]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#D6B779]/15 text-[#D6B779] border border-[#D6B779]/25">
                  Client Presentation Mode
                </span>
                <span className="text-xs text-[#7E8997]">Customer-Safe Showcase</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#F3F5F7] mt-1">
                {data ? data.name : "Loading Project Presentation..."}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#151A21] rounded-xl transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#7E8997]">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[#D6B779] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium">Preparing presentation deck...</p>
          </div>
        ) : !data ? (
          <div className="p-12 text-center text-[#7E8997]">
            <p className="text-sm">Unable to load project presentation.</p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
            {/* Hero / Overview Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Visual Showcase */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0B0D10] border border-[#1E2530] shadow-inner flex items-center justify-center group">
                  {activeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeImage}
                      alt={data.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center p-6 text-[#7E8997]">
                      <Monitor className="w-12 h-12 mx-auto mb-2 text-[#566171]" />
                      <p className="text-xs font-medium">Verified Production Showcase</p>
                    </div>
                  )}
                  {data.liveUrl && (
                    <a
                      href={data.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D6B779] to-[#e8a064] text-[#0B0D10] font-bold rounded-lg text-xs shadow-lg shadow-[#D6B779]/20 transition-all hover:opacity-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Visit Live Website</span>
                    </a>
                  )}
                </div>

                {/* Thumbnails list */}
                {data.screenshots.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {data.screenshots.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          activeImage === img
                            ? "border-[#D6B779] ring-2 ring-[#D6B779]/30"
                            : "border-[#1E2530] opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Project Highlights & Value Delivered */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D6B779]/10 text-[#D6B779] border border-[#D6B779]/20">
                      <Building className="w-3 h-3" />
                      {data.industry}
                    </span>
                    {data.completionYear && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        <Calendar className="w-3 h-3" />
                        Delivered {data.completionYear}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">{data.name}</h3>
                  <p className="text-xs text-[#A7B0BC] font-medium mt-0.5">{data.projectType}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E8997]">Project Overview</h4>
                  <p className="text-sm text-[#A7B0BC] leading-relaxed">{data.shortDescription}</p>
                </div>

                {data.solutionDelivered && (
                  <div className="bg-[#151A21] border border-[#10B981]/25 rounded-xl p-4 space-y-1">
                    <h4 className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      <span>Solution Delivered</span>
                    </h4>
                    <p className="text-xs text-[#A7B0BC] leading-relaxed">{data.solutionDelivered}</p>
                  </div>
                )}

                {/* Key presentation highlights */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E8997]">
                    Client Value & Highlights
                  </h4>
                  <ul className="space-y-2">
                    {data.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[#A7B0BC]">
                        <CheckCircle className="w-4 h-4 text-[#D6B779] flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Features & Technologies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#1E2530]">
              {/* Features */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E8997] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span>Key Delivered Features</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.features.map((feat, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-[#151A21] text-[#F3F5F7] rounded-lg text-xs font-medium border border-[#1E2530]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technologies Highlights */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E8997] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D6B779]" />
                  <span>Technology Highlights</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-[#1B222B] text-[#D6B779] rounded-lg text-xs font-medium border border-[#D6B779]/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Presenter Guidance (Only visible to authenticated presenter) */}
            {data.presenterGuidance && (
              <div className="bg-[#151A21] border border-[#D6B779]/25 rounded-xl p-4 text-xs text-[#A7B0BC] flex items-start gap-3">
                <Eye className="w-4 h-4 text-[#D6B779] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#D6B779]">Presenter Guidance: </span>
                  <span>{data.presenterGuidance}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-[#0E1116] px-6 py-4 border-t border-[#1E2530] flex items-center justify-between">
          <p className="text-xs text-[#7E8997]">
            Axivon Technologies — Commercial Client Presentation Platform
          </p>
          <div className="flex items-center gap-3">
            {data?.liveUrl && (
              <a
                href={data.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D6B779] to-[#e8a064] text-[#0B0D10] font-bold rounded-xl text-xs shadow-md shadow-[#D6B779]/20 transition-all hover:opacity-95"
              >
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Open Live Project</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#151A21] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-[#F3F5F7] border border-[#1E2530] rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
