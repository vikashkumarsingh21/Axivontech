"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, X, Edit2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  employeeId?: string | null;
  department?: string | null;
  designation?: string | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  inactiveAt?: string | null;
  requiredDailyHours?: number;
  joiningDate?: string;
  userRoles?: { role: { id: string; name: string } }[];
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Success / Error Banners
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Add Form Data
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    designation: "",
    phone: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    requiredDailyHours: 8,
  });

  // Edit Form Data
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    designation: "",
    phone: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    requiredDailyHours: 8,
  });

  // Fetch Employees from API
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/v1/admin/employees?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load employees");
      }

      setEmployees(data.data || []);
      setTotalPages(data.meta?.pages || 1);
      setTotalRecords(data.meta?.total || 0);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Open Add Modal
  const openAddModal = () => {
    setAddForm({
      name: "",
      email: "",
      password: "",
      employeeId: "",
      department: "",
      designation: "",
      phone: "",
      status: "ACTIVE",
      requiredDailyHours: 8,
    });
    setFormError("");
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditForm({
      name: emp.name || "",
      email: emp.email || "",
      password: "",
      employeeId: emp.employeeId || "",
      department: emp.department || "",
      designation: emp.designation || "",
      phone: emp.phone || "",
      status: emp.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      requiredDailyHours: emp.requiredDailyHours || 8,
    });
    setFormError("");
  };

  // Submit Add Employee
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const res = await fetch("/api/v1/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create employee");
      }

      setIsAddOpen(false);
      setFeedback({ type: "success", message: `Employee "${data.data.name}" created successfully!` });
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Edit Employee
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setFormError("");
    setFormLoading(true);

    try {
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        employeeId: editForm.employeeId || null,
        department: editForm.department || null,
        designation: editForm.designation || null,
        phone: editForm.phone || null,
        status: editForm.status,
        requiredDailyHours: editForm.requiredDailyHours,
      };

      if (editForm.password) {
        payload.password = editForm.password;
      }

      const res = await fetch(`/api/v1/admin/employees/${editingEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update employee");
      }

      setEditingEmployee(null);
      setFeedback({ type: "success", message: `Employee "${data.data.name}" updated successfully!` });
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Employees</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage workforce accounts, roles, and status ({totalRecords} total employees)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Filter / Search Bar */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, employee ID, or department..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-red-500/50"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            <button
              onClick={() => fetchEmployees()}
              title="Refresh list"
              className="p-2 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Code / ID</th>
                <th className="px-5 py-3.5">Department & Title</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                      Loading employee data...
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No employees found matching your search.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{emp.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{emp.email}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-300">
                      {emp.employeeId ? (
                        <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5">
                          {emp.employeeId}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white text-sm">{emp.department || "Unassigned"}</div>
                      <div className="text-xs text-gray-500">{emp.designation || "Employee"}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium">
                      {emp.userRoles?.map((ur) => ur.role.name).join(", ") || "EMPLOYEE"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          emp.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-white/10 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 bg-[#18181b]">
            <div>
              Page <span className="font-semibold text-white">{page}</span> of{" "}
              <span className="font-semibold text-white">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ADD EMPLOYEE MODAL */}
      {/* ============================================================ */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Add New Employee</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="m-6 mb-0 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="e.g. rahul@axivon.dev"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Employee Code / ID</label>
                  <input
                    type="text"
                    value={addForm.employeeId}
                    onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                    placeholder="e.g. EMP-102"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={addForm.designation}
                    onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                    placeholder="e.g. Full Stack Developer"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Daily Work Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={addForm.requiredDailyHours}
                    onChange={(e) => setAddForm({ ...addForm, requiredDailyHours: parseFloat(e.target.value) || 8 })}
                    placeholder="8"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Account Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm({ ...addForm, status: e.target.value as "ACTIVE" | "INACTIVE" })
                    }
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? "Saving Employee..." : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT EMPLOYEE MODAL */}
      {/* ============================================================ */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Employee</h2>
                <p className="text-xs text-gray-400">ID: {editingEmployee.id}</p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="m-6 mb-0 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    New Password <span className="text-gray-500">(Leave blank to keep unchanged)</span>
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Employee Code / ID</label>
                  <input
                    type="text"
                    value={editForm.employeeId}
                    onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Daily Work Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={editForm.requiredDailyHours}
                    onChange={(e) => setEditForm({ ...editForm, requiredDailyHours: parseFloat(e.target.value) || 8 })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value as "ACTIVE" | "INACTIVE" })
                    }
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? "Saving Changes..." : "Update Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
