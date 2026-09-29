"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Briefcase, GraduationCap, FileText, Calendar, Clock, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [actionReason, setActionReason] = useState("");
  const [actionModal, setActionModal] = useState<"APPROVE" | "REJECT" | "ON_HOLD" | "MORE_INFO" | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const [meetingModal, setMeetingModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingType, setMeetingType] = useState("ONLINE");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [submittingMeeting, setSubmittingMeeting] = useState(false);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/business-partner/applications/${params.id}`);
      if (!res.ok) throw new Error("Failed to load application");
      const data = await res.json();
      setApp(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  const handleAction = async () => {
    if ((actionModal === "REJECT" || actionModal === "ON_HOLD" || actionModal === "MORE_INFO") && !actionReason) {
      return alert("Reason/message is required for this action.");
    }

    try {
      setSubmittingAction(true);
      let status = "";
      if (actionModal === "APPROVE") status = "APPROVED";
      if (actionModal === "REJECT") status = "REJECTED";
      if (actionModal === "ON_HOLD") status = "ON_HOLD";
      if (actionModal === "MORE_INFO") status = "MORE_INFO_REQUESTED";

      const res = await fetch(`/api/v1/admin/business-partner/applications/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason: actionReason })
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      setActionModal(null);
      setActionReason("");
      fetchApplication();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!meetingDate || !meetingTime) {
      alert("Please select date and time");
      return;
    }
    
    try {
      setSubmittingMeeting(true);
      const combinedDateTime = new Date(`${meetingDate}T${meetingTime}`).toISOString();
      const res = await fetch(`/api/v1/admin/business-partner/applications/${params.id}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingDate: combinedDateTime,
          durationMinutes: 30,
          meetingType,
          locationOrLink: meetingLocation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule meeting");

      setMeetingModal(false);
      setMeetingDate("");
      setMeetingTime("");
      setMeetingLocation("");
      fetchApplication();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setSubmittingMeeting(false);
    }
  };

  const [creatingAccount, setCreatingAccount] = useState(false);

  const handleCreateAccount = async () => {
    if (!confirm("Are you sure you want to create a Partner Account for this approved applicant?")) return;
    
    try {
      setCreatingAccount(true);
      const res = await fetch(`/api/v1/admin/business-partner/applications/${params.id}/create-account`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to create account");
      
      alert(`Partner Account created successfully!\nPartner ID: ${data.partnerId}\nReferral Code: ${data.referralCode}`);
      fetchApplication();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setCreatingAccount(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading application details...</div>;
  if (error || !app) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <Link href="/admin/business-partners/applications" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{app.fullName}</h1>
            <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-sm text-[10px] font-mono text-gray-400 uppercase">
              {app.applicationId}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Status: <strong className="text-white">{app.status.replace(/_/g, " ")}</strong></p>
        </div>

        <div className="flex items-center gap-2">
          {app.status !== "APPROVED" && app.status !== "REJECTED" && (
            <>
              <button onClick={() => setActionModal("MORE_INFO")} className="bg-[#111] border border-white/10 text-white px-4 py-2 rounded-sm text-sm hover:bg-white/5">Request Info</button>
              <button onClick={() => setActionModal("ON_HOLD")} className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-sm text-sm hover:bg-yellow-500/20">Hold</button>
              <button onClick={() => setActionModal("REJECT")} className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-sm text-sm hover:bg-red-500/20">Reject</button>
              <button onClick={() => setActionModal("APPROVE")} className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-2 rounded-sm text-sm hover:bg-green-500/20">Approve</button>
            </>
          )}
          {app.status === "APPROVED" && (
            <button 
              onClick={handleCreateAccount} 
              disabled={creatingAccount}
              className="bg-[#e8a064] text-black font-medium px-4 py-2 rounded-sm text-sm hover:bg-white transition-colors"
            >
              {creatingAccount ? "Creating Account..." : "Create Partner Account"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#111] border border-white/5 rounded-sm p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-[#e8a064]" /> Personal Information</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div><p className="text-gray-500">Email</p><p className="text-gray-200">{app.email}</p></div>
              <div><p className="text-gray-500">Phone</p><p className="text-gray-200">{app.phone}</p></div>
              <div><p className="text-gray-500">Location</p><p className="text-gray-200">{app.city}, {app.state ? `${app.state}, ` : ""}{app.country}</p></div>
              <div><p className="text-gray-500">Submitted On</p><p className="text-gray-200">{format(new Date(app.createdAt), "PPP")}</p></div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-sm p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#e8a064]" /> Professional Background</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm mb-4">
              <div><p className="text-gray-500">Occupation</p><p className="text-gray-200">{app.occupation}</p></div>
              <div><p className="text-gray-500">Current Work</p><p className="text-gray-200">{app.currentWork || "N/A"}</p></div>
              <div><p className="text-gray-500">Experience</p><p className="text-gray-200">{app.yearsOfExperience ? `${app.yearsOfExperience} years` : "N/A"}</p></div>
            </div>
            {app.relevantExperience && (
              <div className="mb-4">
                <p className="text-gray-500 text-sm mb-1">Relevant Experience</p>
                <p className="text-gray-300 text-sm bg-[#0a0a0a] p-3 rounded-sm">{app.relevantExperience}</p>
              </div>
            )}
            {app.clientNetwork && (
              <div>
                <p className="text-gray-500 text-sm mb-1">Client Network</p>
                <p className="text-gray-300 text-sm bg-[#0a0a0a] p-3 rounded-sm">{app.clientNetwork}</p>
              </div>
            )}
          </div>

          <div className="bg-[#111] border border-white/5 rounded-sm p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-[#e8a064]" /> Education</h3>
            <div className="space-y-4">
              <div className="border-l-2 border-white/10 pl-4">
                <p className="text-gray-200 text-sm font-medium">10th Standard</p>
                <p className="text-gray-400 text-xs">{app.education10th?.school} • {app.education10th?.board} • {app.education10th?.passingYear} • {app.education10th?.percentage}</p>
              </div>
              {app.education12th?.school && (
                <div className="border-l-2 border-white/10 pl-4">
                  <p className="text-gray-200 text-sm font-medium">12th Standard</p>
                  <p className="text-gray-400 text-xs">{app.education12th.school} • {app.education12th.board} • {app.education12th.passingYear}</p>
                </div>
              )}
              {app.educationUndergrad?.degree && (
                <div className="border-l-2 border-white/10 pl-4">
                  <p className="text-gray-200 text-sm font-medium">Undergraduate: {app.educationUndergrad.degree}</p>
                  <p className="text-gray-400 text-xs">{app.educationUndergrad.college} • {app.educationUndergrad.branch} • {app.educationUndergrad.passingYear}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-sm p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-[#e8a064]" /> Motivation & Contribution</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Motivation</p>
                <p className="text-gray-300 text-sm bg-[#0a0a0a] p-3 rounded-sm whitespace-pre-wrap">{app.motivation || "N/A"}</p>
              </div>
              {app.contribution && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Contribution</p>
                  <p className="text-gray-300 text-sm bg-[#0a0a0a] p-3 rounded-sm whitespace-pre-wrap">{app.contribution}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-white/5 rounded-sm p-6">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2 uppercase tracking-wider text-gray-500"><Calendar className="w-4 h-4" /> Meetings</h3>
            {app.meetings?.length > 0 ? (
              <div className="space-y-3 mb-4">
                {app.meetings.map((m: any) => (
                  <div key={m.id} className="p-3 bg-[#0a0a0a] border border-white/5 rounded-sm">
                    <p className="text-sm text-white font-medium mb-1">
                      {format(new Date(m.meetingDate), "MMM d, yyyy 'at' HH:mm")}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{m.meetingType.toLowerCase()} • {m.durationMinutes} min</p>
                    {m.locationOrLink && (
                      <p className="text-xs text-[#e8a064] mt-2 truncate">{m.locationOrLink}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm mb-4">No meetings scheduled yet.</p>
            )}
            {!["APPROVED", "REJECTED"].includes(app.status) && (
              <button 
                onClick={() => setMeetingModal(true)}
                className="w-full bg-[#1a1a1a] border border-white/10 text-white px-4 py-2 text-sm hover:bg-white/5 transition-colors"
              >
                Schedule Meeting
              </button>
            )}
          </div>

          <div className="bg-[#111] border border-white/5 rounded-sm p-6">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2 uppercase tracking-wider text-gray-500"><Clock className="w-4 h-4" /> Status History</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {app.statusHistory?.length > 0 ? app.statusHistory.map((sh: any, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white/20 bg-[#111] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-black z-10"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-sm bg-[#0a0a0a] border border-white/5 shadow">
                    <p className="text-xs font-semibold text-white">{sh.newStatus.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{format(new Date(sh.createdAt), "MMM d, yyyy HH:mm")}</p>
                    {sh.reason && <p className="text-xs text-gray-400 mt-2">"{sh.reason}"</p>}
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-500 text-center relative z-10 bg-[#111] py-2">No history recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ACTION MODAL */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 p-6 rounded-sm max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-2">
              {actionModal === "APPROVE" && "Approve Application"}
              {actionModal === "REJECT" && "Reject Application"}
              {actionModal === "ON_HOLD" && "Put Application on Hold"}
              {actionModal === "MORE_INFO" && "Request More Information"}
            </h3>
            
            {actionModal === "APPROVE" ? (
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to approve this Business Partner Application? This will mark the application as ready for Phase 3 (Partner Account Creation).
              </p>
            ) : (
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  {actionModal === "REJECT" && "Reason for Rejection (Required)"}
                  {actionModal === "ON_HOLD" && "Reason for Hold (Required)"}
                  {actionModal === "MORE_INFO" && "Message to Applicant (Required)"}
                </label>
                <textarea
                  rows={4}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#e8a064]"
                  placeholder="Enter details..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setActionModal(null); setActionReason(""); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                disabled={submittingAction}
              >
                Cancel
              </button>
              <button 
                onClick={handleAction}
                disabled={submittingAction}
                className={`px-4 py-2 text-sm font-semibold rounded-sm transition-colors ${
                  actionModal === "APPROVE" ? "bg-green-600 hover:bg-green-500 text-white" :
                  actionModal === "REJECT" ? "bg-red-600 hover:bg-red-500 text-white" :
                  actionModal === "ON_HOLD" ? "bg-yellow-600 hover:bg-yellow-500 text-white" :
                  "bg-[#e8a064] hover:bg-white text-black"
                }`}
              >
                {submittingAction ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEETING MODAL */}
      {meetingModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 p-6 rounded-sm max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-6">Schedule Meeting</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input 
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 p-2 text-white text-sm focus:outline-none focus:border-[#e8a064]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Time</label>
                <input 
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 p-2 text-white text-sm focus:outline-none focus:border-[#e8a064]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <select 
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 p-2 text-white text-sm focus:outline-none focus:border-[#e8a064]"
                >
                  <option value="ONLINE">Online (Video Call)</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="IN_PERSON">In Person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Link or Location</label>
                <input 
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="e.g. Google Meet link or Office Address"
                  className="w-full bg-[#0a0a0a] border border-white/10 p-2 text-white text-sm focus:outline-none focus:border-[#e8a064]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setMeetingModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                disabled={submittingMeeting}
              >
                Cancel
              </button>
              <button 
                onClick={handleScheduleMeeting}
                disabled={submittingMeeting}
                className="px-4 py-2 text-sm font-semibold bg-[#e8a064] hover:bg-white text-black transition-colors rounded-sm"
              >
                {submittingMeeting ? "Scheduling..." : "Schedule Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
