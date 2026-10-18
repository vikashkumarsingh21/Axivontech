"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface PaymentRecord {
  id: string;
  projectPrice: number;
  advancePercentage: number;
  advanceAmount: number;
  remainingAmount: number;
  currency: string;
  status: string;
  paymentMethod?: string | null;
  transactionId?: string | null;
  paymentDate?: string | null;
  verifiedAt?: string | null;
  partnerProject: {
    id: string;
    projectCode: string;
    projectName: string;
    companyName: string;
    status: string;
    contract?: {
      id: string;
      status: string;
      versions: Array<{
        id: string;
        versionNumber: number;
        contractFileUrl: string;
        signedFileUrl?: string | null;
        sentAt: string;
      }>;
    } | null;
  };
}

export default function ClientInvoicesPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/client/invoices")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setPayments(json.data);
        }
      })
      .catch((err) => console.error("Error loading client invoices:", err))
      .finally(() => setLoading(false));
  }, []);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="success">Verified & Cleared</Badge>;
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return <Badge variant="warning">Under Reconciliation</Badge>;
      case "PENDING":
        return <Badge variant="neutral">Pending Milestone</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Reconciliation Exception</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">
          Financial Engagements & Contract Records
        </h1>
        <p className="text-sm text-[#7E8997] mt-0.5">
          Review commercial contracts, payment schedules, and verified milestone disbursements.
        </p>
      </div>

      <Card className="bg-[#151A21] border-[#29313B]">
        <CardHeader className="border-b border-[#1E2530] pb-4">
          <CardTitle className="text-[#F3F5F7]">Payment Schedules & Disbursal Records</CardTitle>
          <CardDescription className="text-[#7E8997]">
            Authorized statements tied to contracted engineering projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-sm text-[#7E8997]">
              Loading financial records...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="No Billing Records"
                description="Financial schedules and payment acknowledgments will be listed here once agreements are verified."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#A7B0BC]">
                <thead className="bg-[#101318]/80 text-[#7E8997] text-[11px] uppercase font-bold tracking-wider border-b border-[#29313B]">
                  <tr>
                    <th className="px-6 py-3.5">Project</th>
                    <th className="px-6 py-3.5">Contract Value</th>
                    <th className="px-6 py-3.5">Advance Amount</th>
                    <th className="px-6 py-3.5">Balance Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Contract Agreement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530]">
                  {payments.map((p) => {
                    const latestContractVersion = p.partnerProject.contract?.versions?.[0];

                    return (
                      <tr key={p.id} className="hover:bg-[#202833] transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <span className="font-mono text-emerald-400 font-bold">
                              {p.partnerProject.projectCode}
                            </span>
                            <p className="font-semibold text-[#F3F5F7]">{p.partnerProject.projectName}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-[#F3F5F7]">
                          {p.currency} {p.projectPrice?.toLocaleString()}
                        </td>

                        <td className="px-6 py-4 font-mono text-[#A7B0BC]">
                          {p.currency} {p.advanceAmount?.toLocaleString()}{" "}
                          <span className="text-[10px] text-[#566171]">({p.advancePercentage}%)</span>
                        </td>

                        <td className="px-6 py-4 font-mono text-[#A7B0BC]">
                          {p.currency} {p.remainingAmount?.toLocaleString()}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(p.status)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {latestContractVersion ? (
                            <a
                              href={latestContractVersion.signedFileUrl || latestContractVersion.contractFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Agreement v{latestContractVersion.versionNumber}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-[#566171] italic">Not Dispatched</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
