"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/employee/documents").then(res => res.json()).then(data => {
      if(data.success) setDocs(data.documents);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading documents...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Documents & Resources</h1>
      {docs.length === 0 ? <Card className="p-8 text-center text-gray-500 bg-[#0a0a0a]">No documents available.</Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d: any) => (
            <Card key={d.id} className="p-4 bg-[#0a0a0a] flex items-start gap-4">
              <FileText className="w-8 h-8 text-blue-400 shrink-0" />
              <div>
                <h3 className="text-white font-medium">{d.title}</h3>
                <p className="text-xs text-gray-500 mt-1 capitalize">{d.category.toLowerCase().replace('_', ' ')}</p>
                <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline mt-2 inline-block">View Document</a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
