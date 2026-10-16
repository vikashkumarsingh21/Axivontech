"use client";

import { useState } from "react";
import { FolderOpen, FileText, Download, Search, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  size: string;
  updatedAt: string;
}

export default function ClientDocumentsPage() {
  const [search, setSearch] = useState("");

  const sampleDocuments: DocumentItem[] = [
    {
      id: "doc-1",
      name: "Master Service Agreement (MSA) - Signed.pdf",
      category: "Legal & Contracts",
      size: "2.4 MB",
      updatedAt: "2026-10-01",
    },
    {
      id: "doc-2",
      name: "System Architecture & Security Specification.pdf",
      category: "Technical Specs",
      size: "5.1 MB",
      updatedAt: "2026-10-08",
    },
    {
      id: "doc-3",
      name: "Sprint 1 & 2 UAT Acceptance Signoff.pdf",
      category: "Deliverables",
      size: "1.2 MB",
      updatedAt: "2026-10-14",
    },
  ];

  const filteredDocs = sampleDocuments.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">
          Client Document Vault
        </h1>
        <p className="text-sm text-[#7E8997] mt-0.5">
          Access signed agreements, technical design documents, and project milestone deliverables.
        </p>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search documents by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="bg-[#151A21] border-[#29313B]">
        <CardContent className="p-0">
          {filteredDocs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={FolderOpen}
                title="No Documents Found"
                description="No documents match your query."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#A7B0BC]">
                <thead className="bg-[#101318]/80 text-[#7E8997] text-[11px] uppercase font-bold tracking-wider border-b border-[#29313B]">
                  <tr>
                    <th className="px-6 py-3.5">Document Name</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Size</th>
                    <th className="px-6 py-3.5">Date Modified</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530]">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#202833] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#F3F5F7]">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#A7B0BC] whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1B222B] text-[#A7B0BC] border border-[#29313B]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#7E8997] whitespace-nowrap font-mono">
                        {doc.size}
                      </td>
                      <td className="px-6 py-4 text-[#7E8997] whitespace-nowrap">
                        {doc.updatedAt}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Button variant="outline" size="sm">
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
