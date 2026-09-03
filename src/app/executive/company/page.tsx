"use client";

import { useEffect, useState } from "react";
import { Building2, Users } from "lucide-react";

export default function CompanyOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/executive/company/overview")
      .then((r) => r.json())
      .then((d) => {
        setData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Company Overview</h1>
      <p className="text-gray-400 text-sm">Department headcount & organizational structure.</p>

      {loading ? (
        <div className="text-gray-500">Loading company overview...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Department Headcount</h2>
            <div className="space-y-3">
              {data?.departmentBreakdown?.map((item: any) => (
                <div key={item.department} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl">
                  <span className="text-sm font-medium text-white">{item.department}</span>
                  <span className="text-sm font-bold text-amber-400">{item.count} employees</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Account Status Distribution</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl">
                <span className="text-sm font-medium text-green-400">Active Accounts</span>
                <span className="text-sm font-bold text-white">{data?.statusCounts?.ACTIVE || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl">
                <span className="text-sm font-medium text-gray-400">Inactive Accounts</span>
                <span className="text-sm font-bold text-white">{data?.statusCounts?.INACTIVE || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
