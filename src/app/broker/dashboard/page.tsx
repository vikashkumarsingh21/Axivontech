"use client";

import { useState, useEffect } from "react";
import { Users, Briefcase, FileText, CheckCircle, Copy } from "lucide-react";
import Link from "next/link";

export default function BrokerDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/broker/profile")
      .then(res => res.json())
      .then(d => {
        setData(d.data);
        setIsLoading(false);
      });
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  }

  const referralCode = data?.profile?.brokerProfile?.referralCode;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://axivontech.in';
  const leadUrl = `${baseUrl}/lead/${referralCode}`;
  const projectUrl = `${baseUrl}/project/start/${referralCode}`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Partner Dashboard</h1>
          <p className="text-gray-400">Welcome back, {data?.profile?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Leads</p>
              <h3 className="text-2xl font-bold text-white">{data?.stats?.totalLeads || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Projects</p>
              <h3 className="text-2xl font-bold text-white">{data?.stats?.totalProjects || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-amber-400/80">Pending Action</p>
              <h3 className="text-2xl font-bold text-amber-500">{(data?.stats?.pendingContracts || 0) + (data?.stats?.pendingPayments || 0)}</h3>
              <p className="text-[10px] text-gray-500 mt-1">{data?.stats?.pendingContracts || 0} Contracts, {data?.stats?.pendingPayments || 0} Payments</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active / Progress</p>
              <h3 className="text-2xl font-bold text-white">{data?.stats?.activeProjects || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl border border-red-500/50 col-span-1 lg:col-span-2 relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-red-200 text-sm font-medium mb-1">Your Referral Code</p>
              <h3 className="text-3xl font-bold text-white tracking-wider font-mono">{referralCode}</h3>
            </div>
            <button 
              onClick={() => copyToClipboard(referralCode)}
              className="bg-black/20 hover:bg-black/40 text-white p-3 rounded-lg transition-colors"
              title="Copy Code"
            >
              <Copy size={20} />
            </button>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Share Links</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
              <p className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-blue-400" /> General Lead Form
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#1a1a1a] p-2 rounded text-xs text-gray-400 truncate">{leadUrl}</code>
                <button onClick={() => copyToClipboard(leadUrl)} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors">Copy</button>
              </div>
            </div>

            <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
              <p className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Briefcase size={16} className="text-emerald-400" /> Confirmed Project Onboarding
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#1a1a1a] p-2 rounded text-xs text-gray-400 truncate">{projectUrl}</code>
                <button onClick={() => copyToClipboard(projectUrl)} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors">Copy</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] rounded-xl border border-white/10 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Recent Leads</h3>
            <Link href="/broker/leads" className="text-sm text-red-500 hover:text-red-400">View All</Link>
          </div>
          
          <div className="space-y-3">
            {data?.recentLeads?.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No leads submitted yet.</p>
            ) : (
              data?.recentLeads?.map((lead: any) => (
                <div key={lead.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5">
                  <div>
                    <p className="font-medium text-gray-200">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.companyName || lead.serviceInterest || "General Inquiry"}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-500' : 
                    lead.status === 'QUALIFIED' ? 'bg-green-500/10 text-green-500' : 
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
