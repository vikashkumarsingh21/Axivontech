"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Filter,
  Download,
  ChevronDown,
  FileSpreadsheet,
  UserPlus,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Clock,
  ShieldOff,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { ExportPartnersModal } from "@/components/admin/export/ExportPartnersModal";
import { CreatePartnerLoginModal } from "@/components/admin/partner/CreatePartnerLoginModal";

export default function BusinessPartnerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Selection & Export State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<"APPLICATIONS" | "CONFIRMED_PARTNERS">("APPLICATIONS");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Approval & Login Creation Modal State
  const [selectedAppForLogin, setSelectedAppForLogin] = useState<any | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/business-partner/applications?limit=100`);
      if (!res.ok) throw new Error("Failed to load applications");
      const data = await res.json();
      setApplications(data.applications ?? []);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "UNDER_REVIEW": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "MEETING_SCHEDULED": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "MORE_INFO_REQUESTED": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "ON_HOLD": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "APPROVED": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "REJECTED": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every((a) => selectedIds.includes(a.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Partner Applications</h1>
          <p className="text-gray-400 text-sm">Review and manage business partner applications.</p>
        </div>

        {/* Export Button & Dropdown */}
        <div className="relative">
          <div className="flex items-center">
            <button
              onClick={() => {
                setExportType("APPLICATIONS");
                setIsExportModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-l-md text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Applications (.xlsx)
            </button>
            <button
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              className="px-2 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-r-md border-l border-emerald-800 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#161618] border border-white/10 rounded-lg shadow-xl z-20 py-1 text-xs">
              <button
                onClick={() => {
                  setExportType("APPLICATIONS");
                  setIsExportMenuOpen(false);
                  setIsExportModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2 text-gray-200"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Applications (.xlsx)
              </button>
              <button
                onClick={() => {
                  setExportType("CONFIRMED_PARTNERS");
                  setIsExportMenuOpen(false);
                  setIsExportModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2 text-gray-200"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Confirmed Partners (.xlsx)
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-sm mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search name, email, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111] border border-white/10 p-2 pl-9 text-sm text-white focus:outline-none focus:border-[#e8a064] rounded-sm"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#111] border border-white/10 p-2 pl-9 text-sm text-white focus:outline-none focus:border-[#e8a064] rounded-sm appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
              <option value="MORE_INFO_REQUESTED">More Info Requested</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20 flex items-center gap-2">
            <span>{selectedIds.length} row(s) selected</span>
            <button
              onClick={() => {
                setExportType("APPLICATIONS");
                setIsExportModalOpen(true);
              }}
              className="underline font-semibold hover:text-white"
            >
              Export Selected
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/5 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                  />
                </th>
                <th className="p-4 font-medium">Application ID</th>
                <th className="p-4 font-medium">Applicant</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Date Submitted</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading applications...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No applications found.</td>
                </tr>
              ) : (
                filtered.map((app) => {
                  const isChecked = selectedIds.includes(app.id);
                  return (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(app.id)}
                          className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                        />
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs text-gray-400">{app.applicationId}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-200">{app.fullName}</div>
                        <div className="text-xs text-gray-500">{app.email}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {app.city}, {app.country}
                      </td>
                      <td className="p-4 text-sm text-gray-400">
                        {format(new Date(app.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                            {app.status.replace(/_/g, " ")}
                          </span>
                          {app.status === "APPROVED" && (
                            <>
                              {app.accountStatus === "ACTIVE" && (
                                <span
                                  title="Active Broker Account"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  Account: Active
                                </span>
                              )}
                              {app.accountStatus === "PASSWORD_CHANGE_REQUIRED" && (
                                <span
                                  title="Account active, password change required at first login"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                >
                                  <Lock className="w-3 h-3 text-cyan-400" />
                                  Password Setup Req.
                                </span>
                              )}
                              {app.accountStatus === "CREATION_PENDING" && (
                                <span
                                  title="Activation link sent, pending partner verification"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                >
                                  <Clock className="w-3 h-3 text-blue-400" />
                                  Activation Pending
                                </span>
                              )}
                              {app.accountStatus === "DISABLED" && (
                                <span
                                  title="Partner account is deactivated or suspended"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/30"
                                >
                                  <ShieldOff className="w-3 h-3 text-red-400" />
                                  Account: Disabled
                                </span>
                              )}
                              {(!app.accountStatus || app.accountStatus === "NOT_CREATED") && (
                                <span
                                  title="Application approved but partner has no active login credentials yet"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                >
                                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                                  No login yet
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          {app.status === "APPROVED" && (!app.accountStatus || app.accountStatus === "NOT_CREATED") && (
                            <button
                              onClick={() => setSelectedAppForLogin(app)}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors"
                              title="Create Login credentials for approved partner"
                            >
                              <UserPlus className="w-3 h-3" />
                              Create Login
                            </button>
                          )}
                          {app.status === "APPROVED" && (app.accountStatus === "ACTIVE" || app.accountStatus === "PASSWORD_CHANGE_REQUIRED") && (
                            <Link
                              href={app.linkedUser?.brokerProfileId ? `/admin/crm/brokers/${app.linkedUser.brokerProfileId}` : `/admin/crm/brokers`}
                              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition-colors"
                              title="View and manage active partner account dossier"
                            >
                              <UserCheck className="w-3 h-3 text-emerald-400" />
                              Manage Account
                            </Link>
                          )}
                          {app.status === "APPROVED" && app.accountStatus === "DISABLED" && (
                            <Link
                              href={app.linkedUser?.brokerProfileId ? `/admin/crm/brokers/${app.linkedUser.brokerProfileId}` : `/admin/crm/brokers`}
                              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                              title="Reactivate partner account"
                            >
                              <ShieldCheck className="w-3 h-3 text-red-400" />
                              Reactivate Account
                            </Link>
                          )}
                          {app.status !== "APPROVED" && app.status !== "REJECTED" && (
                            <button
                              onClick={() => setSelectedAppForLogin(app)}
                              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                              title="Approve application and create login credentials"
                            >
                              <UserPlus className="w-3 h-3" />
                              Approve & Create Login
                            </button>
                          )}
                          <Link 
                            href={`/admin/business-partners/applications/${app.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#e8a064] hover:text-white px-2 py-1 rounded-md border border-white/10 hover:bg-white/5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <ExportPartnersModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        initialType={exportType}
        selectedRowIds={selectedIds}
        totalTableRowsCount={filtered.length}
      />

      {/* Create Partner Login Modal */}
      <CreatePartnerLoginModal
        isOpen={!!selectedAppForLogin}
        onClose={() => setSelectedAppForLogin(null)}
        application={selectedAppForLogin}
        onSuccess={() => {
          setSelectedAppForLogin(null);
          fetchApplications();
        }}
      />
    </div>
  );
}
