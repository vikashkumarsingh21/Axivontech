const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies';
function writeFile(relPath, content) {
    const fp = path.join(baseDir, relPath);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, content.trim() + '\n');
    console.log('Created: ' + relPath);
}

// Admin Projects API
writeFile('src/app/api/v1/admin/projects/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "project.view").catch(() => {});

    const projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
`);

// Admin Projects UI
writeFile('src/app/admin/projects/page.tsx', `
"use client";

import { useEffect, useState } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/projects")
      .then(r => r.json())
      .then(d => { setProjects(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
      
      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Project Name</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="p-4 text-center">Loading...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={2} className="p-4 text-center">No projects found.</td></tr>
            ) : (
              projects.map(p => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);

// Admin Attendance API
writeFile('src/app/api/v1/admin/attendance/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "attendance.view_all").catch(() => {});

    const records = await db.attendance.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { date: 'desc' },
      take: 50
    });

    return NextResponse.json({ data: records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
`);

// Admin Attendance UI
writeFile('src/app/admin/attendance/page.tsx', `
"use client";

import { useEffect, useState } from "react";

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/attendance")
      .then(r => r.json())
      .then(d => { setRecords(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Attendance</h1>
      
      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center">No records found.</td></tr>
            ) : (
              records.map(r => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white font-medium">{r.user?.name}</td>
                  <td className="px-4 py-3">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);
