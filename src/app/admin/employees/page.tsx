"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/employees")
      .then(r => r.json())
      .then(d => { setEmployees(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Employees</h1>
          <p className="text-gray-400 mt-1">Manage workforce and accounts.</p>
        </div>
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search employees..."
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center">No employees found.</td></tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3">{emp.department || '-'}</td>
                    <td className="px-4 py-3">{emp.userRoles?.map((ur: any) => ur.role.name).join(', ') || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${emp.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-400 hover:underline">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
