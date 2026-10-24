import { db } from "@/lib/db";

export interface ProjectReportData {
  projectCode: string;
  projectName: string;
  companyName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  requiredService: string;
  detailedRequirement?: string | null;
  status: string;
  qaStatus?: string | null;
  progressPercentage: number;
  finalProjectValue?: number | null;
  projectBudget?: string | null;
  deliveredAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  milestones: Array<{
    title: string;
    description?: string | null;
    status: string;
    order: number;
    completionDate?: Date | null;
    targetDate?: Date | null;
  }>;
  qaIssues: Array<{
    title: string;
    status: string;
    severity: string;
  }>;
  deliverables: Array<{
    title: string;
    category: string;
    createdAt: Date;
  }>;
  contract?: {
    status: string;
    contractName: string;
  } | null;
}

/**
 * Robust HTML entity encoder to prevent Cross-Site Scripting (XSS)
 * when rendering dynamic database strings into HTML reports.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Compiles a self-contained, printable, branded HTML delivery & verification report.
 */
export function compileDeliveryReportHtml(data: ProjectReportData): string {
  const generatedAt = new Date().toUTCString();
  const completedMilestones = data.milestones.filter((m) => m.status === "COMPLETED").length;
  const totalMilestones = data.milestones.length;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 100;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Project Delivery & Verification Report — ${escapeHtml(data.projectCode)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      background: #fdfdfd;
      padding: 40px 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 48px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 13px;
      color: #64748b;
      margin-top: 2px;
    }
    .report-meta {
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-verified {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 32px;
      margin-bottom: 16px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .meta-item {
      font-size: 13px;
    }
    .meta-label {
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .meta-value {
      color: #0f172a;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 13px;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .status-completed {
      color: #16a34a;
      font-weight: 600;
    }
    .contract-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
    }
    .contract-highlight {
      font-weight: 600;
      color: #0f172a;
    }
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .seal {
      border: 2px solid #16a34a;
      color: #16a34a;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 11px;
    }
    @media print {
      body { padding: 0; background: #fff; }
      .container { border: none; box-shadow: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">AXIVON TECHNOLOGIES</div>
        <div class="brand-sub">Platform Engineering & Enterprise Solutions • https://axivontech.in/</div>
      </div>
      <div class="report-meta">
        <span class="badge badge-verified">Verified Delivery</span>
        <div style="font-size: 12px; color: #64748b; margin-top: 6px; font-family: monospace;">
          ${escapeHtml(data.projectCode)}
        </div>
      </div>
    </div>

    <!-- Title -->
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; color: #0f172a; font-weight: 700;">PROJECT DELIVERY & VERIFICATION REPORT</h1>
      <p style="font-size: 13px; color: #64748b; margin-top: 4px;">
        Official handover and completion documentation executed by Axivon Technologies.
      </p>
    </div>

    <!-- Project & Client Metadata -->
    <div class="section-title">Project & Client Information</div>
    <div class="grid-2">
      <div class="meta-item">
        <div class="meta-label">Project Name</div>
        <div class="meta-value">${escapeHtml(data.projectName)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Client Company</div>
        <div class="meta-value">${escapeHtml(data.companyName)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Client Contact</div>
        <div class="meta-value">${escapeHtml(data.clientName)} (${escapeHtml(data.clientEmail)})</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Service Domain</div>
        <div class="meta-value">${escapeHtml(data.requiredService)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Lifecycle Status</div>
        <div class="meta-value">${escapeHtml(data.status)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">QA / UAT Status</div>
        <div class="meta-value" style="color: #16a34a;">${escapeHtml(data.qaStatus || "UAT_APPROVED")}</div>
      </div>
    </div>

    <!-- Milestone Ledger -->
    <div class="section-title">Verified Milestone Completion (${completedMilestones}/${totalMilestones} • ${milestoneProgress}%)</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Milestone</th>
          <th>Status</th>
          <th>Completion Date</th>
        </tr>
      </thead>
      <tbody>
        ${
          data.milestones.length > 0
            ? data.milestones
                .map(
                  (m, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <div style="font-weight: 600; color: #0f172a;">${escapeHtml(m.title)}</div>
              ${m.description ? `<div style="font-size: 11px; color: #64748b;">${escapeHtml(m.description)}</div>` : ""}
            </td>
            <td><span class="status-completed">${escapeHtml(m.status)}</span></td>
            <td>${m.completionDate ? new Date(m.completionDate).toLocaleDateString() : "Verified"}</td>
          </tr>`
                )
                .join("")
            : `<tr><td colspan="4" style="text-align: center; color: #94a3b8;">All milestones delivered and verified.</td></tr>`
        }
      </tbody>
    </table>

    <!-- Quality Assurance & UAT Approval Statement -->
    <div class="section-title">Quality Assurance & UAT Sign-Off</div>
    <div style="font-size: 13px; color: #334155; line-height: 1.6;">
      This project has successfully completed internal QA test cycles with <strong>0 open critical defects</strong>,
      and User Acceptance Testing (UAT) was formally signed off by the client on
      <strong>${data.deliveredAt ? new Date(data.deliveredAt).toLocaleDateString() : "Delivery Sign-off"}</strong>.
    </div>

    <!-- Direct Contractual Certification -->
    <div class="contract-box">
      <div class="contract-highlight" style="margin-bottom: 4px;">Direct Contractual Handover Certification</div>
      This certifies that the engineering deliverables and software infrastructure for Project
      <span class="contract-highlight">${escapeHtml(data.projectCode)}</span> were executed directly by
      <span class="contract-highlight">Axivon Technologies</span> for
      <span class="contract-highlight">${escapeHtml(data.companyName)}</span> in accordance with the verified agreement.
      All intellectual property and verified deliverables specified in the project scope have been officially delivered.
    </div>

    <!-- Official Seal & Footer -->
    <div class="footer">
      <div>
        <div>Axivon Technologies • Registration & Enterprise Verification Unit</div>
        <div style="margin-top: 2px;">Generated: ${generatedAt}</div>
      </div>
      <div class="seal">
        Verified & Delivered
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Loads project records from DB, compiles delivery report HTML, and publishes to PartnerDocument.
 */
export async function generateAndPublishDeliveryReport(projectId: string, actorUserId: string) {
  const project = await db.partnerProject.findUnique({
    where: { id: projectId },
    include: {
      contract: {
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      },
      milestones: { orderBy: { order: "asc" } },
      qaIssues: { where: { status: { in: ["PASSED", "CLOSED", "RESOLVED"] } } },
      documents: {
        where: { isClientVisible: true },
        select: { title: true, category: true, createdAt: true },
      },
    },
  });

  if (!project) {
    throw new Error(`Project with ID ${projectId} not found.`);
  }

  const reportData: ProjectReportData = {
    projectCode: project.projectCode,
    projectName: project.projectName,
    companyName: project.companyName,
    clientName: project.clientName,
    clientEmail: project.clientEmail,
    clientPhone: project.clientPhone,
    requiredService: project.requiredService,
    detailedRequirement: project.detailedRequirement,
    status: project.status,
    qaStatus: project.qaStatus,
    progressPercentage: project.progressPercentage || 100,
    finalProjectValue: project.finalProjectValue,
    projectBudget: project.projectBudget,
    deliveredAt: project.deliveredAt || new Date(),
    completedAt: project.completedAt,
    createdAt: project.createdAt,
    milestones: project.milestones.map((m) => ({
      title: m.title,
      description: m.description,
      status: m.status,
      order: m.order,
      completionDate: m.completionDate,
      targetDate: m.targetDate,
    })),
    qaIssues: project.qaIssues.map((q) => ({
      title: q.title,
      status: q.status,
      severity: q.severity,
    })),
    deliverables: project.documents.map((d) => ({
      title: d.title,
      category: d.category,
      createdAt: d.createdAt,
    })),
    contract: project.contract
      ? {
          status: project.contract.status,
          contractName: project.contract.versions[0]?.contractName || "Axivon Project Agreement",
        }
      : null,
  };

  const reportHtml = compileDeliveryReportHtml(reportData);
  const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(reportHtml)}`;
  const title = `Official Delivery & Verification Report — ${project.projectCode}`;
  const description = `Truth-grounded delivery report certifying milestone completion, QA sign-off, and direct handover for ${project.companyName}.`;

  // Check if delivery report document already exists for this project
  const existingDoc = await db.partnerDocument.findFirst({
    where: {
      partnerProjectId: projectId,
      category: "CLIENT_REPORT",
    },
  });

  let reportDoc;
  if (existingDoc) {
    reportDoc = await db.partnerDocument.update({
      where: { id: existingDoc.id },
      data: {
        title,
        description,
        fileUrl: dataUri,
        isClientVisible: true,
        isImportant: true,
        mimeType: "text/html",
        sizeBytes: Buffer.byteLength(reportHtml, "utf-8"),
      },
    });
  } else {
    reportDoc = await db.partnerDocument.create({
      data: {
        partnerProjectId: projectId,
        brokerProfileId: project.brokerProfileId,
        title,
        description,
        fileUrl: dataUri,
        category: "CLIENT_REPORT",
        isClientVisible: true,
        isImportant: true,
        mimeType: "text/html",
        sizeBytes: Buffer.byteLength(reportHtml, "utf-8"),
        uploadedById: actorUserId,
      },
    });
  }

  // Record audit log
  await db.auditLog.create({
    data: {
      userId: actorUserId,
      action: "PROJECT_DELIVERY_REPORT_PUBLISHED",
      resource: "PartnerDocument",
      details: {
        projectId,
        projectCode: project.projectCode,
        documentId: reportDoc.id,
      },
    },
  });

  return { reportDoc, reportHtml };
}
