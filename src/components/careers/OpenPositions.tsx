"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  X,
  CheckCircle2,
  Filter,
  Eye,
  Send,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface OpenPositionsProps {
  initialJobs?: any[];
}

export default function OpenPositions({ initialJobs }: OpenPositionsProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [activeJobModal, setActiveJobModal] = useState<any | null>(null);

  // Normalize jobs list strictly from authentic database records (no mock fallbacks)
  const rawJobs = initialJobs || [];
  const jobsList = useMemo(() => {
    return rawJobs.map((j: any) => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      department: j.department,
      type: j.type || j.employmentType || "Internship",
      workMode: j.workMode || j.workArrangement || "Remote",
      location: j.location || "Remote (India)",
      experience: j.experience || j.experienceLevel || "0–1 Years",
      shortDescription: j.shortDescription || j.summary || "",
      roleOverview: j.roleOverview || j.description || j.summary || "",
      responsibilities: j.responsibilities || [],
      qualifications: j.qualifications || [],
      skills: j.skills || [],
      stipend: j.stipend,
      deadline: j.deadline,
      isFeatured: Boolean(j.isFeatured),
    }));
  }, [rawJobs]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeJobModal) {
        setActiveJobModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeJobModal]);

  const departments = useMemo(() => {
    const depts = new Set<string>();
    jobsList.forEach((j) => depts.add(j.department));
    return ["All", ...Array.from(depts)];
  }, [jobsList]);

  const filteredJobs = useMemo(() => {
    return jobsList.filter((job) => {
      const matchesDept = selectedDept === "All" || job.department === selectedDept;
      const matchesSearch =
        !debouncedQuery ||
        job.title.toLowerCase().includes(debouncedQuery) ||
        job.department.toLowerCase().includes(debouncedQuery) ||
        job.skills.some((s: string) => s.toLowerCase().includes(debouncedQuery)) ||
        job.shortDescription.toLowerCase().includes(debouncedQuery);

      return matchesDept && matchesSearch;
    });
  }, [jobsList, selectedDept, debouncedQuery]);

  const handleApplyClick = (jobTitle: string) => {
    setActiveJobModal(null);
    // Find select element in application form and update value
    const selectEl = document.getElementById("position-select") as HTMLSelectElement | null;
    if (selectEl) {
      selectEl.value = jobTitle;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const formSection = document.getElementById("apply-form");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const hasActiveFilters = searchQuery.length > 0 || selectedDept !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedDept("All");
  };

  return (
    <section id="open-positions" className="py-16 sm:py-24 bg-[#0B0D10] border-b border-[#1E2530]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold uppercase tracking-wider mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opportunities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F3F5F7] tracking-tight mb-3">
            Open Positions
          </h2>
          <p className="text-sm sm:text-base text-[#A7B0BC] leading-relaxed font-light">
            Explore our current internship and early-career opportunities. We evaluate applicants on practical problem-solving ability, curiosity, and drive.
          </p>
        </div>

        {rawJobs.length === 0 ? (
          <div className="text-center py-16 px-6 sm:px-12 rounded-2xl bg-[#151A21] border border-[#29313B] max-w-2xl mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-heading font-bold text-[#F3F5F7] mb-2">No Open Positions Currently Available</h3>
            <p className="text-sm text-[#A7B0BC] leading-relaxed mb-6">
              We are not actively recruiting for specific roles right now, but we are always eager to connect with driven software engineers, AI researchers, and designers. Feel free to submit a speculative profile below.
            </p>
            <a
              href="#apply-form"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04130E] font-heading font-semibold text-sm transition-colors"
            >
              <span>Submit General Application</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <>
            {/* Search & Filter Toolbar */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-4 sm:p-5 mb-8">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#566171]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, skill, or keyword (e.g. Next.js, Python, Figma)..."
                    aria-label="Search job positions"
                    className="w-full h-11 pl-10 pr-9 bg-[#10151B] border border-[#29313B] rounded-xl text-sm text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7E8997] hover:text-[#F3F5F7]"
                      aria-label="Clear search text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Department Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {departments.map((dept) => {
                    const isSelected = selectedDept === dept;
                    return (
                      <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                          isSelected
                            ? "bg-[#10B981] text-[#04130E] font-semibold"
                            : "bg-[#10151B] text-[#A7B0BC] hover:text-[#F3F5F7] border border-[#29313B] hover:bg-[#1B222B]"
                        }`}
                      >
                        {dept === "All" ? "All Departments" : dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Status Bar */}
              <div className="flex items-center justify-between text-xs text-[#7E8997] mt-4 pt-3 border-t border-[#1E2530]">
                <span>
                  Showing <strong className="text-[#F3F5F7]">{filteredJobs.length}</strong> of {rawJobs.length} positions
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[#10B981] hover:underline flex items-center gap-1 font-medium"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            {/* Positions Grid or Empty Filter Result */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-[#151A21] border border-dashed border-[#29313B]">
                <div className="w-12 h-12 rounded-xl bg-[#1B222B] text-[#7E8997] flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#F3F5F7] mb-1">No matching positions found</h3>
                <p className="text-xs sm:text-sm text-[#7E8997] max-w-md mx-auto mb-5">
                  We couldn&apos;t find any roles matching your current search criteria. Try clearing your filters or check back later.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-[#10B981] text-[#04130E] text-xs font-semibold hover:bg-[#059669] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl bg-[#151A21] border border-[#29313B] p-6 hover:border-[#10B981]/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3.5">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                      {job.type}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#1B222B] text-[#A7B0BC] border border-[#29313B]">
                      {job.workMode}
                    </span>
                    <span className="text-[11px] text-[#7E8997] ml-auto">
                      {job.experience}
                    </span>
                  </div>

                  {/* Title & Department */}
                  <h3 className="text-lg font-bold text-[#F3F5F7] group-hover:text-[#10B981] transition-colors mb-1.5">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#7E8997] mb-3">
                    <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{job.department}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-[#7E8997]" />
                    <span>{job.location}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed font-light mb-5 line-clamp-3">
                    {job.shortDescription}
                  </p>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.skills.slice(0, 4).map((skill: string) => (
                      <span
                        key={skill}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10151B] text-[#7E8997] border border-[#29313B]"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="text-[11px] text-[#7E8997] px-1 py-0.5">
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#1E2530] flex items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveJobModal(job)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A7B0BC] hover:text-[#F3F5F7] transition-colors py-1.5 px-2 rounded-lg hover:bg-[#1B222B]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => handleApplyClick(job.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#04130E] bg-[#10B981] hover:bg-[#059669] transition-colors py-2 px-3.5 rounded-lg shadow-sm"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Role Details Modal */}
      {activeJobModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-job-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveJobModal(null);
          }}
        >
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1E2530] flex items-start justify-between gap-4 sticky top-0 bg-[#151A21] z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    {activeJobModal.type}
                  </span>
                  <span className="text-xs text-[#7E8997]">{activeJobModal.workMode}</span>
                  <span className="text-xs text-[#7E8997]">• {activeJobModal.experience}</span>
                </div>
                <h3 id="modal-job-title" className="text-xl sm:text-2xl font-bold text-[#F3F5F7]">
                  {activeJobModal.title}
                </h3>
                <p className="text-xs text-[#7E8997] mt-1">{activeJobModal.department} • {activeJobModal.location}</p>
              </div>
              <button
                onClick={() => setActiveJobModal(null)}
                className="p-1.5 rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-sm text-[#A7B0BC]">
              {/* Overview */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#10B981] mb-2">Role Overview</h4>
                <p className="leading-relaxed font-light">{activeJobModal.roleOverview}</p>
              </div>

              {/* Responsibilities */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#10B981] mb-2.5">Key Responsibilities</h4>
                <ul className="space-y-2">
                  {activeJobModal.responsibilities.map((resp: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <span className="font-light">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Qualifications */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#10B981] mb-2.5">Qualifications & Requirements</h4>
                <ul className="space-y-2">
                  {activeJobModal.qualifications.map((qual: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#D6B779] shrink-0 mt-0.5" />
                      <span className="font-light">{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#10B981] mb-2">Relevant Technologies & Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {activeJobModal.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded bg-[#10151B] text-xs font-mono text-[#F3F5F7] border border-[#29313B]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#1E2530] flex items-center justify-end gap-3 sticky bottom-0 bg-[#151A21]">
              <button
                onClick={() => setActiveJobModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#A7B0BC] hover:text-[#F3F5F7] hover:bg-[#1B222B] transition-colors"
              >
                Close
              </button>
              {activeJobModal.slug && (
                <Link
                  href={`/careers/${activeJobModal.slug}`}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#A7B0BC] hover:text-[#F3F5F7] hover:bg-[#1B222B] transition-colors flex items-center gap-1.5"
                >
                  <span>Full Role Page</span>
                  <span className="text-[10px]">↗</span>
                </Link>
              )}
              <button
                onClick={() => handleApplyClick(activeJobModal.title)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#04130E] font-semibold text-xs transition-colors shadow-sm"
              >
                <span>Apply for this Role</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
