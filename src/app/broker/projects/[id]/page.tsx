"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, FileText, CheckCircle, CreditCard, Download, Upload, Copy, AlertCircle, Building2, Smartphone } from "lucide-react";
import Link from "next/link";

export default function BrokerProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Contract state
  const [signedFileUrl, setSignedFileUrl] = useState("");
  const [stampFileUrl, setStampFileUrl] = useState("");
  const [signingConfirmed, setSigningConfirmed] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"BANK" | "UPI" | "">("");
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [proofFileUrl, setProofFileUrl] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/v1/broker/projects/${params.id}`);
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

  const handleDownloadContract = async () => {
    if (!project?.contract) return;
    
    // Open in new tab
    window.open(project.contract.contractFileUrl, "_blank");

    // Track download if it was just SENT
    if (project.contract.status === "SENT") {
      try {
        await fetch(`/api/v1/broker/contracts/${project.contract.id}/download`, {
          method: "POST",
        });
        fetchProject(); // refresh status
      } catch (e) {
        console.error("Failed to mark contract as downloaded", e);
      }
    }
  };

  const submitContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedFileUrl) return alert("Please provide the signed contract file URL.");
    if (!signingConfirmed) return alert("Please confirm that the contract is signed.");

    setUploadingContract(true);
    try {
      const res = await fetch(`/api/v1/broker/contracts/${project.contract.id}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedFileUrl,
          stampFileUrl,
          signingConfirmed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload contract");
      alert("Contract submitted successfully!");
      fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
    setUploadingContract(false);
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) return alert("Please select a payment method.");
    if (!amountPaid || !transactionId || !proofFileUrl) return alert("Please fill all required payment fields.");

    setSubmittingPayment(true);
    try {
      const res = await fetch(`/api/v1/broker/payments/${project.payment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          amountPaid,
          transactionId,
          proofFileUrl,
          additionalNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit payment");
      alert("Payment proof submitted successfully!");
      fetchProject();
    } catch (err: any) {
      alert(err.message);
    }
    setSubmittingPayment(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-[#111] border border-white/10 rounded-md hover:bg-white/5">
          <ChevronLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {project.projectName}
            <span className="text-sm px-2 py-1 bg-white/10 text-white rounded font-mono">{project.projectCode}</span>
          </h1>
          <p className="text-sm text-gray-400">{project.clientName} | {project.companyName}</p>
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
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Project Details</h3>
                <dl className="grid grid-cols-3 gap-y-4 text-sm">
                  <dt className="text-gray-500">Service</dt><dd className="col-span-2 text-white">{project.requiredService}</dd>
                  <dt className="text-gray-500">Budget</dt><dd className="col-span-2 text-white">{project.projectBudget}</dd>
                  <dt className="text-gray-500">Timeline</dt><dd className="col-span-2 text-white">{project.expectedTimeline}</dd>
                  <dt className="text-gray-500">Status</dt><dd className="col-span-2 font-bold text-blue-400">{project.status.replace(/_/g, " ")}</dd>
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Client Details</h3>
                <dl className="grid grid-cols-3 gap-y-4 text-sm">
                  <dt className="text-gray-500">Name</dt><dd className="col-span-2 text-white">{project.clientName}</dd>
                  <dt className="text-gray-500">Email</dt><dd className="col-span-2 text-white">{project.clientEmail}</dd>
                  <dt className="text-gray-500">Phone</dt><dd className="col-span-2 text-white">{project.clientPhone}</dd>
                  <dt className="text-gray-500">Company</dt><dd className="col-span-2 text-white">{project.companyName}</dd>
                </dl>
              </div>
            </div>
            
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-blue-400" /> Next Steps
              </h3>
              
              <div className="space-y-4">
                <div className={`p-3 rounded-lg border ${!project.contract ? "bg-white/5 border-white/10 opacity-50" : project.contract.status === "VERIFIED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"}`}>
                  <div className="font-medium text-sm">1. Sign Contract</div>
                  <p className="text-xs mt-1 opacity-80">
                    {!project.contract ? "Waiting for admin to prepare contract." : 
                     project.contract.status === "VERIFIED" ? "Contract signed and verified." :
                     "Download, sign, and upload the contract."}
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg border ${!project.payment ? "bg-white/5 border-white/10 opacity-50" : project.payment.status === "VERIFIED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"}`}>
                  <div className="font-medium text-sm">2. Advance Payment</div>
                  <p className="text-xs mt-1 opacity-80">
                    {!project.payment ? "Waiting for contract verification." :
                     project.payment.status === "VERIFIED" ? "Payment verified." :
                     "Submit the 40% advance payment proof."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contract" && (
          <div className="p-6">
            {!project.contract ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Contract Pending</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Axivon Technologies is currently preparing the contract for this project. You will be notified once it is ready for download.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-xl">
                  <div>
                    <h3 className="font-bold text-white text-lg">{project.contract.contractName}</h3>
                    <p className="text-sm text-gray-400 mt-1">Status: <span className="font-medium text-white">{project.contract.status}</span></p>
                  </div>
                  <button
                    onClick={handleDownloadContract}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                  >
                    <Download size={18} /> Download Contract PDF
                  </button>
                </div>

                {project.contract.status === "REJECTED" && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h4 className="text-red-400 font-bold mb-1">Contract Rejected</h4>
                    <p className="text-red-300 text-sm">Reason: {project.contract.rejectionReason}</p>
                    <p className="text-red-300 text-sm mt-2">Please fix the issues and re-upload the contract.</p>
                  </div>
                )}

                {(project.contract.status === "SENT" || project.contract.status === "DOWNLOADED" || project.contract.status === "REJECTED") ? (
                  <form onSubmit={submitContract} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 space-y-6">
                    <h4 className="font-bold text-white text-md border-b border-white/10 pb-2">Upload Signed Contract</h4>
                    <p className="text-sm text-gray-400">
                      After the client has reviewed and signed the contract, upload the scanned PDF copy here.
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Signed Contract PDF URL *</label>
                      <input
                        required
                        type="url"
                        value={signedFileUrl}
                        onChange={(e) => setSignedFileUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-md p-3 text-white text-sm focus:border-red-500/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company Stamp Image URL (Optional)</label>
                      <input
                        type="url"
                        value={stampFileUrl}
                        onChange={(e) => setStampFileUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-md p-3 text-white text-sm focus:border-red-500/50 focus:outline-none"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer p-4 bg-white/5 rounded-lg border border-white/10">
                      <input
                        required
                        type="checkbox"
                        checked={signingConfirmed}
                        onChange={(e) => setSigningConfirmed(e.target.checked)}
                        className="mt-1"
                      />
                      <div className="text-sm text-gray-300">
                        <span className="font-medium text-white block mb-1">I confirm this contract has been officially signed.</span>
                        I have verified that the client has reviewed all terms and applied their signature to the physical or digital document.
                      </div>
                    </label>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={uploadingContract || !signingConfirmed}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Upload size={18} /> {uploadingContract ? "Uploading..." : "Submit Signed Contract"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-center flex-col text-center">
                    <CheckCircle size={48} className="text-emerald-500 mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">
                      {project.contract.status === "VERIFIED" ? "Contract Verified" : "Contract Under Review"}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {project.contract.status === "VERIFIED" 
                        ? "The signed contract has been verified by the administration. You can now proceed to payment."
                        : "The signed contract has been submitted and is currently being reviewed by the administration."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "payment" && (
          <div className="p-6">
            {!project.payment ? (
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Payment Not Ready</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  The payment request will be generated once the contract has been signed and verified.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-[#1a1a1a] rounded-xl border border-white/10">
                    <p className="text-sm text-gray-500 mb-1">Project Price</p>
                    <p className="text-xl font-bold text-white">{project.payment.currency} {project.payment.projectPrice.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <p className="text-sm text-blue-400 mb-1">Advance Required ({project.payment.advancePercentage}%)</p>
                    <p className="text-2xl font-bold text-white">{project.payment.currency} {project.payment.advanceAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-[#1a1a1a] rounded-xl border border-white/10">
                    <p className="text-sm text-gray-500 mb-1">Remaining</p>
                    <p className="text-xl font-bold text-gray-400">{project.payment.currency} {project.payment.remainingAmount.toLocaleString()}</p>
                  </div>
                </div>

                {(project.payment.status === "PENDING" || project.payment.status === "REJECTED") ? (
                  <>
                    {project.payment.status === "REJECTED" && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                        <h4 className="text-red-400 font-bold mb-1">Payment Proof Rejected</h4>
                        <p className="text-red-300 text-sm">Reason: {project.payment.rejectionReason}</p>
                        <p className="text-red-300 text-sm mt-2">Please verify the UTR and upload the correct payment screenshot.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Payment Instructions */}
                      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 bg-black/20">
                          <h4 className="font-bold text-white">Payment Instructions</h4>
                        </div>
                        <div className="p-5 space-y-6">
                          {/* BANK */}
                          {project.payment.paymentSettingsSnapshot?.bank && (
                            <div>
                              <div className="flex items-center gap-2 mb-3 text-blue-400 font-medium">
                                <Building2 size={18} /> Bank Transfer
                              </div>
                              <div className="bg-black/30 p-3 rounded-lg text-sm space-y-2 border border-white/5">
                                <div className="flex justify-between"><span className="text-gray-500">Bank Name</span> <span className="text-white font-medium">{project.payment.paymentSettingsSnapshot.bank.bankName}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Account Name</span> <span className="text-white font-medium">{project.payment.paymentSettingsSnapshot.bank.accountHolderName}</span></div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-500">Account No.</span> 
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-mono font-bold">{project.payment.paymentSettingsSnapshot.bank.accountNumber}</span>
                                    <button onClick={() => copyToClipboard(project.payment.paymentSettingsSnapshot.bank.accountNumber)} className="text-gray-500 hover:text-white"><Copy size={14}/></button>
                                  </div>
                                </div>
                                <div className="flex justify-between"><span className="text-gray-500">IFSC</span> <span className="text-white font-medium">{project.payment.paymentSettingsSnapshot.bank.ifscCode}</span></div>
                              </div>
                            </div>
                          )}

                          {/* UPI */}
                          {project.payment.paymentSettingsSnapshot?.upi && (
                            <div>
                              <div className="flex items-center gap-2 mb-3 text-purple-400 font-medium">
                                <Smartphone size={18} /> UPI Transfer
                              </div>
                              <div className="bg-black/30 p-4 rounded-lg text-sm border border-white/5 text-center space-y-3">
                                {project.payment.paymentSettingsSnapshot.upi.qrCodeUrl && (
                                  <img src={project.payment.paymentSettingsSnapshot.upi.qrCodeUrl} alt="UPI QR Code" className="max-w-[150px] mx-auto rounded" />
                                )}
                                <div className="flex items-center justify-center gap-2 mt-2">
                                  <span className="text-white font-mono font-bold text-base">{project.payment.paymentSettingsSnapshot.upi.upiId}</span>
                                  <button onClick={() => copyToClipboard(project.payment.paymentSettingsSnapshot.upi.upiId)} className="text-gray-500 hover:text-white"><Copy size={16}/></button>
                                </div>
                                <div className="text-gray-500">{project.payment.paymentSettingsSnapshot.upi.upiName}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submission Form */}
                      <form onSubmit={submitPayment} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-4">
                        <h4 className="font-bold text-white border-b border-white/10 pb-2 mb-4">Submit Payment Proof</h4>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Payment Method *</label>
                          <div className="grid grid-cols-2 gap-3">
                            <label className={`border rounded-lg p-3 cursor-pointer transition-colors ${paymentMethod === 'BANK' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30'}`}>
                              <input type="radio" name="method" className="hidden" checked={paymentMethod === 'BANK'} onChange={() => setPaymentMethod('BANK')} />
                              <div className="font-medium text-white text-center text-sm flex items-center justify-center gap-2"><Building2 size={16}/> Bank</div>
                            </label>
                            <label className={`border rounded-lg p-3 cursor-pointer transition-colors ${paymentMethod === 'UPI' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/30'}`}>
                              <input type="radio" name="method" className="hidden" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                              <div className="font-medium text-white text-center text-sm flex items-center justify-center gap-2"><Smartphone size={16}/> UPI</div>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Amount Paid *</label>
                          <input required type="number" step="0.01" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder={project.payment.advanceAmount.toString()} className="w-full bg-[#0d0d0d] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50" />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Transaction ID / UTR *</label>
                          <input required type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full bg-[#0d0d0d] border border-white/10 rounded-md p-2 text-white text-sm font-mono focus:border-red-500/50" />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Payment Screenshot URL *</label>
                          <input required type="url" value={proofFileUrl} onChange={e => setProofFileUrl(e.target.value)} placeholder="https://..." className="w-full bg-[#0d0d0d] border border-white/10 rounded-md p-2 text-white text-sm focus:border-red-500/50" />
                        </div>

                        <div className="pt-2">
                          <button type="submit" disabled={submittingPayment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md transition-colors text-sm font-medium disabled:opacity-50">
                            {submittingPayment ? "Submitting..." : "Submit Payment Proof"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-center flex-col text-center">
                    <CheckCircle size={48} className="text-emerald-500 mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">
                      {project.payment.status === "VERIFIED" ? "Payment Verified & Project Confirmed" : "Payment Under Review"}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {project.payment.status === "VERIFIED" 
                        ? "Your advance payment has been successfully verified. Project execution has officially started."
                        : "Your payment proof has been submitted and is currently being verified by the administration."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="p-6 max-w-2xl mx-auto py-10">
            {/* Same timeline component as Admin, slightly simplified */}
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                  <CheckCircle className="text-white w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white text-sm">Project Requested</h3>
                    <span className="text-xs text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {project.contract && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-blue-500 bg-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <FileText className="text-blue-500 w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-sm">Contract Sent</h3>
                      <span className="text-xs text-gray-500">{new Date(project.contract.sentAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {project.contract?.signedAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500 bg-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <Upload className="text-emerald-500 w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-sm">Contract Signed</h3>
                      <span className="text-xs text-gray-500">{new Date(project.contract.signedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {project.payment?.submittedAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-amber-500 bg-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <CreditCard className="text-amber-500 w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/10 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-sm">Payment Submitted</h3>
                      <span className="text-xs text-gray-500">{new Date(project.payment.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {project.payment?.verifiedAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-red-500 bg-red-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-red-500/50">
                    <CheckCircle className="text-white w-5 h-5" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-red-950/30 border border-red-500/30 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-sm">Project Confirmed</h3>
                      <span className="text-xs text-gray-500">{new Date(project.payment.verifiedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
