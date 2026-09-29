"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, FileText, CheckCircle, XCircle, CreditCard, Send, Upload, RefreshCw, Briefcase, Download, Star } from "lucide-react";

export default function AdminPartnerProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Send Contract Modal
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractForm, setContractForm] = useState({ name: "", description: "", fileUrl: "" });
  const [sendingContract, setSendingContract] = useState(false);

  // Rejection Modals
  const [rejectContractModal, setRejectContractModal] = useState(false);
  const [rejectPaymentModal, setRejectPaymentModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/v1/admin/partner-projects/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch project");
      setProject(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const sendContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingContract(true);
    try {
      const res = await fetch("/api/v1/admin/partner-contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerProjectId: project.id,
          contractName: contractForm.name,
          contractDescription: contractForm.description,
          contractFileUrl: contractForm.fileUrl,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to send contract");
      }
      setShowContractModal(false);
      setContractForm({ name: "", description: "", fileUrl: "" });
      fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
    setSendingContract(false);
  };

  const handleContractAction = async (action: string, reason = "") => {
    if (action === "reject" && !reason) return;
    try {
      const res = await fetch(`/api/v1/admin/partner-contracts/${project.contract.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: reason }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update contract");
      }
      setRejectContractModal(false);
      setRejectionReason("");
      fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePaymentAction = async (action: string, reason = "") => {
    if (action === "reject" && !reason) return;
    try {
      const res = await fetch(`/api/v1/admin/partner-payments/${project.payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: reason }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update payment");
      }
      setRejectPaymentModal(false);
      setRejectionReason("");
      fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading project...</div>;
  if (error || !project) return <div className="p-6 text-red-500">{error || "Project not found"}</div>;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "contract", label: "Contract" },
    { id: "payment", label: "Payment" },
    { id: "timeline", label: "Timeline" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-[#111] border border-white/10 rounded-md hover:bg-white/5">
          <ChevronLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {project.projectName}
            <span className="text-sm px-2 py-1 bg-white/10 text-white rounded font-mono">{project.projectCode}</span>
          </h1>
          <p className="text-sm text-gray-400">Client: {project.clientName} ({project.companyName})</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id ? "border-red-500 text-red-500" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
        {activeTab === "overview" && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                  <Briefcase size={16} className="text-red-500" /> Project Details
                </h3>
                <dl className="grid grid-cols-3 gap-y-4 text-sm">
                  <dt className="text-gray-500">Service</dt><dd className="col-span-2 text-white">{project.requiredService}</dd>
                  <dt className="text-gray-500">Budget</dt><dd className="col-span-2 text-white">{project.projectBudget}</dd>
                  <dt className="text-gray-500">Timeline</dt><dd className="col-span-2 text-white">{project.expectedTimeline}</dd>
                  <dt className="text-gray-500">Status</dt><dd className="col-span-2 font-bold text-blue-400">{project.status}</dd>
                  <dt className="text-gray-500">Created</dt><dd className="col-span-2 text-gray-300">{new Date(project.createdAt).toLocaleString()}</dd>
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" /> Detailed Requirement
                </h3>
                <div className="text-sm text-gray-300 whitespace-pre-wrap bg-[#1a1a1a] p-4 rounded-md border border-white/5">
                  {project.detailedRequirement}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Client Details</h3>
                <dl className="grid grid-cols-3 gap-y-4 text-sm">
                  <dt className="text-gray-500">Name</dt><dd className="col-span-2 text-white">{project.clientName}</dd>
                  <dt className="text-gray-500">Email</dt><dd className="col-span-2 text-blue-400"><a href={`mailto:${project.clientEmail}`}>{project.clientEmail}</a></dd>
                  <dt className="text-gray-500">Phone</dt><dd className="col-span-2 text-white">{project.clientPhone}</dd>
                  {project.clientWhatsapp && <><dt className="text-gray-500">WhatsApp</dt><dd className="col-span-2 text-green-400">{project.clientWhatsapp}</dd></>}
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Company Details</h3>
                <dl className="grid grid-cols-3 gap-y-4 text-sm">
                  <dt className="text-gray-500">Company</dt><dd className="col-span-2 text-white">{project.companyName}</dd>
                  <dt className="text-gray-500">Industry</dt><dd className="col-span-2 text-white">{project.industry}</dd>
                  <dt className="text-gray-500">Location</dt><dd className="col-span-2 text-white">{project.city}, {project.state}, {project.country}</dd>
                  {project.website && <><dt className="text-gray-500">Website</dt><dd className="col-span-2 text-blue-400"><a href={project.website} target="_blank">{project.website}</a></dd></>}
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Broker Information</h3>
                <dl className="grid grid-cols-3 gap-y-4 text-sm">
                  <dt className="text-gray-500">Name</dt><dd className="col-span-2 text-white">{project.brokerProfile.user.name}</dd>
                  <dt className="text-gray-500">Email</dt><dd className="col-span-2 text-white">{project.brokerProfile.user.email}</dd>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contract" && (
          <div className="p-6">
            {!project.contract ? (
              <div className="flex flex-col items-center justify-center p-12 bg-black/20 border border-dashed border-white/10 rounded-xl">
                <FileText size={48} className="text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Contract Sent</h3>
                <p className="text-gray-400 text-sm text-center max-w-md mb-6">
                  Review the project requirements. If accepted, prepare and send the contract PDF to the broker and client.
                </p>
                <button
                  onClick={() => setShowContractModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                >
                  <Send size={18} /> Send Contract
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{project.contract.contractName}</h3>
                    <p className="text-sm text-gray-400">{project.contract.contractDescription}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Contract Status</div>
                    <span className="px-3 py-1 bg-white/10 text-white font-medium rounded-full text-sm">
                      {project.contract.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sent Contract */}
                  <div className="p-5 bg-[#1a1a1a] rounded-xl border border-white/10">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Send size={16} /> Sent Document
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">Sent on {new Date(project.contract.sentAt).toLocaleString()}</p>
                    <a
                      href={project.contract.contractFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm transition-colors"
                    >
                      <Download size={16} /> Download Sent PDF
                    </a>
                  </div>

                  {/* Signed Contract */}
                  <div className="p-5 bg-[#1a1a1a] rounded-xl border border-white/10">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CheckCircle size={16} /> Signed Document
                    </h4>
                    {!project.contract.signedFileUrl ? (
                      <p className="text-sm text-gray-500 italic">Waiting for broker/client to upload signed contract.</p>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xs text-gray-500">Uploaded on {new Date(project.contract.signedAt).toLocaleString()}</p>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={project.contract.signedFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors"
                          >
                            <FileText size={16} /> View Signed PDF
                          </a>
                          {project.contract.stampFileUrl && (
                            <a
                              href={project.contract.stampFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                            >
                              <FileText size={16} /> View Company Stamp
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {project.contract.status === "REJECTED" && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-red-400 text-sm font-medium mb-1">Contract Rejected</p>
                    <p className="text-red-300 text-sm">{project.contract.rejectionReason}</p>
                  </div>
                )}

                {(project.contract.status === "UNDER_REVIEW" || project.contract.status === "SIGNED") && (
                  <div className="p-5 bg-black/30 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white mb-1">Verification Required</h4>
                      <p className="text-sm text-gray-400">Review the signed document carefully before verifying.</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setRejectContractModal(true)}
                        className="px-4 py-2 bg-[#2a2a2a] hover:bg-red-900/50 hover:text-red-400 text-white rounded-md text-sm transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleContractAction("request_reupload")}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-md text-sm transition-colors flex items-center gap-2"
                      >
                        <RefreshCw size={16} /> Request Re-upload
                      </button>
                      <button
                        onClick={() => handleContractAction("verify")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors flex items-center gap-2"
                      >
                        <CheckCircle size={16} /> Verify & Request Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "payment" && (
          <div className="p-6">
            {!project.payment ? (
              <div className="flex flex-col items-center justify-center p-12 bg-black/20 border border-dashed border-white/10 rounded-xl">
                <CreditCard size={48} className="text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Payment Requested</h3>
                <p className="text-gray-400 text-sm text-center max-w-md">
                  Payment request is automatically generated when you verify the signed contract.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Advance Payment Request</h3>
                    <p className="text-sm text-gray-400">{project.payment.advancePercentage}% Advance required to confirm project</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Payment Status</div>
                    <span className="px-3 py-1 bg-white/10 text-white font-medium rounded-full text-sm">
                      {project.payment.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-[#1a1a1a] rounded-xl border border-white/10">
                    <p className="text-sm text-gray-500 mb-1">Project Price</p>
                    <p className="text-2xl font-bold text-white">{project.payment.currency} {project.payment.projectPrice.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <p className="text-sm text-blue-400 mb-1">Advance Amount ({project.payment.advancePercentage}%)</p>
                    <p className="text-2xl font-bold text-white">{project.payment.currency} {project.payment.advanceAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-[#1a1a1a] rounded-xl border border-white/10">
                    <p className="text-sm text-gray-500 mb-1">Remaining Amount</p>
                    <p className="text-xl font-bold text-gray-300">{project.payment.currency} {project.payment.remainingAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6 bg-[#1a1a1a] rounded-xl border border-white/10">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Upload size={16} /> Payment Proof Details
                  </h4>
                  {!project.payment.amountPaid ? (
                    <p className="text-sm text-gray-500 italic text-center py-4">Waiting for broker to submit payment proof.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <dl className="space-y-4 text-sm">
                        <div className="grid grid-cols-3 gap-2">
                          <dt className="text-gray-500">Method</dt>
                          <dd className="col-span-2 text-white font-medium">{project.payment.paymentMethod}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <dt className="text-gray-500">Amount Paid</dt>
                          <dd className="col-span-2 text-white font-medium">{project.payment.currency} {project.payment.amountPaid.toLocaleString()}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <dt className="text-gray-500">UTR / Ref</dt>
                          <dd className="col-span-2 text-white font-mono">{project.payment.transactionId}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <dt className="text-gray-500">Date</dt>
                          <dd className="col-span-2 text-white">{new Date(project.payment.paymentDate).toLocaleDateString()}</dd>
                        </div>
                        {project.payment.additionalNotes && (
                          <div className="grid grid-cols-3 gap-2">
                            <dt className="text-gray-500">Notes</dt>
                            <dd className="col-span-2 text-gray-400">{project.payment.additionalNotes}</dd>
                          </div>
                        )}
                      </dl>
                      <div>
                        {project.payment.proofFileUrl && (
                          <a href={project.payment.proofFileUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-3 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors text-sm font-medium">
                            View Payment Screenshot
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {project.payment.status === "REJECTED" && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-red-400 text-sm font-medium mb-1">Payment Rejected</p>
                    <p className="text-red-300 text-sm">{project.payment.rejectionReason}</p>
                  </div>
                )}

                {(project.payment.status === "SUBMITTED" || project.payment.status === "UNDER_REVIEW") && (
                  <div className="p-5 bg-black/30 border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white mb-1">Verification Required</h4>
                      <p className="text-sm text-gray-400">Verify the UTR in your bank account before confirming.</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setRejectPaymentModal(true)}
                        className="px-4 py-2 bg-[#2a2a2a] hover:bg-red-900/50 hover:text-red-400 text-white rounded-md text-sm transition-colors flex items-center gap-2"
                      >
                        <XCircle size={16} /> Reject Payment
                      </button>
                      <button
                        onClick={() => handlePaymentAction("verify")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors flex items-center gap-2"
                      >
                        <CheckCircle size={16} /> Verify Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="p-6 max-w-2xl mx-auto py-10">
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                  <CheckCircle className="text-white w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-sm">Project Requested</h3>
                    <span className="text-xs text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-400">Project requirements submitted via broker.</p>
                </div>
              </div>

              {project.contract && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-blue-500 bg-blue-500/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <Send className="text-blue-400 w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-sm">Contract Sent</h3>
                      <span className="text-xs text-gray-500">{new Date(project.contract.sentAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-400">{project.contract.contractName}</p>
                  </div>
                </div>
              )}

              {project.contract?.signedAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-purple-500 bg-purple-500/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <FileText className="text-purple-400 w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-sm">Contract Signed</h3>
                      <span className="text-xs text-gray-500">{new Date(project.contract.signedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-400">Signed document uploaded.</p>
                  </div>
                </div>
              )}

              {project.contract?.verifiedAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500 bg-emerald-500/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <CheckCircle className="text-emerald-400 w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-sm">Contract Verified</h3>
                      <span className="text-xs text-gray-500">{new Date(project.contract.verifiedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-400">Advance payment requested.</p>
                  </div>
                </div>
              )}

              {project.payment?.submittedAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-amber-500 bg-amber-500/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <CreditCard className="text-amber-400 w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-sm">Payment Submitted</h3>
                      <span className="text-xs text-gray-500">{new Date(project.payment.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-400">Proof uploaded.</p>
                  </div>
                </div>
              )}

              {project.payment?.verifiedAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-red-500 bg-red-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-red-500/50">
                    <Star className="text-white w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-red-950/30 border border-red-500/30 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-sm">Project Confirmed</h3>
                      <span className="text-xs text-gray-500">{new Date(project.payment.verifiedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-400">Payment verified. Project execution begins.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SEND CONTRACT MODAL */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Send Contract</h2>
            <form onSubmit={sendContract} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Contract Title *</label>
                <input required type="text" value={contractForm.name} onChange={e => setContractForm({ ...contractForm, name: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                <textarea value={contractForm.description} onChange={e => setContractForm({ ...contractForm, description: e.target.value })} rows={2} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Contract PDF URL *</label>
                <input required type="url" value={contractForm.fileUrl} onChange={e => setContractForm({ ...contractForm, fileUrl: e.target.value })} placeholder="https://..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
                <p className="text-[10px] text-gray-500 mt-1">Upload the finalized contract PDF to your secure storage and paste the URL here.</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowContractModal(false)} className="px-4 py-2 bg-[#2a2a2a] text-white rounded-md text-sm">Cancel</button>
                <button type="submit" disabled={sendingContract} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">{sendingContract ? "Sending..." : "Send Contract"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT CONTRACT MODAL */}
      {rejectContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-2">Reject Contract</h2>
            <p className="text-sm text-gray-400 mb-6">Please provide a reason for rejecting the signed contract. The broker will be notified.</p>
            <div className="space-y-4">
              <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Reason for rejection..." rows={3} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={() => setRejectContractModal(false)} className="px-4 py-2 bg-[#2a2a2a] text-white rounded-md text-sm">Cancel</button>
                <button onClick={() => handleContractAction("reject", rejectionReason)} disabled={!rejectionReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50">Confirm Rejection</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT PAYMENT MODAL */}
      {rejectPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-2">Reject Payment</h2>
            <p className="text-sm text-gray-400 mb-6">Please provide a reason for rejecting the payment proof (e.g. Invalid UTR, insufficient amount).</p>
            <div className="space-y-4">
              <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Reason for rejection..." rows={3} className="w-full bg-[#1a1a1a] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50 focus:outline-none" />
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={() => setRejectPaymentModal(false)} className="px-4 py-2 bg-[#2a2a2a] text-white rounded-md text-sm">Cancel</button>
                <button onClick={() => handlePaymentAction("reject", rejectionReason)} disabled={!rejectionReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50">Confirm Rejection</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
