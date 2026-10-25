"use client";

import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Briefcase,
  FileText,
  CreditCard,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Check,
  Copy,
  Calendar,
  Layers,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  X,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerStatusBadge } from "@/components/broker/BrokerStatusBadge";
import { BrokerSkeletonDetail } from "@/components/broker/BrokerSkeleton";
import { formatCurrencyINR, formatDateIN } from "@/components/broker/BrokerFormatters";

interface ProjectDetail {
  id: string;
  projectCode: string;
  projectName: string;
  requiredService: string;
  detailedRequirement: string;
  expectedTimeline: string;
  projectBudget: string;
  additionalRequirements?: string | null;
  status: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  // Client & Company
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientWhatsapp?: string | null;
  clientDesignation?: string | null;
  companyName: string;
  industry: string;
  city: string;
  state: string;
  country: string;
  website?: string | null;
  // Contract
  contract?: {
    id: string;
    status: string;
    contractFileUrl?: string | null;
    versions?: Array<{
      id: string;
      versionNumber: number;
      status: string;
      contractFileUrl?: string | null;
      signedFileUrl?: string | null;
      sentAt?: string | null;
      signedAt?: string | null;
    }>;
  } | null;
  // Payment
  payment?: {
    id: string;
    projectPrice: number;
    advancePercentage: number;
    advanceAmount: number;
    remainingAmount: number;
    currency: string;
    paymentMethod?: string | null;
    amountPaid?: number | null;
    transactionId?: string | null;
    proofFileUrl?: string | null;
    status: string;
    submittedAt?: string | null;
    verifiedAt?: string | null;
    rejectionReason?: string | null;
  } | null;
  // Commission
  commission?: {
    id: string;
    projectValue: number;
    commissionType: string;
    commissionRate: number;
    commissionAmount: number;
    status: string;
    paidAt?: string | null;
    payoutReference?: string | null;
  } | null;
  // Milestones
  milestones?: Array<{
    id: string;
    title: string;
    description?: string | null;
    status: string;
    targetDate?: string | null;
    completionDate?: string | null;
    order: number;
  }>;
  // Documents
  documents?: Array<{
    id: string;
    title: string;
    category: string;
    fileUrl: string;
    createdAt: string;
  }>;
}

export default function BrokerProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "milestones" | "contract" | "payment">("overview");

  // Contract Upload Modal
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [signedFileUrl, setSignedFileUrl] = useState("");
  const [signingConfirmed, setSigningConfirmed] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);

  // Payment Submit Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"BANK" | "UPI">("BANK");
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [proofFileUrl, setProofFileUrl] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Cancel Project Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!projectId || projectId === "new") {
      router.replace("/broker/projects/new");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/broker/projects/${projectId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to fetch project details.");
      }
      setProject(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Handle Secure Contract Download
  const handleDownloadContract = async () => {
    if (!project?.contract) return;
    try {
      const res = await fetch(`/api/v1/broker/contracts/${project.contract.id}/download`);
      const json = await res.json();
      if (res.ok && json.data?.fileUrl) {
        window.open(json.data.fileUrl, "_blank");
      } else {
        toast.warning("Contract document not yet uploaded by Axivon Legal.");
      }
      fetchProject();
    } catch (e) {
      console.error("Contract download error", e);
    }
  };

  // Submit Signed Contract
  const handleUploadContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.contract) return;
    if (!signedFileUrl.trim()) {
      toast.warning("Please enter the URL or path to the signed PDF document.");
      return;
    }
    if (!signingConfirmed) {
      toast.warning("Please confirm the document was duly executed.");
      return;
    }

    try {
      setUploadingContract(true);
      const res = await fetch(`/api/v1/broker/contracts/${project.contract.id}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedFileUrl: signedFileUrl.trim(),
          signingConfirmed: true,
          notes: "Uploaded by partner via portal",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to upload contract");
      }

      setIsContractModalOpen(false);
      setSignedFileUrl("");
      setSigningConfirmed(false);
      fetchProject();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingContract(false);
    }
  };

  // Submit Payment Proof
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.payment) return;
    if (!amountPaid || !transactionId.trim()) {
      toast.warning("Please specify the amount and UTR / Transaction Reference ID.");
      return;
    }

    try {
      setSubmittingPayment(true);
      const res = await fetch(`/api/v1/broker/payments/${project.payment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          amountPaid: Number(amountPaid.replace(/[^0-9.]/g, "")),
          transactionId: transactionId.trim(),
          proofFileUrl: proofFileUrl.trim() || undefined,
          additionalNotes: additionalNotes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to submit payment proof");
      }

      setIsPaymentModalOpen(false);
      setAmountPaid("");
      setTransactionId("");
      fetchProject();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Cancel Project
  const handleCancelProject = async () => {
    if (!project) return;
    try {
      setCancelling(true);
      const res = await fetch(`/api/v1/broker/projects/${project.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: cancelReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to cancel project");
      }
      setIsCancelModalOpen(false);
      fetchProject();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <BrokerSkeletonDetail />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#E6E8EB]">Unable to Load Project</h2>
        <p className="text-xs text-[#8B94A1]">{error || "Project was not found or access is unauthorized."}</p>
        <Link href="/broker/projects">
          <BrokerButton variant="secondary" size="sm">
            Back to Projects
          </BrokerButton>
        </Link>
      </div>
    );
  }

  const canCancel = project.status === "PROJECT_REQUESTED" || project.status === "PENDING_REVIEW";

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Page Header */}
      <BrokerPageHeader
        title={project.projectName}
        subtitle={`${project.clientName} (${project.companyName})`}
        backHref="/broker/projects"
        badge={<BrokerStatusBadge status={project.status} category="project" />}
        actions={
          <div className="flex items-center gap-2">
            {canCancel && (
              <BrokerButton
                variant="ghost"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              >
                Cancel Referral
              </BrokerButton>
            )}
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#171A1F] border border-[#22262D] text-[#C2A878]">
              {project.projectCode}
            </span>
          </div>
        }
      />

      {/* Rejection Alert */}
      {project.status === "REJECTED" && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Referral Rejected</span>
          </div>
          <p className="text-[#D0D4DC] leading-relaxed">
            {project.rejectionReason ||
              "This project submission was not accepted during technical or compliance feasibility review."}
          </p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#1E232B] pb-px">
        {[
          { key: "overview", label: "Overview & Commercials", icon: Briefcase },
          { key: "milestones", label: "Milestones & Delivery", icon: Layers },
          { key: "contract", label: "Contract & SLA", icon: FileText },
          { key: "payment", label: "Payments & Invoices", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                isActive
                  ? "border-[#C2A878] text-[#C2A878] bg-[#171A1F]/30"
                  : "border-transparent text-[#8B94A1] hover:text-[#E6E8EB] hover:border-[#2C313A]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Client & Project Scope */}
          <div className="lg:col-span-8 space-y-6">
            <BrokerCard title="Project Technical Scope" subtitle={project.requiredService}>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#8B94A1] block mb-1">Requirement Statement:</span>
                  <p className="text-[#D0D4DC] bg-[#0E1013] p-3 rounded-lg border border-[#22262D] leading-relaxed whitespace-pre-line">
                    {project.detailedRequirement}
                  </p>
                </div>

                {project.additionalRequirements && (
                  <div>
                    <span className="text-[#8B94A1] block mb-1">Additional Specifications:</span>
                    <p className="text-[#D0D4DC] bg-[#0E1013] p-3 rounded-lg border border-[#22262D] leading-relaxed">
                      {project.additionalRequirements}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[#171A1F] border border-[#22262D]">
                    <span className="text-[#8B94A1] text-[11px] block">Expected Timeline</span>
                    <span className="text-[#E6E8EB] font-semibold mt-1 block">{project.expectedTimeline}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#171A1F] border border-[#22262D]">
                    <span className="text-[#8B94A1] text-[11px] block">Proposed Budget</span>
                    <span className="font-mono text-emerald-400 font-bold mt-1 block">
                      {formatCurrencyINR(Number(project.projectBudget.replace(/[^0-9]/g, "")) || 0)}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#171A1F] border border-[#22262D]">
                    <span className="text-[#8B94A1] text-[11px] block">Submission Date</span>
                    <span className="text-[#E6E8EB] font-semibold mt-1 block">
                      {formatDateIN(project.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </BrokerCard>

            <BrokerCard title="Client Enterprise Details" subtitle={project.companyName}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8B94A1] block">Primary Contact:</span>
                  <span className="text-[#E6E8EB] font-semibold mt-0.5 block">{project.clientName}</span>
                  {project.clientDesignation && (
                    <span className="text-[11px] text-[#566171]">{project.clientDesignation}</span>
                  )}
                </div>

                <div>
                  <span className="text-[#8B94A1] block">Email:</span>
                  <a href={`mailto:${project.clientEmail}`} className="text-[#C2A878] hover:underline font-mono">
                    {project.clientEmail}
                  </a>
                </div>

                <div>
                  <span className="text-[#8B94A1] block">Phone:</span>
                  <a href={`tel:${project.clientPhone}`} className="text-[#E6E8EB] hover:underline">
                    {project.clientPhone}
                  </a>
                </div>

                <div>
                  <span className="text-[#8B94A1] block">Location:</span>
                  <span className="text-[#E6E8EB]">
                    {project.city}, {project.state}, {project.country}
                  </span>
                </div>

                {project.website && (
                  <div className="sm:col-span-2">
                    <span className="text-[#8B94A1] block">Website:</span>
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C2A878] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{project.website}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </BrokerCard>
          </div>

          {/* Right: Partner Commission & Commercial Card */}
          <div className="lg:col-span-4 space-y-6">
            <BrokerCard title="Partner Commission Ledger" subtitle="10% Referral Tier">
              <div className="space-y-4 text-xs">
                {project.commission ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#0E1013] border border-[#22262D] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#8B94A1]">Project Valuation:</span>
                        <span className="font-mono font-semibold text-[#E6E8EB]">
                          {formatCurrencyINR(project.commission.projectValue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B94A1]">Commission Rate:</span>
                        <span className="font-mono text-[#C2A878] font-bold">
                          {project.commission.commissionRate}%
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[#1E232B] pt-2">
                        <span className="text-[#8B94A1]">Gross Commission:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {formatCurrencyINR(project.commission.commissionAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#171A1F] border border-[#22262D]">
                      <span className="text-[#8B94A1]">Payout Status:</span>
                      <BrokerStatusBadge status={project.commission.status} category="commission" />
                    </div>

                    {project.commission.paidAt && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                        Settled on {formatDateIN(project.commission.paidAt)}.
                        {project.commission.payoutReference && (
                          <span className="block font-mono text-[11px] mt-0.5">
                            Ref: {project.commission.payoutReference}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D] space-y-2 text-center">
                    <span className="text-xs text-[#8B94A1] block">
                      Commission accrual unlocks upon contract signing and advance milestone settlement.
                    </span>
                    <span className="font-mono text-sm font-bold text-[#C2A878] block">
                      Est. 10% ({formatCurrencyINR(Math.round(Number(project.projectBudget.replace(/[^0-9]/g, "")) * 0.1 || 0))})
                    </span>
                  </div>
                )}
              </div>
            </BrokerCard>

            <div className="p-4 rounded-xl border border-[#22262D] bg-[#0E1013] text-xs text-[#8B94A1] space-y-2">
              <div className="flex items-center gap-2 text-[#E6E8EB] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#C2A878]" />
                <span>Broker Protection Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Client contract is protected under Axivon Non-Circumvention Policy. Commissions are disbursed
                within 48 hours of cleared client invoice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES */}
      {activeTab === "milestones" && (
        <BrokerCard title="Project Milestones & Delivery Schedule" subtitle="Deliverable progression pipeline">
          {project.milestones && project.milestones.length > 0 ? (
            <div className="space-y-4">
              {project.milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-[#171A1F] border border-[#22262D] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#C2A878]/15 text-[#C2A878] flex items-center justify-center font-mono text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-[#E6E8EB]">{m.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0E1013] border border-[#22262D] text-[#8B94A1]">
                        {m.status}
                      </span>
                    </div>
                    {m.description && <p className="text-xs text-[#8B94A1] pl-7">{m.description}</p>}
                  </div>

                  <div className="text-xs text-[#8B94A1] sm:text-right pl-7 sm:pl-0 shrink-0">
                    {m.targetDate && <div>Target: {formatDateIN(m.targetDate)}</div>}
                    {m.completionDate && (
                      <div className="text-emerald-400 font-medium">
                        Completed: {formatDateIN(m.completionDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#8B94A1] space-y-2">
              <Clock className="w-8 h-8 text-[#566171] mx-auto" />
              <p>Milestone schedule will be published following contract execution and sprint planning.</p>
            </div>
          )}
        </BrokerCard>
      )}

      {/* TAB 3: CONTRACT */}
      {activeTab === "contract" && (
        <BrokerCard title="Commercial Contract & Legal Instruments" subtitle="Master Client Service Agreement">
          {project.contract ? (
            <div className="space-y-6 text-xs">
              <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BrokerStatusBadge status={project.contract.status} category="contract" />
                    <span className="font-mono text-[#8B94A1]">
                      Version {project.contract.versions?.[0]?.versionNumber || 1}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#E6E8EB] mt-1">
                    Axivon Client Engineering & Service Agreement
                  </h4>
                </div>

                <div className="flex items-center gap-2.5">
                  <BrokerButton
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadContract}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download Agreement PDF
                  </BrokerButton>

                  {project.contract.status !== "CONTRACT_SIGNED" && (
                    <BrokerButton
                      variant="primary"
                      size="sm"
                      onClick={() => setIsContractModalOpen(true)}
                      icon={<Upload className="w-3.5 h-3.5" />}
                    >
                      Upload Signed Copy
                    </BrokerButton>
                  )}
                </div>
              </div>

              {/* Version History Table */}
              {project.contract.versions && project.contract.versions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#8B94A1] mb-2 uppercase tracking-wider">
                    Contract Audit History
                  </h4>
                  <div className="border border-[#22262D] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0E1013] border-b border-[#1E232B] text-[#8B94A1]">
                        <tr>
                          <th className="px-4 py-2.5">Version</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Dispatched</th>
                          <th className="px-4 py-2.5">Executed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E232B] text-[#D0D4DC]">
                        {project.contract.versions.map((ver) => (
                          <tr key={ver.id}>
                            <td className="px-4 py-2.5 font-mono">v{ver.versionNumber}.0</td>
                            <td className="px-4 py-2.5">
                              <BrokerStatusBadge status={ver.status} category="contract" />
                            </td>
                            <td className="px-4 py-2.5 text-[#8B94A1]">
                              {ver.sentAt ? formatDateIN(ver.sentAt) : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-[#8B94A1]">
                              {ver.signedAt ? formatDateIN(ver.signedAt) : "Pending"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#8B94A1] space-y-2">
              <FileText className="w-8 h-8 text-[#566171] mx-auto" />
              <p>Contract drafting in progress. Axivon Legal will attach agreement once requirements are finalized.</p>
            </div>
          )}
        </BrokerCard>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === "payment" && (
        <BrokerCard title="Milestone Payments & Advance Settlement" subtitle="Client invoice and settlement tracking">
          {project.payment ? (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D]">
                  <span className="text-[#8B94A1] block">Contract Total Price</span>
                  <span className="font-mono text-base font-bold text-[#E6E8EB] mt-1 block">
                    {formatCurrencyINR(project.payment.projectPrice)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D]">
                  <span className="text-[#8B94A1] block">Advance Requirement ({project.payment.advancePercentage}%)</span>
                  <span className="font-mono text-base font-bold text-[#C2A878] mt-1 block">
                    {formatCurrencyINR(project.payment.advanceAmount)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D]">
                  <span className="text-[#8B94A1] block">Payment Status</span>
                  <div className="mt-1">
                    <BrokerStatusBadge status={project.payment.status} category="payment" />
                  </div>
                </div>
              </div>

              {project.payment.status !== "VERIFIED" && (
                <div className="p-4 rounded-xl bg-[#171A1F] border border-[#22262D] flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-[#E6E8EB]">Submit Client Payment Slip</h5>
                    <p className="text-[#8B94A1] text-[11px] mt-0.5">
                      Upload bank transfer UTR or UPI confirmation screenshot for verification.
                    </p>
                  </div>
                  <BrokerButton
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setAmountPaid(project.payment?.advanceAmount?.toString() || "");
                      setIsPaymentModalOpen(true);
                    }}
                    icon={<CreditCard className="w-3.5 h-3.5" />}
                  >
                    Submit Proof
                  </BrokerButton>
                </div>
              )}

              {project.payment.transactionId && (
                <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D] space-y-1.5">
                  <span className="font-semibold text-[#8B94A1] block">Last Submitted Transaction:</span>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">UTR Reference:</span>
                    <span className="font-mono font-medium text-[#E6E8EB]">
                      {project.payment.transactionId}
                    </span>
                  </div>
                  {project.payment.amountPaid && (
                    <div className="flex justify-between">
                      <span className="text-[#8B94A1]">Amount:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatCurrencyINR(project.payment.amountPaid)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#8B94A1] space-y-2">
              <CreditCard className="w-8 h-8 text-[#566171] mx-auto" />
              <p>Payment schedule is created upon execution of the master service contract.</p>
            </div>
          )}
        </BrokerCard>
      )}

      {/* UPLOAD CONTRACT MODAL */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsContractModalOpen(false)}
            />

            <div className="relative bg-[#111317] border border-[#22262D] rounded-xl max-w-md w-full p-6 text-xs text-[#E6E8EB] space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1E232B] pb-3">
                <h3 className="text-sm font-bold">Submit Signed Contract Copy</h3>
                <button
                  onClick={() => setIsContractModalOpen(false)}
                  className="p-1 rounded text-[#8B94A1] hover:text-[#E6E8EB]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUploadContract} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                    Signed Document Link / File Path <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signedFileUrl}
                    onChange={(e) => setSignedFileUrl(e.target.value)}
                    placeholder="https://.../signed-contract.pdf or /uploads/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                  />
                  <p className="text-[11px] text-[#566171] mt-1">
                    Must be in PDF format with signature & company stamp.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0E1013] border border-[#22262D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signingConfirmed}
                    onChange={(e) => setSigningConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#22262D] text-[#C2A878] accent-[#C2A878]"
                  />
                  <span className="text-[11px] text-[#D0D4DC] leading-relaxed">
                    I confirm that the client has duly executed this agreement and the attached document is
                    accurate.
                  </span>
                </label>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E232B]">
                  <BrokerButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsContractModalOpen(false)}
                  >
                    Cancel
                  </BrokerButton>
                  <BrokerButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={uploadingContract}
                    disabled={!signingConfirmed}
                  >
                    Submit for Review
                  </BrokerButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT PAYMENT PROOF MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsPaymentModalOpen(false)}
            />

            <div className="relative bg-[#111317] border border-[#22262D] rounded-xl max-w-md w-full p-6 text-xs text-[#E6E8EB] space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1E232B] pb-3">
                <h3 className="text-sm font-bold">Submit Advance Payment Proof</h3>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1 rounded text-[#8B94A1] hover:text-[#E6E8EB]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                    Transfer Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("BANK")}
                      className={`p-2 rounded-lg border text-xs font-medium ${
                        paymentMethod === "BANK"
                          ? "bg-[#C2A878]/15 border-[#C2A878] text-[#E6E8EB]"
                          : "bg-[#171A1F] border-[#22262D] text-[#8B94A1]"
                      }`}
                    >
                      Bank Transfer (NEFT/RTGS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("UPI")}
                      className={`p-2 rounded-lg border text-xs font-medium ${
                        paymentMethod === "UPI"
                          ? "bg-[#C2A878]/15 border-[#C2A878] text-[#E6E8EB]"
                          : "bg-[#171A1F] border-[#22262D] text-[#8B94A1]"
                      }`}
                    >
                      UPI Transfer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                    Amount Paid (INR) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="e.g. 200000"
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] font-mono focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                    UTR / Bank Transaction Reference ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. HDFC202610240019283"
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] font-mono focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                    Proof Slip Link / Screenshot URL
                  </label>
                  <input
                    type="text"
                    value={proofFileUrl}
                    onChange={(e) => setProofFileUrl(e.target.value)}
                    placeholder="https://... or /uploads/..."
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E232B]">
                  <BrokerButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPaymentModalOpen(false)}
                  >
                    Cancel
                  </BrokerButton>
                  <BrokerButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={submittingPayment}
                  >
                    Submit Proof for Clearance
                  </BrokerButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL PROJECT MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsCancelModalOpen(false)}
            />

            <div className="relative bg-[#111317] border border-[#22262D] rounded-xl max-w-md w-full p-6 text-xs text-[#E6E8EB] space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Cancel Project Referral?</span>
              </div>
              <p className="text-[#8B94A1] leading-relaxed">
                Are you sure you want to cancel referral <strong>{project.projectCode}</strong>? This
                action can only be performed while the project is in the initial review phase.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                  Cancellation Reason (Optional)
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Client decided to postpone or change scope..."
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E232B]">
                <BrokerButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCancelModalOpen(false)}
                >
                  Keep Active
                </BrokerButton>
                <BrokerButton
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={cancelling}
                  onClick={handleCancelProject}
                >
                  Confirm Cancellation
                </BrokerButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
