"use client";

import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";

export default function ExecutivePeoplePage() {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/v1/executive/people?search=" + encodeURIComponent(search))
      .then((r) => r.json())
      .then((d) => {
        setPeople(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Executive People Directory</h1>
      <p className="text-gray-400 text-sm">Company-wide workforce directory with scope enforcement.</p>

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search directory..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Department</th>
              <th className="px-5 py-3.5">Designation</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center">Loading directory...</td></tr>
            ) : people.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center">No people found.</td></tr>
            ) : (
              people.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">{p.name}<div className="text-xs text-gray-500">{p.email}</div></td>
                  <td className="px-5 py-4">{p.department || "-"}</td>
                  <td className="px-5 py-4">{p.designation || "-"}</td>
                  <td className="px-5 py-4 text-xs">{p.userRoles?.map((ur: any) => ur.role.name).join(", ")}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${p.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
