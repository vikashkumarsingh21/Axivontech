import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser, apiError } from "@/lib/api/foundation";
import {
  hasProjectLibraryWriteAccess,
  sanitizeForExcel,
} from "@/lib/project-library/permissions";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    const userContext = await getSessionUser(req);
    const userRole = userContext.role;
    const canWrite = hasProjectLibraryWriteAccess(userRole);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const industry = searchParams.get("industry")?.trim() || "";

    const where: any = { isArchived: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }
    if (industry && industry !== "ALL") {
      where.industry = { contains: industry, mode: "insensitive" };
    }

    const projects: any[] = await db.projectLibraryItem.findMany({
      where,
      orderBy: { completionDate: "desc" },
      include: canWrite
        ? {
            assets: true,
            documents: true,
          }
        : undefined,
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Axivon Technologies — Project Library System";
    workbook.lastModifiedBy = userContext.name;
    workbook.created = new Date();
    workbook.modified = new Date();

    if (!canWrite) {
      // ─────────────────────────────────────────────────────────────
      // RESTRICTED EXCEL EXPORT FOR READ-ONLY USERS (BROKER, EMPLOYEE, ETC.)
      // Server-side strict restriction: exactly 1 sheet with ONLY 4 columns
      // ─────────────────────────────────────────────────────────────
      const sheet = workbook.addWorksheet("Completed Projects", {
        views: [{ state: "frozen", ySplit: 1 }],
      });

      sheet.columns = [
        { header: "Project Name", key: "name", width: 35 },
        { header: "Industry / Field", key: "industry", width: 28 },
        { header: "Live Website URL", key: "liveUrl", width: 45 },
        { header: "Completion Date", key: "completionDate", width: 20 },
      ];

      // Format header row
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" }, // Slate-900
      };
      headerRow.alignment = { vertical: "middle", horizontal: "left" };
      headerRow.height = 28;

      projects.forEach((p) => {
        const row = sheet.addRow({
          name: sanitizeForExcel(p.name),
          industry: sanitizeForExcel(p.industry),
          liveUrl: sanitizeForExcel(p.liveUrl || "N/A"),
          completionDate: p.completionDate
            ? new Date(p.completionDate).toISOString().split("T")[0]
            : "N/A",
        });

        // Add hyperlink to URL cell if valid
        if (p.liveUrl && p.liveUrl.startsWith("http")) {
          const cell = row.getCell("liveUrl");
          cell.value = {
            text: sanitizeForExcel(p.liveUrl),
            hyperlink: p.liveUrl,
          };
          cell.font = { color: { argb: "FF2563EB" }, underline: true };
        }
      });

      sheet.autoFilter = "A1:D1";
    } else {
      // ─────────────────────────────────────────────────────────────
      // FULL PROFESSIONAL WORKBOOK FOR AUTHORIZED WRITE USERS
      // 4 Structured Sheets: Summary, Details, Timeline, Resources
      // ─────────────────────────────────────────────────────────────

      // Sheet 1: Project Summary
      const sheetSummary = workbook.addWorksheet("Project Summary", {
        views: [{ state: "frozen", ySplit: 1 }],
      });
      sheetSummary.columns = [
        { header: "Project ID", key: "id", width: 28 },
        { header: "Project Name", key: "name", width: 35 },
        { header: "Client / Company", key: "client", width: 28 },
        { header: "Industry", key: "industry", width: 24 },
        { header: "Project Type", key: "projectType", width: 28 },
        { header: "Status", key: "status", width: 16 },
        { header: "Completion Date", key: "completionDate", width: 18 },
        { header: "Live Website URL", key: "liveUrl", width: 45 },
      ];

      const hRow1 = sheetSummary.getRow(1);
      hRow1.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      hRow1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
      hRow1.alignment = { vertical: "middle", horizontal: "left" };
      hRow1.height = 28;

      // Sheet 2: Project Details
      const sheetDetails = workbook.addWorksheet("Project Details", {
        views: [{ state: "frozen", ySplit: 1 }],
      });
      sheetDetails.columns = [
        { header: "Project ID", key: "id", width: 28 },
        { header: "Project Overview", key: "overview", width: 45 },
        { header: "Business Requirements", key: "businessRequirement", width: 40 },
        { header: "Solution", key: "solution", width: 40 },
        { header: "Scope of Work", key: "scope", width: 35 },
        { header: "Deliverables", key: "deliverables", width: 35 },
        { header: "Features", key: "features", width: 40 },
        { header: "Technologies", key: "technologies", width: 35 },
        { header: "Frontend", key: "frontend", width: 25 },
        { header: "Backend", key: "backend", width: 25 },
        { header: "Database", key: "database", width: 25 },
        { header: "APIs & Integrations", key: "apis", width: 30 },
      ];

      const hRow2 = sheetDetails.getRow(1);
      hRow2.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      hRow2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
      hRow2.height = 28;

      // Sheet 3: Project Timeline
      const sheetTimeline = workbook.addWorksheet("Project Timeline", {
        views: [{ state: "frozen", ySplit: 1 }],
      });
      sheetTimeline.columns = [
        { header: "Project ID", key: "id", width: 28 },
        { header: "Project Name", key: "name", width: 32 },
        { header: "Start Date", key: "startDate", width: 18 },
        { header: "Completion Date", key: "completionDate", width: 18 },
        { header: "Project Status", key: "status", width: 16 },
        { header: "Created Date", key: "createdAt", width: 20 },
        { header: "Last Updated", key: "updatedAt", width: 20 },
      ];

      const hRow3 = sheetTimeline.getRow(1);
      hRow3.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      hRow3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
      hRow3.height = 28;

      // Sheet 4: Project Resources
      const sheetResources = workbook.addWorksheet("Project Resources", {
        views: [{ state: "frozen", ySplit: 1 }],
      });
      sheetResources.columns = [
        { header: "Project ID", key: "id", width: 28 },
        { header: "Project Name", key: "name", width: 32 },
        { header: "Resource Title", key: "resourceTitle", width: 30 },
        { header: "Resource Type", key: "resourceType", width: 20 },
        { header: "Resource Reference / URL", key: "resourceUrl", width: 45 },
      ];

      const hRow4 = sheetResources.getRow(1);
      hRow4.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      hRow4.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF475569" } };
      hRow4.height = 28;

      // Populate sheets with sanitized values
      projects.forEach((p: any) => {
        // Summary
        const sumRow = sheetSummary.addRow({
          id: sanitizeForExcel(p.id),
          name: sanitizeForExcel(p.name),
          client: sanitizeForExcel(p.clientCompany || p.clientName || "Axivon Technologies"),
          industry: sanitizeForExcel(p.industry),
          projectType: sanitizeForExcel(p.projectType || p.category),
          status: sanitizeForExcel(p.status),
          completionDate: p.completionDate
            ? new Date(p.completionDate).toISOString().split("T")[0]
            : "N/A",
          liveUrl: sanitizeForExcel(p.liveUrl || "N/A"),
        });
        if (p.liveUrl && p.liveUrl.startsWith("http")) {
          const cell = sumRow.getCell("liveUrl");
          cell.value = { text: sanitizeForExcel(p.liveUrl), hyperlink: p.liveUrl };
          cell.font = { color: { argb: "FF2563EB" }, underline: true };
        }

        // Details
        sheetDetails.addRow({
          id: sanitizeForExcel(p.id),
          overview: sanitizeForExcel(p.overview || p.shortDescription),
          businessRequirement: sanitizeForExcel(p.businessRequirement || "N/A"),
          solution: sanitizeForExcel(p.solutionDelivered || "N/A"),
          scope: sanitizeForExcel(p.scopeOfWork || "N/A"),
          deliverables: sanitizeForExcel(p.deliverables || "N/A"),
          features: sanitizeForExcel((p.features || []).join("; ")),
          technologies: sanitizeForExcel((p.technologies || []).join(", ")),
          frontend: sanitizeForExcel((p.frontendTech || []).join(", ")),
          backend: sanitizeForExcel((p.backendTech || []).join(", ")),
          database: sanitizeForExcel((p.databaseTech || []).join(", ")),
          apis: sanitizeForExcel((p.apisAndIntegrations || []).join(", ")),
        });

        // Timeline
        sheetTimeline.addRow({
          id: sanitizeForExcel(p.id),
          name: sanitizeForExcel(p.name),
          startDate: p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "N/A",
          completionDate: p.completionDate
            ? new Date(p.completionDate).toISOString().split("T")[0]
            : "N/A",
          status: sanitizeForExcel(p.status),
          createdAt: new Date(p.createdAt).toISOString().split("T")[0],
          updatedAt: new Date(p.updatedAt).toISOString().split("T")[0],
        });

        // Resources (only non-sensitive public assets and verified docs)
        (p.assets || []).forEach((a: any) => {
          sheetResources.addRow({
            id: sanitizeForExcel(p.id),
            name: sanitizeForExcel(p.name),
            resourceTitle: sanitizeForExcel(a.title),
            resourceType: sanitizeForExcel(`Asset: ${a.assetType}`),
            resourceUrl: sanitizeForExcel(a.url),
          });
        });

        (p.documents || []).forEach((d: any) => {
          sheetResources.addRow({
            id: sanitizeForExcel(p.id),
            name: sanitizeForExcel(p.name),
            resourceTitle: sanitizeForExcel(d.title),
            resourceType: sanitizeForExcel(`Document: ${d.fileType || "File"}`),
            resourceUrl: sanitizeForExcel(d.fileUrl),
          });
        });
      });

      sheetSummary.autoFilter = "A1:H1";
      sheetDetails.autoFilter = "A1:L1";
      sheetTimeline.autoFilter = "A1:G1";
      sheetResources.autoFilter = "A1:E1";
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Log audit event asynchronously
    db.projectLibraryAuditLog.create({
      data: {
        projectId: projects[0]?.id || "system",
        userId: userContext.id,
        userName: userContext.name,
        userRole,
        action: "EXCEL_EXPORTED",
        details: {
          projectCount: projects.length,
          scope: canWrite ? "FULL_EXCEL_WORKBOOK" : "RESTRICTED_READ_ONLY_SUMMARY",
        },
      },
    }).catch(() => {});

    const filename = canWrite
      ? `AxivonTech_Project_Library_Archive_${new Date().toISOString().split("T")[0]}.xlsx`
      : `AxivonTech_Completed_Projects_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return apiError("INTERNAL_ERROR", error.message || "Failed to generate Excel export", error.statusCode || 500);
  }
}
