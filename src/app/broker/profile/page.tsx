"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, User, Building2, MapPin, Tag, Star, Calendar } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs transition-colors">
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function BrokerProfilePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/broker/profile")
      .then(async res => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then(d => setData(d.data))
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-400">{error}</div>
  );

  const { profile, stats } = data || {};
  const bp = profile?.brokerProfile;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://axivontech.in";
  const leadUrl = `${baseUrl}/lead/${bp?.referralCode}`;
  const projectUrl = `${baseUrl}/project/start/${bp?.referralCode}`;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 text-sm">Your partner account information and referral details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-[#111] rounded-xl border border-white/10 p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={15} /> Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: profile?.name },
                { label: "Email", value: profile?.email },
                { label: "Phone", value: profile?.phone || "—" },
                { label: "WhatsApp", value: bp?.whatsapp || "—" },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-gray-500 mb-0.5">{f.label}</p>
                  <p className="text-sm text-white font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Business Info */}
          <div className="bg-[#111] rounded-xl border border-white/10 p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 size={15} /> Business Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Company Name", value: bp?.companyName || "—" },
                { label: "Designation", value: bp?.designation || "—" },
                { label: "Website", value: bp?.website || "—" },
                { label: "City", value: bp?.city || "—" },
                { label: "State", value: bp?.state || "—" },
                { label: "Country", value: bp?.country || "—" },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-gray-500 mb-0.5">{f.label}</p>
                  <p className="text-sm text-white font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Partner Info */}
          <div className="bg-[#111] rounded-xl border border-white/10 p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag size={15} /> Partner Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Partner ID</p>
                <p className="text-xs font-mono text-gray-300 truncate">{bp?.partnerId || profile?.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Referral Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold font-mono text-red-400">{bp?.referralCode || "Not Generated"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Account Status</p>
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${profile?.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {profile?.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Member Since</p>
                <p className="text-sm text-white flex items-center gap-1.5">
                  <Calendar size={13} />
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-[#111] rounded-xl border border-white/10 p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Star size={15} /> Performance
            </h2>
            <div className="space-y-3">
              {[
                { label: "Total General Leads", value: stats?.totalLeads ?? 0, color: "text-blue-400" },
                { label: "Qualified Leads", value: stats?.qualifiedLeads ?? 0, color: "text-green-400" },
                { label: "Confirmed Projects", value: stats?.totalProjects ?? 0, color: "text-emerald-400" },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Referral Links */}
      {bp?.referralCode && (
        <div className="bg-[#111] rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Referral Links</h2>
          <div className="space-y-4">
            <div className="bg-[#0d0d0d] rounded-lg p-4">
              <p className="text-sm font-medium text-gray-300 mb-2">General Lead Form (Type A)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#1a1a1a] text-xs text-gray-400 p-2.5 rounded truncate">{leadUrl}</code>
                <CopyButton text={leadUrl} />
                <a href={leadUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors">
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            <div className="bg-[#0d0d0d] rounded-lg p-4">
              <p className="text-sm font-medium text-gray-300 mb-2">Confirmed Project Onboarding (Type B)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#1a1a1a] text-xs text-gray-400 p-2.5 rounded truncate">{projectUrl}</code>
                <CopyButton text={projectUrl} />
                <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors">
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
