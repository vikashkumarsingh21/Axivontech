"use client";

import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Building,
  FileText,
  Layers,
  Lock,
  ExternalLink,
  HelpCircle,
  FolderGit2,
} from "lucide-react";

const STANDARD_FEATURES = [
  "Authentication & RBAC",
  "Admin Dashboard",
  "User Management",
  "Payment Integration",
  "Booking & Scheduling",
  "Product & Catalog Management",
  "CRM Pipeline Integration",
  "Business Analytics & BI",
  "Notifications & Alerts",
  "Document Management",
  "Automated Email Workflows",
  "Multi-Cuisine Digital Menu",
  "Real-Time IoT Sensor Telemetry",
  "Autonomous Robotic Controls",
  "Mobile-First Responsive UI",
  "Google Maps GPS Navigation",
];

const STANDARD_INDUSTRIES = [
  "Restaurant / Food & Hospitality",
  "Furniture / Retail / Home Interiors",
  "Information Technology",
  "Smart Environmental Solutions",
  "Agriculture Technology (AgriTech)",
  "Business Consulting & Digital Services",
  "Healthcare & Medical",
  "Education & E-Learning",
  "Real Estate & Construction",
  "Financial Technology (FinTech)",
  "Logistics & Supply Chain",
];

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any | null; // If provided, edit mode
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ProjectFormModalProps) {
  const isEditing = Boolean(initialData?.id);

  const [form, setForm] = useState({
    // Section A: Basic Info
    name: "",
    slug: "",
    clientName: "",
    clientCompany: "",
    industry: "Information Technology",
    category: "Web Development",
    projectType: "Full-Stack Web Application",
    status: "COMPLETED",
    startDate: "",
    completionDate: new Date().toISOString().split("T")[0],
    liveUrl: "",
    demoUrl: "",
    clientPreviewUrl: "",

    // Section B: Overview & Scope
    shortDescription: "",
    overview: "",
    businessRequirement: "",
    problemStatement: "",
    solutionDelivered: "",
    objectives: "",
    scopeOfWork: "",
    deliverables: "",

    // Section C: Development Info
    frontendTech: "React, TypeScript, Tailwind CSS",
    backendTech: "Node.js",
    databaseTech: "PostgreSQL",
    frameworks: "Next.js",
    languages: "TypeScript, JavaScript",
    apisAndIntegrations: "REST API",
    hostingPlatform: "Render / Vercel Cloud",
    devTools: "Git, VS Code",

    // Section D: Features
    features: ["Authentication & RBAC", "Admin Dashboard", "Mobile-First Responsive UI"] as string[],
    newFeatureInput: "",

    // Section E: Media
    thumbnailUrl: "",
    screenshotInput: "",
    websiteScreenshots: [] as string[],

    // Section G: Internal Info
    internalNotes: "",
    assignedTeam: "Core Engineering Team",
    projectOwner: "VIKASH KUMAR",
    developmentDepartment: "Web Development",
    deliveryNotes: "",
    maintenanceInfo: "",
    qualityNotes: "",

    // Section H: Project Completion
    deliveryConfirmation: true,
    reviewStatus: "APPROVED",
    finalApprovedLink: "",
  });

  const [activeSection, setActiveSection] = useState<"A" | "B" | "C" | "D" | "E" | "G" | "H">("A");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        slug: initialData.slug || "",
        clientName: initialData.clientName || "",
        clientCompany: initialData.clientCompany || "",
        industry: initialData.industry || "Information Technology",
        category: initialData.category || "Web Development",
        projectType: initialData.projectType || "Full-Stack Web Application",
        status: initialData.status || "COMPLETED",
        startDate: initialData.startDate ? initialData.startDate.split("T")[0] : "",
        completionDate: initialData.completionDate ? initialData.completionDate.split("T")[0] : "",
        liveUrl: initialData.liveUrl || "",
        demoUrl: initialData.demoUrl || "",
        clientPreviewUrl: initialData.clientPreviewUrl || "",

        shortDescription: initialData.shortDescription || "",
        overview: initialData.overview || "",
        businessRequirement: initialData.businessRequirement || "",
        problemStatement: initialData.problemStatement || "",
        solutionDelivered: initialData.solutionDelivered || "",
        objectives: initialData.objectives || "",
        scopeOfWork: initialData.scopeOfWork || "",
        deliverables: initialData.deliverables || "",

        frontendTech: (initialData.frontendTech || []).join(", "),
        backendTech: (initialData.backendTech || []).join(", "),
        databaseTech: (initialData.databaseTech || []).join(", "),
        frameworks: (initialData.frameworks || []).join(", "),
        languages: (initialData.languages || []).join(", "),
        apisAndIntegrations: (initialData.apisAndIntegrations || []).join(", "),
        hostingPlatform: initialData.hostingPlatform || "",
        devTools: (initialData.devTools || []).join(", "),

        features: initialData.features || [],
        newFeatureInput: "",

        thumbnailUrl: initialData.thumbnailUrl || "",
        screenshotInput: "",
        websiteScreenshots: initialData.websiteScreenshots || [],

        internalNotes: initialData.internalNotes || "",
        assignedTeam: initialData.assignedTeam || "Core Engineering Team",
        projectOwner: initialData.projectOwner || "VIKASH KUMAR",
        developmentDepartment: initialData.developmentDepartment || "Web Development",
        deliveryNotes: initialData.deliveryNotes || "",
        maintenanceInfo: initialData.maintenanceInfo || "",
        qualityNotes: initialData.qualityNotes || "",

        deliveryConfirmation: initialData.isDelivered ?? true,
        reviewStatus: initialData.reviewStatus || "APPROVED",
        finalApprovedLink: initialData.finalApprovedLink || "",
      });
    } else {
      setForm({
        name: "",
        slug: "",
        clientName: "",
        clientCompany: "",
        industry: "Information Technology",
        category: "Web Development",
        projectType: "Full-Stack Web Application",
        status: "COMPLETED",
        startDate: "",
        completionDate: new Date().toISOString().split("T")[0],
        liveUrl: "",
        demoUrl: "",
        clientPreviewUrl: "",

        shortDescription: "",
        overview: "",
        businessRequirement: "",
        problemStatement: "",
        solutionDelivered: "",
        objectives: "",
        scopeOfWork: "",
        deliverables: "",

        frontendTech: "React, TypeScript, Tailwind CSS",
        backendTech: "Node.js",
        databaseTech: "PostgreSQL",
        frameworks: "Next.js",
        languages: "TypeScript, JavaScript",
        apisAndIntegrations: "REST API",
        hostingPlatform: "Render / Vercel Cloud",
        devTools: "Git, VS Code",

        features: [
          "Authentication & RBAC",
          "Admin Dashboard",
          "Mobile-First Responsive UI",
        ],
        newFeatureInput: "",

        thumbnailUrl: "",
        screenshotInput: "",
        websiteScreenshots: [],

        internalNotes: "",
        assignedTeam: "Core Engineering Team",
        projectOwner: "VIKASH KUMAR",
        developmentDepartment: "Web Development",
        deliveryNotes: "",
        maintenanceInfo: "",
        qualityNotes: "",

        deliveryConfirmation: true,
        reviewStatus: "APPROVED",
        finalApprovedLink: "",
      });
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleStandardFeature = (feature: string) => {
    setForm((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== feature)
          : [...prev.features, feature],
      };
    });
  };

  const handleAddCustomFeature = () => {
    if (!form.newFeatureInput.trim()) return;
    const feat = form.newFeatureInput.trim();
    if (!form.features.includes(feat)) {
      setForm((prev) => ({
        ...prev,
        features: [...prev.features, feat],
        newFeatureInput: "",
      }));
    } else {
      setForm((prev) => ({ ...prev, newFeatureInput: "" }));
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isThumbnail: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetType", isThumbnail ? "THUMBNAIL" : "SCREENSHOT");

      const res = await fetch("/api/v1/project-library/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");

      if (isThumbnail) {
        setForm((prev) => ({ ...prev, thumbnailUrl: json.data.url }));
      } else {
        setForm((prev) => ({
          ...prev,
          websiteScreenshots: [...prev.websiteScreenshots, json.data.url],
        }));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload asset");
    } finally {
      setUploading(false);
    }
  };

  const parseCsv = (str: string): string[] => {
    return str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name.trim()) {
      setErrorMsg("Project name is required.");
      setActiveSection("A");
      return;
    }

    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      clientName: form.clientName.trim() || null,
      clientCompany: form.clientCompany.trim() || null,
      industry: form.industry,
      category: form.category,
      projectType: form.projectType,
      status: form.status,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      completionDate: form.completionDate ? new Date(form.completionDate).toISOString() : null,
      liveUrl: form.liveUrl.trim() || null,
      demoUrl: form.demoUrl.trim() || null,
      clientPreviewUrl: form.clientPreviewUrl.trim() || null,

      shortDescription: form.shortDescription.trim() || `${form.name} verified completed project archive.`,
      overview: form.overview.trim() || null,
      businessRequirement: form.businessRequirement.trim() || null,
      problemStatement: form.problemStatement.trim() || null,
      solutionDelivered: form.solutionDelivered.trim() || null,
      objectives: form.objectives.trim() || null,
      scopeOfWork: form.scopeOfWork.trim() || null,
      deliverables: form.deliverables.trim() || null,

      frontendTech: parseCsv(form.frontendTech),
      backendTech: parseCsv(form.backendTech),
      databaseTech: parseCsv(form.databaseTech),
      frameworks: parseCsv(form.frameworks),
      languages: parseCsv(form.languages),
      apisAndIntegrations: parseCsv(form.apisAndIntegrations),
      hostingPlatform: form.hostingPlatform.trim() || null,
      devTools: parseCsv(form.devTools),

      features: form.features,

      thumbnailUrl: form.thumbnailUrl.trim() || null,
      websiteScreenshots: form.websiteScreenshots,

      internalNotes: form.internalNotes.trim() || null,
      assignedTeam: form.assignedTeam.trim() || null,
      projectOwner: form.projectOwner.trim() || null,
      developmentDepartment: form.developmentDepartment.trim() || null,
      deliveryNotes: form.deliveryNotes.trim() || null,
      maintenanceInfo: form.maintenanceInfo.trim() || null,
      qualityNotes: form.qualityNotes.trim() || null,

      deliveryConfirmation: form.deliveryConfirmation,
      reviewStatus: form.reviewStatus,
      finalApprovedLink: form.finalApprovedLink.trim() || form.liveUrl.trim() || null,
    };

    try {
      const endpoint = isEditing
        ? `/api/v1/project-library/${initialData.id}`
        : "/api/v1/project-library";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save project");

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0B0D10]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#101318] rounded-2xl shadow-2xl border border-[#1E2530] overflow-hidden my-8 text-[#F3F5F7]">
        {/* Modal Header */}
        <div className="bg-[#0E1116] px-6 py-5 text-[#F3F5F7] flex items-center justify-between border-b border-[#1E2530]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6B779]/10 border border-[#D6B779]/20 flex items-center justify-center text-[#D6B779]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#F3F5F7]">
                {isEditing ? `Edit: ${initialData.name}` : "Create New Project Record"}
              </h2>
              <p className="text-xs text-[#7E8997]">
                AxivonTech Centralized Project Library Archive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#151A21] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-[#1E2530] px-6 pt-3 gap-2 overflow-x-auto bg-[#0E1116] text-xs font-semibold">
          {[
            { id: "A", label: "A. Basic Info" },
            { id: "B", label: "B. Overview & Scope" },
            { id: "C", label: "C. Tech Stack" },
            { id: "D", label: "D. Features" },
            { id: "E", label: "E. Media" },
            { id: "G", label: "G. Internal Notes" },
            { id: "H", label: "H. Completion" },
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-3 py-2 rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                activeSection === sec.id
                  ? "border-[#D6B779] text-[#D6B779] bg-[#151A21] font-bold"
                  : "border-transparent text-[#7E8997] hover:text-[#A7B0BC]"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
            {/* Section A: Basic Information */}
            {activeSection === "A" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Apex Health Cloud Portal"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Reference Slug / ID
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="e.g. apex-health-portal (auto-generated if empty)"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Client / Company Name
                    </label>
                    <input
                      type="text"
                      value={form.clientCompany}
                      onChange={(e) => setForm({ ...form, clientCompany: e.target.value })}
                      placeholder="e.g. Apex Healthcare Group"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Industry / Sector
                    </label>
                    <select
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all cursor-pointer"
                    >
                      {STANDARD_INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} className="bg-[#10151B] text-[#F3F5F7]">
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Project Category
                    </label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. Website Development"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Project Type
                    </label>
                    <input
                      type="text"
                      value={form.projectType}
                      onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                      placeholder="e.g. Enterprise SaaS Portal"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all cursor-pointer font-semibold"
                    >
                      <option value="COMPLETED" className="bg-[#10151B] text-[#F3F5F7]">COMPLETED</option>
                      <option value="DELIVERED" className="bg-[#10151B] text-[#F3F5F7]">DELIVERED</option>
                      <option value="MAINTENANCE" className="bg-[#10151B] text-[#F3F5F7]">MAINTENANCE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      value={form.completionDate}
                      onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Project Live Website URL
                    </label>
                    <input
                      type="url"
                      value={form.liveUrl}
                      onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section B: Overview & Scope */}
            {activeSection === "B" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                    Short Project Description *
                  </label>
                  <textarea
                    rows={2}
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="Concise summary for executive view and presentation cards..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                    Complete Project Overview
                  </label>
                  <textarea
                    rows={3}
                    value={form.overview}
                    onChange={(e) => setForm({ ...form, overview: e.target.value })}
                    placeholder="Detailed project narrative and operational background..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Problem Statement
                    </label>
                    <textarea
                      rows={2}
                      value={form.problemStatement}
                      onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                      placeholder="The business bottleneck or friction faced by the customer..."
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Solution Delivered
                    </label>
                    <textarea
                      rows={2}
                      value={form.solutionDelivered}
                      onChange={(e) => setForm({ ...form, solutionDelivered: e.target.value })}
                      placeholder="The technological system and capabilities engineered..."
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Scope of Work
                    </label>
                    <textarea
                      rows={2}
                      value={form.scopeOfWork}
                      onChange={(e) => setForm({ ...form, scopeOfWork: e.target.value })}
                      placeholder="Key milestone phases and boundaries..."
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Project Deliverables
                    </label>
                    <textarea
                      rows={2}
                      value={form.deliverables}
                      onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                      placeholder="Handed over code, documentation, and live systems..."
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section C: Development Information */}
            {activeSection === "C" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Frontend Technologies (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.frontendTech}
                      onChange={(e) => setForm({ ...form, frontendTech: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Backend Technologies (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.backendTech}
                      onChange={(e) => setForm({ ...form, backendTech: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Database Technologies
                    </label>
                    <input
                      type="text"
                      value={form.databaseTech}
                      onChange={(e) => setForm({ ...form, databaseTech: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Frameworks & Libraries
                    </label>
                    <input
                      type="text"
                      value={form.frameworks}
                      onChange={(e) => setForm({ ...form, frameworks: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      APIs and Integrations
                    </label>
                    <input
                      type="text"
                      value={form.apisAndIntegrations}
                      onChange={(e) => setForm({ ...form, apisAndIntegrations: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Hosting / Deployment Platform
                    </label>
                    <input
                      type="text"
                      value={form.hostingPlatform}
                      onChange={(e) => setForm({ ...form, hostingPlatform: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section D: Features */}
            {activeSection === "D" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                    Select Standard Delivered Features
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#0E1116] p-4 rounded-xl border border-[#1E2530]">
                    {STANDARD_FEATURES.map((feat) => {
                      const selected = form.features.includes(feat);
                      return (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => toggleStandardFeature(feat)}
                          className={`p-2.5 rounded-lg text-xs font-semibold text-left transition-all border flex items-center justify-between ${
                            selected
                              ? "bg-[#D6B779]/15 text-[#D6B779] border-[#D6B779]/40 shadow-xs"
                              : "bg-[#151A21] text-[#7E8997] border-[#1E2530] hover:text-[#A7B0BC] hover:border-[#29313B]"
                          }`}
                        >
                          <span className="truncate">{feat}</span>
                          {selected && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#D6B779]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                    Add Custom Feature
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.newFeatureInput}
                      onChange={(e) => setForm({ ...form, newFeatureInput: e.target.value })}
                      placeholder="e.g. AI-Powered Dynamic Pricing Engine"
                      className="flex-1 px-3.5 py-2 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFeature}
                      className="px-4 py-2 bg-[#1B222B] hover:bg-[#202833] text-[#F3F5F7] border border-[#1E2530] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#D6B779]" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Selected Features list */}
                {form.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E8997]">
                      Selected Features ({form.features.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {form.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151A21] text-[#D6B779] border border-[#D6B779]/30 rounded-lg text-xs font-medium"
                        >
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => toggleStandardFeature(feat)}
                            className="hover:text-red-400 text-[#7E8997] transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section E: Media */}
            {activeSection === "E" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                    Main Project Thumbnail URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.thumbnailUrl}
                      onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                      placeholder="/assets/images/portfolio/project-thumb.jpg or upload..."
                      className="flex-1 px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                    <label className="px-4 py-2 bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] border border-[#1E2530] rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#D6B779]" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, true)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                    Add Screenshots
                  </label>
                  <label className="block p-6 border-2 border-dashed border-[#1E2530] hover:border-[#D6B779]/40 rounded-xl text-center cursor-pointer bg-[#0E1116] hover:bg-[#151A21]/50 transition-all">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-[#7E8997]" />
                    <p className="text-xs font-bold text-[#F3F5F7]">
                      {uploading ? "Uploading file..." : "Click or drop screenshot image here"}
                    </p>
                    <p className="text-[11px] text-[#7E8997] mt-0.5">JPEG, PNG, WebP up to 15MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                  </label>
                </div>

                {form.websiteScreenshots.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E8997]">
                      Uploaded Screenshots ({form.websiteScreenshots.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {form.websiteScreenshots.map((url, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#1E2530] bg-[#0B0D10]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-24 object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                websiteScreenshots: prev.websiteScreenshots.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section G: Internal Information (RESTRICTED) */}
            {activeSection === "G" && (
              <div className="space-y-4 bg-[#151A21] border border-[#D6B779]/30 p-6 rounded-2xl">
                <div className="flex items-center gap-2 text-[#D6B779] border-b border-[#1E2530] pb-3">
                  <Lock className="w-4 h-4 text-[#D6B779]" />
                  <span className="text-xs font-bold text-[#F3F5F7]">Confidential Internal Metadata (Write-Only)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Project Owner
                    </label>
                    <input
                      type="text"
                      value={form.projectOwner}
                      onChange={(e) => setForm({ ...form, projectOwner: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Assigned Development Department
                    </label>
                    <input
                      type="text"
                      value={form.developmentDepartment}
                      onChange={(e) => setForm({ ...form, developmentDepartment: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                    Internal Delivery Notes
                  </label>
                  <textarea
                    rows={2}
                    value={form.deliveryNotes}
                    onChange={(e) => setForm({ ...form, deliveryNotes: e.target.value })}
                    placeholder="Sign-off notes, deployment coordinates, client feedback..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                    Internal Confidential Notes
                  </label>
                  <textarea
                    rows={2}
                    value={form.internalNotes}
                    onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                    placeholder="Restricted operational notes (never shown to read-only roles)..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Section H: Project Completion */}
            {activeSection === "H" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Review Status
                    </label>
                    <select
                      value={form.reviewStatus}
                      onChange={(e) => setForm({ ...form, reviewStatus: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all cursor-pointer font-semibold"
                    >
                      <option value="APPROVED" className="bg-[#10151B] text-[#F3F5F7]">APPROVED & VERIFIED</option>
                      <option value="PENDING_REVIEW" className="bg-[#10151B] text-[#F3F5F7]">PENDING GOVERNANCE REVIEW</option>
                      <option value="UNDER_AUDIT" className="bg-[#10151B] text-[#F3F5F7]">UNDER AUDIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1.5">
                      Final Approved Project Link
                    </label>
                    <input
                      type="url"
                      value={form.finalApprovedLink}
                      onChange={(e) => setForm({ ...form, finalApprovedLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 text-xs bg-[#10151B] border border-[#1E2530] text-[#F3F5F7] placeholder-[#566171] rounded-xl focus:border-[#D6B779]/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#0E1116] border border-[#1E2530] rounded-xl">
                  <input
                    type="checkbox"
                    id="deliveryConfirmation"
                    checked={form.deliveryConfirmation}
                    onChange={(e) => setForm({ ...form, deliveryConfirmation: e.target.checked })}
                    className="w-4 h-4 accent-[#D6B779] rounded cursor-pointer"
                  />
                  <label htmlFor="deliveryConfirmation" className="text-xs font-bold text-[#F3F5F7] cursor-pointer">
                    Confirm that this project has been fully delivered and verified for client operations.
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Modal Action Footer */}
          <div className="bg-[#0E1116] px-6 py-4 border-t border-[#1E2530] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#151A21] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-[#F3F5F7] border border-[#1E2530] rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D6B779] to-[#e8a064] text-[#0B0D10] font-black rounded-xl text-xs shadow-lg shadow-[#D6B779]/20 hover:opacity-95 disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{submitting ? "Saving..." : isEditing ? "Update Project" : "Save Project"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
