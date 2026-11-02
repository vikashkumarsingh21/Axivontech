"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Building2,
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  UserX,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  managerId: string | null;
  manager?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    designation?: string | null;
    status: string;
  } | null;
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "UNASSIGNED">("ALL");

  // Notification banners
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showCreateDeptModal, setShowCreateDeptModal] = useState(false);
  const [showCreateManagerModal, setShowCreateManagerModal] = useState(false);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form states
  const [createDeptForm, setCreateDeptForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [createManagerForm, setCreateManagerForm] = useState({
    name: "",
    email: "",
    designation: "",
    phone: "",
    password: "",
  });

  const [editDeptForm, setEditDeptForm] = useState({
    name: "",
    code: "",
    description: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    managerId: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/departments?includeInactive=true");
      const json = await res.json();
      if (json.success) {
        setDepartments(json.departments || []);
      } else {
        setErrorMessage(json.message || "Failed to load departments.");
      }
    } catch (err: any) {
      setErrorMessage("Network error loading departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        (d.manager?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.manager?.email || "").toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "ACTIVE") return d.status === "ACTIVE";
      if (statusFilter === "INACTIVE") return d.status === "INACTIVE";
      if (statusFilter === "UNASSIGNED") return !d.managerId;
      return true;
    });
  }, [departments, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = departments.length;
    const active = departments.filter((d) => d.status === "ACTIVE").length;
    const withManager = departments.filter((d) => d.managerId).length;
    const totalEmployees = departments.reduce((acc, d) => acc + (d.employeeCount || 0), 0);
    return { total, active, withManager, totalEmployees };
  }, [departments]);

  // 1. Create Department Handler
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/v1/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createDeptForm),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.message || json.error || "Failed to create department.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage(json.message || "Department created successfully.");
      setShowCreateDeptModal(false);
      setCreateDeptForm({ name: "", code: "", description: "" });
      fetchDepartments();
    } catch (err) {
      setErrorMessage("Network error creating department.");
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Create Manager Account Handler
  const handleCreateManagerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/v1/admin/departments/${selectedDept.id}/manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createManagerForm),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.message || json.error || "Failed to create manager account.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage(json.message || "Manager account provisioned successfully.");
      setShowCreateManagerModal(false);
      setCreateManagerForm({ name: "", email: "", designation: "", phone: "", password: "" });
      fetchDepartments();
    } catch (err) {
      setErrorMessage("Network error provisioning manager account.");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Edit Department Handler
  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: any = {
        name: editDeptForm.name,
        code: editDeptForm.code,
        description: editDeptForm.description,
        status: editDeptForm.status,
      };

      if (editDeptForm.managerId !== undefined) {
        payload.managerId = editDeptForm.managerId === "" ? null : editDeptForm.managerId;
      }

      const res = await fetch(`/api/v1/admin/departments/${selectedDept.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.message || json.error || "Failed to update department.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage(json.message || "Department updated successfully.");
      setShowEditDeptModal(false);
      fetchDepartments();
    } catch (err) {
      setErrorMessage("Network error updating department.");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Revoke Manager Handler
  const handleRevokeManager = async (dept: Department) => {
    if (!confirm(`Are you sure you want to revoke the manager assignment for "${dept.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/departments/${dept.id}/manager`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (res.ok) {
        setSuccessMessage(json.message || "Manager assignment revoked.");
        fetchDepartments();
      } else {
        setErrorMessage(json.message || "Failed to revoke manager assignment.");
      }
    } catch (err) {
      setErrorMessage("Network error revoking manager.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1E2530] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-[#566171] uppercase tracking-wider">Workforce &amp; Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">Department Management</h1>
          <p className="text-sm text-[#7E8997] mt-0.5">
            Configure company departments, assign department managers, and issue secure manager access credentials.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setCreateDeptForm({ name: "", code: "", description: "" });
            setShowCreateDeptModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Department</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start justify-between gap-3 text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start justify-between gap-3 text-xs text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#11161D] border border-[#202833] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#7E8997] mb-1">
            <span>Total Departments</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-[#F3F5F7]">{stats.total}</div>
        </div>

        <div className="bg-[#11161D] border border-[#202833] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#7E8997] mb-1">
            <span>Active Departments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
        </div>

        <div className="bg-[#11161D] border border-[#202833] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#7E8997] mb-1">
            <span>Managers Assigned</span>
            <UserCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-[#F3F5F7]">
            {stats.withManager} <span className="text-xs font-normal text-[#566171]">/ {stats.total}</span>
          </div>
        </div>

        <div className="bg-[#11161D] border border-[#202833] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#7E8997] mb-1">
            <span>Total Staff Count</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-[#F3F5F7]">{stats.totalEmployees}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#11161D] border border-[#202833] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#566171] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by department name, code, manager..."
            className="w-full bg-[#0D1117] border border-[#202833] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "ALL"
                ? "bg-indigo-600 text-white"
                : "bg-[#18202A] text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            All ({departments.length})
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "ACTIVE"
                ? "bg-indigo-600 text-white"
                : "bg-[#18202A] text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setStatusFilter("INACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "INACTIVE"
                ? "bg-indigo-600 text-white"
                : "bg-[#18202A] text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            Inactive ({stats.total - stats.active})
          </button>
          <button
            onClick={() => setStatusFilter("UNASSIGNED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === "UNASSIGNED"
                ? "bg-indigo-600 text-white"
                : "bg-[#18202A] text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            Unassigned ({stats.total - stats.withManager})
          </button>
        </div>
      </div>

      {/* Departments Table / Cards */}
      {loading ? (
        <div className="bg-[#11161D] border border-[#202833] rounded-2xl p-12 text-center text-xs text-[#7E8997]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          <span>Loading department records...</span>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="bg-[#11161D] border border-[#202833] rounded-2xl p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-[#566171] mx-auto" />
          <h3 className="text-base font-bold text-[#F3F5F7]">No Departments Found</h3>
          <p className="text-xs text-[#7E8997] max-w-md mx-auto">
            {search
              ? "No departments match your current search query."
              : "No business departments have been configured yet. Click '+ Create Department' to add one."}
          </p>
        </div>
      ) : (
        <div className="bg-[#11161D] border border-[#202833] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#202833] bg-[#0E131A] text-[11px] font-bold uppercase tracking-wider text-[#7E8997]">
                  <th className="py-3.5 px-4">Department &amp; Code</th>
                  <th className="py-3.5 px-4">Assigned Manager</th>
                  <th className="py-3.5 px-4">Staff Members</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A222C] text-xs">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-[#151C24] transition-colors">
                    {/* Department Name & Code */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-mono font-bold text-indigo-400">
                          {dept.code}
                        </div>
                        <div>
                          <span className="font-bold text-[#F3F5F7] block">{dept.name}</span>
                          <span className="text-[11px] text-[#7E8997] truncate max-w-xs block">
                            {dept.description || "No description provided"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Manager */}
                    <td className="py-4 px-4">
                      {dept.manager ? (
                        <div>
                          <span className="font-semibold text-[#F3F5F7] flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            {dept.manager.name}
                          </span>
                          <span className="text-[11px] text-[#7E8997] font-mono block">
                            {dept.manager.email}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Staff Members */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-[#F3F5F7] font-semibold">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        {dept.employeeCount || 0} employees
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          dept.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dept.status === "ACTIVE" ? "bg-emerald-400" : "bg-red-400"}`} />
                        {dept.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!dept.managerId ? (
                          <button
                            onClick={() => {
                              setSelectedDept(dept);
                              setCreateManagerForm({
                                name: "",
                                email: "",
                                designation: `${dept.name} Manager`,
                                phone: "",
                                password: "",
                              });
                              setShowCreateManagerModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/25 text-[11px] font-semibold transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Create Manager</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevokeManager(dept)}
                            className="p-1.5 rounded-lg text-[#7E8997] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Revoke Manager Access"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedDept(dept);
                            setEditDeptForm({
                              name: dept.name,
                              code: dept.code,
                              description: dept.description || "",
                              status: dept.status,
                              managerId: dept.managerId || "",
                            });
                            setShowEditDeptModal(true);
                          }}
                          className="p-1.5 rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1E2530] transition-colors"
                          title="Edit Department Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal 1: Create Department ───────────────────────────────────── */}
      {showCreateDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#29313B] pb-3">
              <h2 className="text-base font-bold text-[#F3F5F7] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Create New Department
              </h2>
              <button
                onClick={() => setShowCreateDeptModal(false)}
                className="text-[#7E8997] hover:text-[#F3F5F7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
              <strong>Notice:</strong> Creating a department does NOT automatically provision a manager account. Manager accounts are created separately.
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">
                  Department Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createDeptForm.name}
                  onChange={(e) => setCreateDeptForm({ ...createDeptForm, name: e.target.value })}
                  placeholder="e.g. Engineering, Marketing, Finance"
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">
                  Department Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createDeptForm.code}
                  onChange={(e) => setCreateDeptForm({ ...createDeptForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ENG, MKT, FIN"
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] uppercase font-mono placeholder-[#566171] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={createDeptForm.description}
                  onChange={(e) => setCreateDeptForm({ ...createDeptForm, description: e.target.value })}
                  placeholder="Responsibilities, mission, and scope of this department..."
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#29313B]">
                <button
                  type="button"
                  onClick={() => setShowCreateDeptModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#202833] text-[#A7B0BC] hover:text-[#F3F5F7] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Department</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Create Department Manager Account ──────────────────── */}
      {showCreateManagerModal && selectedDept && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#29313B] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#F3F5F7] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  Provision Department Manager
                </h2>
                <p className="text-[11px] text-[#7E8997]">
                  Creating manager credentials for <strong className="text-white">{selectedDept.name}</strong> ({selectedDept.code})
                </p>
              </div>
              <button
                onClick={() => setShowCreateManagerModal(false)}
                className="text-[#7E8997] hover:text-[#F3F5F7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
              <strong>Security Protocol:</strong> The manager will receive the <code>DEPARTMENT_MANAGER</code> role scoped strictly to {selectedDept.name}. They will be required to change their password upon first login.
            </div>

            <form onSubmit={handleCreateManagerAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">
                  Manager Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createManagerForm.name}
                  onChange={(e) => setCreateManagerForm({ ...createManagerForm, name: e.target.value })}
                  placeholder="e.g. Rachel Adams"
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">
                  Work Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={createManagerForm.email}
                  onChange={(e) => setCreateManagerForm({ ...createManagerForm, email: e.target.value })}
                  placeholder="e.g. rachel.adams@axivon.dev"
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A7B0BC] font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={createManagerForm.designation}
                    onChange={(e) => setCreateManagerForm({ ...createManagerForm, designation: e.target.value })}
                    placeholder="e.g. Head of Engineering"
                    className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[#A7B0BC] font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={createManagerForm.phone}
                    onChange={(e) => setCreateManagerForm({ ...createManagerForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] placeholder-[#566171] focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">
                  Temporary Initial Password <span className="text-[#566171] font-normal">(optional, auto-generated if left blank)</span>
                </label>
                <input
                  type="text"
                  value={createManagerForm.password}
                  onChange={(e) => setCreateManagerForm({ ...createManagerForm, password: e.target.value })}
                  placeholder="Leave empty for secure auto-generated password"
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] font-mono placeholder-[#566171] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#29313B]">
                <button
                  type="button"
                  onClick={() => setShowCreateManagerModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#202833] text-[#A7B0BC] hover:text-[#F3F5F7] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Provision Manager Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 3: Edit Department Details ─────────────────────────────── */}
      {showEditDeptModal && selectedDept && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#29313B] pb-3">
              <h2 className="text-base font-bold text-[#F3F5F7] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-400" />
                Edit Department: {selectedDept.name}
              </h2>
              <button
                onClick={() => setShowEditDeptModal(false)}
                className="text-[#7E8997] hover:text-[#F3F5F7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={editDeptForm.name}
                  onChange={(e) => setEditDeptForm({ ...editDeptForm, name: e.target.value })}
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  value={editDeptForm.code}
                  onChange={(e) => setEditDeptForm({ ...editDeptForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] uppercase font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">Status</label>
                <select
                  value={editDeptForm.status}
                  onChange={(e) => setEditDeptForm({ ...editDeptForm, status: e.target.value as any })}
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="ACTIVE">ACTIVE (Operational)</option>
                  <option value="INACTIVE">INACTIVE (Soft Deactivated)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A7B0BC] font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDeptForm.description}
                  onChange={(e) => setEditDeptForm({ ...editDeptForm, description: e.target.value })}
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3.5 py-2.5 text-[#F3F5F7] focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#29313B]">
                <button
                  type="button"
                  onClick={() => setShowEditDeptModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#202833] text-[#A7B0BC] hover:text-[#F3F5F7] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

