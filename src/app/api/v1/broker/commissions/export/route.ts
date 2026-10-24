import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, handleApiError } from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile } = await requireBroker(req);
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    const where: any = {
      brokerProfileId: brokerProfile.id,
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    const commissions = await db.commission.findMany({
      where,
      include: {
        partnerProject: { select: { projectCode: true, projectName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV content
    const headers = [
      "Commission ID",
      "Project Code",
      "Project Name",
      "Project Value (INR)",
      "Commission Type",
      "Rate (%)",
      "Gross Amount (INR)",
      "TDS Rate (%)",
      "TDS Deducted (INR)",
      "Net Payable (INR)",
      "Status",
      "Payout Method",
      "Bank / UTR Reference",
      "Settlement Date",
      "Created Date",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = commissions.map((c) => {
      const gross = c.commissionAmount || 0;
      const tdsRate = 5;
      const tds = Math.round(((gross * tdsRate) / 100) * 100) / 100;
      const net = Math.round((gross - tds) * 100) / 100;

      return [
        escapeCsv(c.id),
        escapeCsv(c.partnerProject?.projectCode || ""),
        escapeCsv(c.partnerProject?.projectName || ""),
        escapeCsv(c.projectValue || 0),
        escapeCsv(c.commissionType),
        escapeCsv(c.commissionRate || ""),
        escapeCsv(gross),
        escapeCsv(tdsRate),
        escapeCsv(tds),
        escapeCsv(net),
        escapeCsv(c.status),
        escapeCsv(c.payoutMethod || ""),
        escapeCsv(c.payoutReference || ""),
        escapeCsv(c.paidAt ? new Date(c.paidAt).toISOString().split("T")[0] : ""),
        escapeCsv(new Date(c.createdAt).toISOString().split("T")[0]),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const dateStamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const fileName = `commission_statement_${brokerProfile.referralCode || "broker"}_${dateStamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
