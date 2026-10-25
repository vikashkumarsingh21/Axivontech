import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireBroker, apiSuccess, handleApiError } from "@/lib/api/broker";

export async function GET(req: NextRequest) {
  try {
    const { brokerProfile, session } = await requireBroker(req);
    const userId = session.userId;
    const brokerId = brokerProfile.id;
    const referralCode = brokerProfile.referralCode;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Run parallel aggregated queries
    const [
      userRecord,
      allLeads,
      allProjects,
      allCommissions,
      pendingContracts,
      pendingPayments,
      allDocuments,
      unreadNotificationsCount,
      recentActivities,
      upcomingMilestones,
      brokerExtSetting,
    ] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
      }),
      db.lead.findMany({
        where: {
          OR: [
            { ownerId: userId },
            ...(referralCode ? [{ qualificationNotes: { contains: `[Referral: ${referralCode}]` } }] : []),
          ],
        },
        select: {
          id: true,
          name: true,
          companyName: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.partnerProject.findMany({
        where: { brokerProfileId: brokerId },
        select: {
          id: true,
          projectCode: true,
          projectName: true,
          clientName: true,
          status: true,
          progressPercentage: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      db.commission.findMany({
        where: { brokerProfileId: brokerId },
        select: {
          id: true,
          commissionAmount: true,
          status: true,
          paidAt: true,
        },
      }),
      db.partnerContract.findMany({
        where: {
          partnerProject: { brokerProfileId: brokerId },
          status: { in: ["SENT", "DOWNLOADED"] },
        },
        select: { id: true, status: true, partnerProjectId: true },
      }),
      db.partnerPayment.findMany({
        where: {
          partnerProject: { brokerProfileId: brokerId },
          status: { in: ["PENDING", "REJECTED"] },
        },
        select: {
          id: true,
          advanceAmount: true,
          status: true,
          rejectionReason: true,
          partnerProjectId: true,
        },
      }),
      db.partnerDocument.findMany({
        where: {
          OR: [{ brokerProfileId: brokerId }, { brokerProfileId: null }],
        },
        select: { id: true, brokerProfileId: true, isRead: true },
      }),
      db.notification.count({
        where: { userId, isRead: false },
      }),
      db.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          action: true,
          resource: true,
          details: true,
          createdAt: true,
        },
      }),
      db.partnerProjectMilestone.findMany({
        where: {
          partnerProject: { brokerProfileId: brokerId },
          status: { not: "COMPLETED" },
          isClientVisible: true,
        },
        include: {
          partnerProject: { select: { projectCode: true, projectName: true } },
        },
        orderBy: { targetDate: "asc" },
        take: 5,
      }),
      db.organizationSetting.findUnique({
        where: { key: `broker_ext:${brokerId}` },
      }),
    ]);

    // 1. Leads breakdown
    const totalLeads = allLeads.length;
    let activeLeads = 0;
    let convertedLeads = 0;
    for (const l of allLeads) {
      if (l.status === "CONVERTED") {
        convertedLeads++;
      } else if (l.status !== "LOST") {
        activeLeads++;
      }
    }

    // 2. Projects breakdown by status
    const projectCounts: Record<string, number> = {
      TOTAL: allProjects.length,
      PENDING_REVIEW: 0,
      APPROVED: 0,
      CONTRACT_SIGNED: 0,
      PAYMENT_SUBMITTED: 0,
      PROJECT_CONFIRMED: 0,
      IN_PROGRESS: 0,
      DELIVERED: 0,
      COMPLETED: 0,
      REJECTED: 0,
    };
    for (const p of allProjects) {
      if (projectCounts[p.status] !== undefined) {
        projectCounts[p.status]++;
      }
    }

    // 3. Earnings breakdown
    let totalEarned = 0;
    let eligibleAmount = 0;
    let pendingAmount = 0;
    let requestedAmount = 0;
    let thisMonthEarned = 0;

    for (const c of allCommissions) {
      const amt = c.commissionAmount || 0;
      if (c.status === "PAID") {
        totalEarned += amt;
        if (c.paidAt) {
          const pDate = new Date(c.paidAt);
          if (pDate.getFullYear() === currentYear && pDate.getMonth() === currentMonth) {
            thisMonthEarned += amt;
          }
        }
      } else if (c.status === "ELIGIBLE") {
        eligibleAmount += amt;
      } else if (c.status === "PENDING") {
        pendingAmount += amt;
      } else if (c.status === "REQUESTED" || c.status === "PROCESSING" || c.status === "APPROVED") {
        requestedAmount += amt;
      }
    }

    // 4. Onboarding Checklist & Pending Actions
    const extData = (brokerExtSetting?.value as any) || {};
    const hasProfileDetails = Boolean(
      userRecord?.phone && brokerProfile.city && brokerProfile.state
    );
    const hasPayoutDetails = Boolean(
      extData.payoutDetails &&
        ((extData.payoutDetails.method === "BANK" && extData.payoutDetails.accountNumber) ||
          (extData.payoutDetails.method === "UPI" && extData.payoutDetails.upiId))
    );
    const hasAcceptedTerms = Boolean(extData.termsAcceptedAt);
    const hasKyc = Boolean(extData.pan || extData.gstin);

    const missingOnboardingSteps: string[] = [];
    if (!hasProfileDetails) missingOnboardingSteps.push("Complete profile & contact info");
    if (!hasPayoutDetails) missingOnboardingSteps.push("Set up bank or UPI payout account");
    if (!hasAcceptedTerms) missingOnboardingSteps.push("Accept Business Partner Agreement terms");
    if (!hasKyc) missingOnboardingSteps.push("Provide PAN or GST identity details");

    const onboardingComplete = missingOnboardingSteps.length === 0;

    // Read status for broadcast documents
    let broadcastReads: Record<string, string> = {};
    try {
      const readRec = await db.organizationSetting.findUnique({
        where: { key: `doc_reads:${brokerId}` },
      });
      if (readRec?.value && typeof readRec.value === "object") {
        broadcastReads = readRec.value as Record<string, string>;
      }
    } catch {
      broadcastReads = {};
    }

    let unreadDocsCount = 0;
    for (const d of allDocuments) {
      const isRead =
        d.brokerProfileId === brokerId ? d.isRead : Boolean(broadcastReads[d.id]);
      if (!isRead) unreadDocsCount++;
    }

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "axivon.dev";
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const baseUrl = `${protocol}://${host}`;

    return apiSuccess({
      profile: {
        id: brokerProfile.id,
        partnerId: brokerProfile.partnerId,
        name: userRecord?.name,
        email: userRecord?.email,
        phone: userRecord?.phone,
        avatarUrl: userRecord?.avatarUrl,
        referralCode: brokerProfile.referralCode,
        onboardingComplete,
        missingOnboardingSteps,
      },
      stats: {
        leads: {
          total: totalLeads,
          active: activeLeads,
          converted: convertedLeads,
        },
        projects: projectCounts,
        earnings: {
          totalEarned,
          eligible: eligibleAmount,
          pending: pendingAmount,
          requested: requestedAmount,
          thisMonth: thisMonthEarned,
        },
      },
      pendingActions: {
        contractsToSignCount: pendingContracts.length,
        paymentProofsNeededCount: pendingPayments.length,
        unreadDocumentsCount: unreadDocsCount,
        unreadNotificationsCount,
        contracts: pendingContracts,
        payments: pendingPayments,
      },
      referral: {
        code: referralCode,
        leadReferralUrl: referralCode ? `${baseUrl}/lead/${referralCode}` : null,
        projectStartUrl: referralCode ? `${baseUrl}/project/start/${referralCode}` : null,
        totalReferredLeads: totalLeads,
        convertedReferredLeads: convertedLeads,
      },
      recentLeads: allLeads.slice(0, 5),
      recentProjects: allProjects.slice(0, 5),
      upcomingMilestones: upcomingMilestones.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        targetDate: m.targetDate,
        projectCode: m.partnerProject?.projectCode,
        projectName: m.partnerProject?.projectName,
      })),
      recentActivity: recentActivities,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
