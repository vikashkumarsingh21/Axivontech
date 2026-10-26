import { db } from "@/lib/db";
import { ColumnDefinition, AxivonExcelBuilder, buildCsvContent } from "./excel-builder";
import { format } from "date-fns";
export * from "./export-definitions";
import {
  ApplicationsExportFilters,
  ConfirmedPartnersExportFilters,
  ExportExecutionParams,
  APPLICATION_COLUMNS,
  CONFIRMED_PARTNER_COLUMNS,
  RELATED_LEADS_COLUMNS,
  RELATED_PROJECTS_COLUMNS,
  RELATED_COMMISSIONS_COLUMNS,
  RELATED_PAYMENTS_COLUMNS,
} from "./export-definitions";

// -----------------------------------------------------------------------------
// SENSITIVE MASKING HELPERS
// -----------------------------------------------------------------------------

function maskAccountNumber(acc?: string | null): string {
  if (!acc) return "";
  if (acc.length <= 4) return "••••" + acc;
  return "••••••••" + acc.slice(-4);
}

function maskUpi(upi?: string | null): string {
  if (!upi || !upi.includes("@")) return "";
  const [handle, domain] = upi.split("@");
  const visible = handle.slice(0, 2);
  return `${visible}•••@${domain}`;
}

function maskPan(pan?: string | null): string {
  if (!pan) return "";
  if (pan.length <= 4) return "••••";
  return `${pan.slice(0, 2)}••••••${pan.slice(-2)}`;
}

// -----------------------------------------------------------------------------
// DATA RETRIEVAL: APPLICATIONS
// -----------------------------------------------------------------------------

export async function fetchApplicationsData(params: {
  filters?: ApplicationsExportFilters;
  exportScope?: "ALL_MATCHING" | "SELECTED_IDS" | "LATEST_N";
  selectedIds?: string[];
  latestNCount?: number;
  takeLimit?: number;
  cursorId?: string;
}) {
  const { filters = {}, exportScope = "ALL_MATCHING", selectedIds = [], latestNCount, takeLimit = 1000, cursorId } = params;

  const where: any = {};

  if (exportScope === "SELECTED_IDS" && selectedIds.length > 0) {
    where.id = { in: selectedIds };
  } else {
    if (filters.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses };
    }
    if (filters.country) {
      where.country = { contains: filters.country, mode: "insensitive" };
    }
    if (filters.state) {
      where.state = { contains: filters.state, mode: "insensitive" };
    }
    if (filters.city) {
      where.city = { contains: filters.city, mode: "insensitive" };
    }
    if (filters.occupation) {
      where.occupation = { contains: filters.occupation, mode: "insensitive" };
    }
    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { applicationId: { contains: q, mode: "insensitive" } },
      ];
    }
    if (filters.dateFrom || filters.dateTo) {
      const dateKey = filters.dateField === "reviewedAt" ? "reviewedAt" : "createdAt";
      where[dateKey] = {};
      if (filters.dateFrom) where[dateKey].gte = new Date(filters.dateFrom);
      if (filters.dateTo) where[dateKey].lte = new Date(filters.dateTo);
    }
  }

  const queryOptions: any = {
    where,
    orderBy: { createdAt: "desc" },
    include: {
      reviewedBy: { select: { name: true, email: true } },
    },
  };

  if (exportScope === "LATEST_N" && latestNCount) {
    queryOptions.take = Math.min(Math.max(latestNCount, 1), 20000);
  } else {
    queryOptions.take = takeLimit;
    if (cursorId) {
      queryOptions.cursor = { id: cursorId };
      queryOptions.skip = 1;
    }
  }

  const applications = await db.businessPartnerApplication.findMany(queryOptions);
  return applications;
}

export function transformApplicationRow(app: any): Record<string, any> {
  const edu10 = (app.education10th as any) || {};
  const edu12 = (app.education12th as any) || {};
  const eduUG = (app.educationUndergrad as any) || {};

  return {
    applicationId: app.applicationId || "",
    status: app.status || "SUBMITTED",
    fullName: app.fullName || "",
    email: app.email || "",
    emailVerified: app.emailVerifiedAt ? "Verified" : "Unverified",
    phone: app.phone || "",
    country: app.country || "",
    state: app.state || "",
    city: app.city || "",
    occupation: app.occupation || "",
    currentWork: app.currentWork || "",
    yearsOfExperience: app.yearsOfExperience ?? "",
    relevantExperience: app.relevantExperience || "",
    clientNetwork: app.clientNetwork || "",
    edu10thSchool: edu10.school || "",
    edu10thBoard: edu10.board || "",
    edu10thYear: edu10.passingYear || "",
    edu10thScore: edu10.percentage || "",
    edu12thSchool: edu12.school || "",
    edu12thBoard: edu12.board || "",
    edu12thYear: edu12.passingYear || "",
    edu12thScore: edu12.percentage || "",
    eduUGDegree: eduUG.degree || "",
    eduUGBranch: eduUG.branch || "",
    eduUGCollege: eduUG.college || "",
    eduUGYear: eduUG.passingYear || "",
    motivation: app.motivation || "",
    contribution: app.contribution || "",
    additionalInfo: app.additionalInfo || "",
    decisionReason: app.decisionReason || "",
    reviewedBy: app.reviewedBy?.name || "",
    reviewedAt: app.reviewedAt || "",
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

// -----------------------------------------------------------------------------
// DATA RETRIEVAL: CONFIRMED PARTNERS
// -----------------------------------------------------------------------------

export async function fetchConfirmedPartnersData(params: {
  filters?: ConfirmedPartnersExportFilters;
  exportScope?: "ALL_MATCHING" | "SELECTED_IDS" | "LATEST_N";
  selectedIds?: string[];
  latestNCount?: number;
  singlePartnerIdOrUserId?: string;
  takeLimit?: number;
  cursorId?: string;
}) {
  const {
    filters = {},
    exportScope = "ALL_MATCHING",
    selectedIds = [],
    latestNCount,
    singlePartnerIdOrUserId,
    takeLimit = 1000,
    cursorId,
  } = params;

  const where: any = {
    // Confirmed partners have a BrokerProfile attached
    brokerProfile: { isNot: null },
  };

  if (singlePartnerIdOrUserId) {
    where.OR = [
      { id: singlePartnerIdOrUserId },
      { brokerProfile: { id: singlePartnerIdOrUserId } },
      { brokerProfile: { partnerId: singlePartnerIdOrUserId } },
    ];
  } else if (exportScope === "SELECTED_IDS" && selectedIds.length > 0) {
    where.OR = [
      { id: { in: selectedIds } },
      { brokerProfile: { id: { in: selectedIds } } },
    ];
  } else {
    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses };
    } else {
      where.status = "ACTIVE"; // Default confirmed partners are ACTIVE
    }

    if (filters.country) {
      where.brokerProfile.country = { contains: filters.country, mode: "insensitive" };
    }
    if (filters.state) {
      where.brokerProfile.state = { contains: filters.state, mode: "insensitive" };
    }
    if (filters.city) {
      where.brokerProfile.city = { contains: filters.city, mode: "insensitive" };
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { brokerProfile: { partnerId: { contains: q, mode: "insensitive" } } },
        { brokerProfile: { referralCode: { contains: q, mode: "insensitive" } } },
        { brokerProfile: { companyName: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }
  }

  const queryOptions: any = {
    where,
    orderBy: { createdAt: "desc" },
    include: {
      brokerProfile: {
        include: {
          commissions: true,
          partnerProjects: true,
        },
      },
      ownedLeads: true,
    },
  };

  if (exportScope === "LATEST_N" && latestNCount) {
    queryOptions.take = Math.min(Math.max(latestNCount, 1), 20000);
  } else {
    queryOptions.take = takeLimit;
    if (cursorId) {
      queryOptions.cursor = { id: cursorId };
      queryOptions.skip = 1;
    }
  }

  const users: any[] = await db.user.findMany(queryOptions);
  return users;
}

export async function transformConfirmedPartnerRow(
  user: any,
  extSettingsMap: Map<string, any>,
  sensitiveUnmasked: boolean = false
): Promise<Record<string, any>> {
  const bp = user.brokerProfile || {};
  const ext = extSettingsMap.get(bp.id) || {};
  const payout = ext.payoutDetails || {};

  // Financial aggregates
  const commissions: any[] = bp.commissions || [];
  let totalEarned = 0;
  let totalPaid = 0;
  let pendingCommission = 0;

  for (const c of commissions) {
    const amt = Number(c.commissionAmount) || 0;
    if (c.status === "PAID") {
      totalPaid += amt;
      totalEarned += amt;
    } else if (c.status === "APPROVED" || c.status === "ELIGIBLE") {
      totalEarned += amt;
      pendingCommission += amt;
    } else if (c.status === "PENDING") {
      pendingCommission += amt;
    }
  }

  const projects: any[] = bp.partnerProjects || [];
  const activeProjects = projects.filter((p) =>
    ["IN_PROGRESS", "PROJECT_CONFIRMED", "CONTRACT_SIGNED", "TECHNICAL_APPROVED"].includes(p.status)
  ).length;

  const leads: any[] = user.ownedLeads || [];

  // Onboarding & KYC calculation
  const hasProfile = !!(user.name && user.phone && bp.companyName && bp.city);
  const hasPayout = !!(ext.payoutMethod && (payout.accountNumber || payout.upiId));
  const hasKyc = !!(ext.panNumber || ext.kycDocuments?.panUrl);
  const termsAccepted = ext.termsAccepted === true;

  const completedCount = [hasProfile, hasPayout, hasKyc, termsAccepted].filter(Boolean).length;
  const onboardingPct = Math.round((completedCount / 4) * 100);
  const onboardingState = onboardingPct === 100 ? "COMPLETED" : `IN_PROGRESS (${onboardingPct}%)`;

  let kycStatus = "NOT_UPLOADED";
  if (ext.panNumber || ext.kycDocuments?.panUrl) {
    kycStatus = ext.kycVerified === true ? "VERIFIED" : "PENDING_REVIEW";
  }

  // Masking
  const pan = sensitiveUnmasked ? ext.panNumber || "" : maskPan(ext.panNumber);
  const accNum = sensitiveUnmasked ? payout.accountNumber || "" : maskAccountNumber(payout.accountNumber);
  const upiId = sensitiveUnmasked ? payout.upiId || "" : maskUpi(payout.upiId);

  return {
    partnerId: bp.partnerId || "",
    referralCode: bp.referralCode || "",
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    whatsapp: bp.whatsapp || "",
    status: user.status || "ACTIVE",
    companyName: bp.companyName || "",
    designation: bp.designation || "",
    website: bp.website || "",
    city: bp.city || "",
    state: bp.state || "",
    country: bp.country || "",
    address: user.address || "",
    onboardingState,
    termsAccepted: termsAccepted ? "YES" : "NO",
    termsAcceptedAt: ext.termsAcceptedAt ? new Date(ext.termsAcceptedAt) : "",
    kycStatus,
    panNumber: pan,
    gstNumber: ext.gstNumber || "",
    payoutMethod: ext.payoutMethod || "",
    accountHolder: payout.accountHolder || "",
    bankName: payout.bankName || "",
    accountNumber: accNum,
    ifsc: payout.ifsc || "",
    upiId,
    totalLeads: leads.length,
    activeProjects,
    totalProjects: projects.length,
    totalCommissionEarned: totalEarned,
    totalCommissionPaid: totalPaid,
    pendingCommission,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// -----------------------------------------------------------------------------
// LIVE PREVIEW SERVICE
// -----------------------------------------------------------------------------

export async function getExportPreview(params: {
  type: "APPLICATIONS" | "CONFIRMED_PARTNERS";
  filters?: any;
  exportScope?: "ALL_MATCHING" | "SELECTED_IDS" | "LATEST_N";
  selectedIds?: string[];
  latestNCount?: number;
}) {
  const { type, filters = {}, exportScope = "ALL_MATCHING", selectedIds = [], latestNCount } = params;

  if (type === "APPLICATIONS") {
    const rawApps = await fetchApplicationsData({
      filters,
      exportScope,
      selectedIds,
      latestNCount,
      takeLimit: 5,
    });

    const where: any = {};
    if (exportScope === "SELECTED_IDS" && selectedIds.length > 0) {
      where.id = { in: selectedIds };
    } else {
      if (filters.statuses && filters.statuses.length > 0) where.status = { in: filters.statuses };
      if (filters.country) where.country = { contains: filters.country, mode: "insensitive" };
      if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
      if (filters.search) {
        const q = filters.search.trim();
        where.OR = [
          { fullName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { applicationId: { contains: q, mode: "insensitive" } },
        ];
      }
    }
    const totalMatching = await db.businessPartnerApplication.count({ where });
    const previewRows = rawApps.map(transformApplicationRow);

    return { totalMatching, previewRows };
  } else {
    const rawUsers = await fetchConfirmedPartnersData({
      filters,
      exportScope,
      selectedIds,
      latestNCount,
      takeLimit: 5,
    });

    // Batch load extended settings for the preview
    const bpIds = rawUsers.map((u) => u.brokerProfile?.id).filter(Boolean) as string[];
    const extSettings = await db.organizationSetting.findMany({
      where: { key: { in: bpIds.map((id) => `broker_ext:${id}`) } },
    });
    const extMap = new Map<string, any>();
    extSettings.forEach((s) => {
      const bpId = s.key.replace("broker_ext:", "");
      extMap.set(bpId, s.value as any);
    });

    const where: any = { brokerProfile: { isNot: null } };
    if (exportScope === "SELECTED_IDS" && selectedIds.length > 0) {
      where.OR = [{ id: { in: selectedIds } }, { brokerProfile: { id: { in: selectedIds } } }];
    } else {
      if (filters.statuses && filters.statuses.length > 0) where.status = { in: filters.statuses };
      else where.status = "ACTIVE";
      if (filters.search) {
        const q = filters.search.trim();
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { brokerProfile: { partnerId: { contains: q, mode: "insensitive" } } },
        ];
      }
    }
    const totalMatching = await db.user.count({ where });

    const previewRows = await Promise.all(
      rawUsers.map((u) => transformConfirmedPartnerRow(u, extMap, false))
    );

    return { totalMatching, previewRows };
  }
}

// -----------------------------------------------------------------------------
// MAIN WORKFLOW: GENERATE EXCEL / CSV STREAM
// -----------------------------------------------------------------------------

export async function generatePartnersExportFile(params: ExportExecutionParams): Promise<{
  buffer: Buffer | string;
  contentType: string;
  fileName: string;
  rowCount: number;
}> {
  const {
    type,
    partnerIdOrUserId,
    filters = {},
    columns: requestedColumns,
    format: exportFormat = "xlsx",
    exportScope = "ALL_MATCHING",
    selectedIds = [],
    latestNCount,
    includeRelatedData = false,
    sensitiveUnmasked = false,
    requestedBy,
  } = params;

  const istTimestamp = format(new Date(), "yyyy-MM-dd_HHmm");
  const istReadable = format(new Date(), "yyyy-MM-dd HH:mm:ss 'IST'");

  const builder = new AxivonExcelBuilder();
  let totalRows = 0;
  let finalFileName = "";

  if (type === "APPLICATIONS") {
    finalFileName = `axivon-partner-applications_${istTimestamp}.${exportFormat}`;

    // Select columns
    const columnsToUse = requestedColumns && requestedColumns.length > 0
      ? APPLICATION_COLUMNS.filter((c) => requestedColumns.includes(c.key))
      : APPLICATION_COLUMNS;

    // Batch fetch (cap at 20,000)
    const MAX_ROWS = 20000;
    const allRows: Array<Record<string, any>> = [];
    let cursorId: string | undefined = undefined;
    const batchSize = 1000;

    while (allRows.length < MAX_ROWS) {
      const batch = await fetchApplicationsData({
        filters: filters as ApplicationsExportFilters,
        exportScope,
        selectedIds,
        latestNCount: exportScope === "LATEST_N" ? latestNCount : undefined,
        takeLimit: batchSize,
        cursorId,
      });

      if (batch.length === 0) break;

      for (const app of batch) {
        allRows.push(transformApplicationRow(app));
        if (allRows.length >= MAX_ROWS) break;
      }

      if (exportScope === "LATEST_N" && latestNCount && allRows.length >= latestNCount) break;
      if (batch.length < batchSize) break;
      cursorId = batch[batch.length - 1].id;
    }

    totalRows = allRows.length;

    if (exportFormat === "csv") {
      const csvStr = buildCsvContent(columnsToUse, allRows);
      return {
        buffer: csvStr,
        contentType: "text/csv; charset=utf-8",
        fileName: finalFileName,
        rowCount: totalRows,
      };
    }

    // Add Summary sheet
    builder.addSummarySheet({
      title: "Business Partner Applications Register",
      generatedBy: `${requestedBy.name} (${requestedBy.email})`,
      generatedAt: istReadable,
      exportType: "Partner Applications (Prospective)",
      filtersUsed: {
        Scope: exportScope,
        Statuses: (filters as ApplicationsExportFilters).statuses || "ALL",
        Search: (filters as ApplicationsExportFilters).search || "None",
        Country: (filters as ApplicationsExportFilters).country || "All",
        City: (filters as ApplicationsExportFilters).city || "All",
      },
      totalRows,
      isMasked: true,
      notes: totalRows >= MAX_ROWS ? ["Export volume reached maximum server cap of 20,000 rows."] : [],
    });

    // Add Data Sheet
    builder.addDataSheet("Data", columnsToUse, allRows);
    const buffer = await builder.writeToBuffer();

    return {
      buffer,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileName: finalFileName,
      rowCount: totalRows,
    };
  } else {
    // CONFIRMED_PARTNERS or SINGLE_PARTNER
    const isSingle = type === "SINGLE_PARTNER";
    finalFileName = isSingle
      ? `axivon-partner-dossier_${istTimestamp}.${exportFormat}`
      : `axivon-partners-confirmed_${istTimestamp}.${exportFormat}`;

    const columnsToUse = requestedColumns && requestedColumns.length > 0
      ? CONFIRMED_PARTNER_COLUMNS.filter((c) => requestedColumns.includes(c.key))
      : CONFIRMED_PARTNER_COLUMNS;

    const MAX_ROWS = 20000;
    const allRows: Array<Record<string, any>> = [];
    const allUsers: any[] = [];
    let cursorId: string | undefined = undefined;
    const batchSize = 500;

    while (allRows.length < MAX_ROWS) {
      const batch = await fetchConfirmedPartnersData({
        filters: filters as ConfirmedPartnersExportFilters,
        exportScope,
        selectedIds,
        latestNCount: exportScope === "LATEST_N" ? latestNCount : undefined,
        singlePartnerIdOrUserId: partnerIdOrUserId,
        takeLimit: batchSize,
        cursorId,
      });

      if (batch.length === 0) break;

      // Parallel fetch extended settings for this batch
      const bpIds = batch.map((u) => u.brokerProfile?.id).filter(Boolean) as string[];
      const extSettings = await db.organizationSetting.findMany({
        where: { key: { in: bpIds.map((id) => `broker_ext:${id}`) } },
      });
      const extMap = new Map<string, any>();
      extSettings.forEach((s) => {
        const bpId = s.key.replace("broker_ext:", "");
        extMap.set(bpId, s.value as any);
      });

      for (const user of batch) {
        allRows.push(await transformConfirmedPartnerRow(user, extMap, sensitiveUnmasked));
        allUsers.push(user);
        if (allRows.length >= MAX_ROWS) break;
      }

      if (isSingle) break;
      if (exportScope === "LATEST_N" && latestNCount && allRows.length >= latestNCount) break;
      if (batch.length < batchSize) break;
      cursorId = batch[batch.length - 1].id;
    }

    totalRows = allRows.length;

    if (exportFormat === "csv") {
      const csvStr = buildCsvContent(columnsToUse, allRows);
      return {
        buffer: csvStr,
        contentType: "text/csv; charset=utf-8",
        fileName: finalFileName,
        rowCount: totalRows,
      };
    }

    // Add Summary sheet
    builder.addSummarySheet({
      title: isSingle ? "Business Partner Dossier & Performance Audit" : "Confirmed Business Partners Register",
      generatedBy: `${requestedBy.name} (${requestedBy.email})`,
      generatedAt: istReadable,
      exportType: isSingle ? "Single Partner Dossier" : "Confirmed Partners (Brokers)",
      filtersUsed: {
        Scope: isSingle ? `Single Partner (${partnerIdOrUserId})` : exportScope,
        Statuses: (filters as ConfirmedPartnersExportFilters).statuses || "ACTIVE",
        Search: (filters as ConfirmedPartnersExportFilters).search || "None",
        KYC: (filters as ConfirmedPartnersExportFilters).kycStatus || "ALL",
        Onboarding: (filters as ConfirmedPartnersExportFilters).onboardingState || "ALL",
      },
      totalRows,
      isMasked: !sensitiveUnmasked,
      notes: sensitiveUnmasked
        ? ["SENSITIVE FINANCIAL & TAX IDENTIFIERS UNMASKED UNDER EXPLICIT ADMIN AUTHORIZATION."]
        : [],
    });

    // Add Main Data Sheet
    builder.addDataSheet("Data", columnsToUse, allRows);

    // If related data is requested or single partner detailed export
    if (includeRelatedData || isSingle) {
      const brokerProfileIds = allUsers.map((u) => u.brokerProfile?.id).filter(Boolean) as string[];
      const userIds = allUsers.map((u) => u.id);

      // 1. Leads
      const leads = await db.lead.findMany({
        where: { ownerId: { in: userIds } },
        orderBy: { createdAt: "desc" },
        take: 10000,
      });
      const leadRows = leads.map((l) => ({
        leadCode: l.leadCode,
        partnerIdentifier: l.ownerId,
        name: l.name,
        email: l.email,
        phone: l.phone || "",
        companyName: l.companyName || "",
        serviceInterest: l.serviceInterest || "",
        status: l.status,
        qualificationStatus: l.qualificationStatus,
        budget: l.budget || 0,
        createdAt: l.createdAt,
      }));
      builder.addDataSheet("Leads", RELATED_LEADS_COLUMNS, leadRows);

      // 2. Projects
      const projects = await db.partnerProject.findMany({
        where: { brokerProfileId: { in: brokerProfileIds } },
        orderBy: { createdAt: "desc" },
        take: 10000,
      });
      const projectRows = projects.map((p) => ({
        projectCode: p.projectCode,
        projectName: p.projectName,
        partnerIdentifier: p.brokerProfileId || "",
        clientName: p.clientName,
        clientEmail: p.clientEmail,
        companyName: p.companyName,
        requiredService: p.requiredService,
        projectBudget: p.projectBudget,
        finalProjectValue: p.finalProjectValue || 0,
        status: p.status,
        qaStatus: p.qaStatus || "N/A",
        progressPercentage: p.progressPercentage,
        startedAt: p.startedAt || "",
        completedAt: p.completedAt || "",
      }));
      builder.addDataSheet("Projects", RELATED_PROJECTS_COLUMNS, projectRows);

      // 3. Commissions
      const commissions = await db.commission.findMany({
        where: { brokerProfileId: { in: brokerProfileIds } },
        include: { partnerProject: { select: { projectCode: true } } },
        orderBy: { createdAt: "desc" },
        take: 10000,
      });
      const commissionRows = commissions.map((c) => ({
        id: c.id,
        partnerIdentifier: c.brokerProfileId,
        projectCode: c.partnerProject?.projectCode || "",
        projectValue: c.projectValue,
        commissionType: c.commissionType,
        commissionRate: c.commissionRate || 0,
        commissionAmount: c.commissionAmount,
        status: c.status,
        approvedAt: c.approvedAt || "",
        paidAt: c.paidAt || "",
        payoutReference: c.payoutReference || "",
        createdAt: c.createdAt,
      }));
      builder.addDataSheet("Commissions", RELATED_COMMISSIONS_COLUMNS, commissionRows);

      // 4. Payouts (PartnerPayment)
      const projectIds = projects.map((p) => p.id);
      const payments = await db.partnerPayment.findMany({
        where: { partnerProjectId: { in: projectIds } },
        include: { partnerProject: { select: { projectCode: true } } },
        orderBy: { createdAt: "desc" },
        take: 10000,
      });
      const paymentRows = payments.map((pay) => ({
        id: pay.id,
        projectCode: pay.partnerProject?.projectCode || "",
        projectPrice: pay.projectPrice,
        advanceAmount: pay.advanceAmount,
        remainingAmount: pay.remainingAmount,
        paymentMethod: pay.paymentMethod || "BANK",
        amountPaid: pay.amountPaid || 0,
        transactionId: pay.transactionId || "",
        paymentDate: pay.paymentDate || "",
        status: pay.status,
        createdAt: pay.createdAt,
      }));
      builder.addDataSheet("Payouts", RELATED_PAYMENTS_COLUMNS, paymentRows);
    }

    const buffer = await builder.writeToBuffer();
    return {
      buffer,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileName: finalFileName,
      rowCount: totalRows,
    };
  }
}
