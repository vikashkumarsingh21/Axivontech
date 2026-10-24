import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";
import { resolveDateRange, DateRangePreset } from "@/lib/bi/date-filters";
import { generateCsv, CsvColumn } from "@/lib/bi/csv-export";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession(req);
    const userId = session.userId;

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("reportType") || "leads";
    const preset = (searchParams.get("preset") as DateRangePreset) || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const { startDate, endDate } = resolveDateRange(preset, customStart, customEnd);

    let csvContent = "";
    const filename = `axivon_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    // 1. Leads Report (Requires admin:access)
    if (reportType === "leads") {
      await requirePermission(userId, "admin:access");
      const leads = await db.lead.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      const columns: CsvColumn<any>[] = [
        { header: "Lead Code", accessor: (r) => r.leadCode },
        { header: "Client Name", accessor: (r) => r.name },
        { header: "Email", accessor: (r) => r.email },
        { header: "Phone", accessor: (r) => r.phone || "N/A" },
        { header: "Company", accessor: (r) => r.companyName || "N/A" },
        { header: "Service Interest", accessor: (r) => r.serviceInterest || "General" },
        { header: "Source", accessor: (r) => r.source },
        { header: "Status", accessor: (r) => r.status },
        { header: "Qualification", accessor: (r) => r.qualificationStatus },
        { header: "Created At", accessor: (r) => r.createdAt.toISOString() },
      ];
      csvContent = generateCsv(leads, columns);
    }
    // 2. Projects Report (Requires admin:access)
    else if (reportType === "projects") {
      await requirePermission(userId, "admin:access");
      const projects = await db.partnerProject.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      const columns: CsvColumn<any>[] = [
        { header: "Project Code", accessor: (r) => r.projectCode },
        { header: "Project Name", accessor: (r) => r.projectName },
        { header: "Client Name", accessor: (r) => r.clientName },
        { header: "Company", accessor: (r) => r.companyName },
        { header: "Service", accessor: (r) => r.requiredService },
        { header: "Status", accessor: (r) => r.status },
        { header: "Budget", accessor: (r) => r.projectBudget },
        { header: "Final Value (INR)", accessor: (r) => r.finalProjectValue || 0 },
        { header: "Created At", accessor: (r) => r.createdAt.toISOString() },
      ];
      csvContent = generateCsv(projects, columns);
    }
    // 3. Partner Applications Report
    else if (reportType === "partners") {
      await requirePermission(userId, "admin:access");
      const apps = await db.businessPartnerApplication.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      const columns: CsvColumn<any>[] = [
        { header: "Application Code", accessor: (r) => r.applicationCode },
        { header: "Applicant Name", accessor: (r) => r.fullName },
        { header: "Email", accessor: (r) => r.email },
        { header: "Company", accessor: (r) => r.companyName || "N/A" },
        { header: "Business Type", accessor: (r) => r.businessType },
        { header: "Status", accessor: (r) => r.status },
        { header: "Created At", accessor: (r) => r.createdAt.toISOString() },
      ];
      csvContent = generateCsv(apps, columns);
    }
    // 4. Tasks Report
    else if (reportType === "tasks") {
      await requirePermission(userId, "admin:access");
      const tasks = await db.task.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      const columns: CsvColumn<any>[] = [
        { header: "Task ID", accessor: (r) => r.id },
        { header: "Title", accessor: (r) => r.title },
        { header: "Assignee", accessor: (r) => r.user?.name || "Unassigned" },
        { header: "Priority", accessor: (r) => r.priority },
        { header: "Status", accessor: (r) => r.status },
        { header: "Due Date", accessor: (r) => r.dueDate ? r.dueDate.toISOString().slice(0, 10) : "N/A" },
        { header: "Created At", accessor: (r) => r.createdAt.toISOString() },
      ];
      csvContent = generateCsv(tasks, columns);
    }
    // 5. Automation Audit Log
    else if (reportType === "automations") {
      await requirePermission(userId, "admin:access");
      const execs = await db.automationExecution.findMany({
        where: { executedAt: { gte: startDate, lte: endDate } },
        include: { automation: { select: { name: true, triggerType: true } } },
        orderBy: { executedAt: "desc" },
        take: 1000,
      });

      const columns: CsvColumn<any>[] = [
        { header: "Execution ID", accessor: (r) => r.id },
        { header: "Workflow Name", accessor: (r) => r.automation?.name || "Unknown" },
        { header: "Trigger Event", accessor: (r) => r.triggerEvent },
        { header: "Status", accessor: (r) => r.status },
        { header: "Dedup Key", accessor: (r) => r.dedupKey || "N/A" },
        { header: "Executed At", accessor: (r) => r.executedAt.toISOString() },
      ];
      csvContent = generateCsv(execs, columns);
    } else {
      throw new ApiError(400, `Unsupported report type: ${reportType}`);
    }

    // Log the export in AuditLog
    await db.auditLog.create({
      data: {
        userId,
        action: "REPORT_EXPORT_GENERATED",
        resource: reportType,
        details: { reportType, preset, startDate, endDate },
      },
    }).catch(() => {});

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
