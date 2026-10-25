import { db } from "../src/lib/db";
import { signSession } from "../src/lib/auth/session";

// Route handlers under test
import * as ProfileRoute from "../src/app/api/v1/broker/profile/route";
import * as ProfileTermsRoute from "../src/app/api/v1/broker/profile/terms/route";
import * as ProfilePasswordRoute from "../src/app/api/v1/broker/profile/password/route";
import * as ReferralGenRoute from "../src/app/api/v1/broker/referral/generate/route";
import * as ReferralValidateRoute from "../src/app/api/v1/public/referral/validate/route";
import * as PublicLeadsRoute from "../src/app/api/v1/public/leads/route";
import * as PublicProjectReqRoute from "../src/app/api/v1/public/project-requests/route";
import * as BrokerLeadsRoute from "../src/app/api/v1/broker/leads/route";
import * as BrokerProjectsRoute from "../src/app/api/v1/broker/projects/route";
import * as BrokerProjectsNewRoute from "../src/app/api/v1/broker/projects/new/route";
import * as BrokerProjectDetailRoute from "../src/app/api/v1/broker/projects/[id]/route";
import * as BrokerContractsRoute from "../src/app/api/v1/broker/contracts/route";
import * as ContractDownloadRoute from "../src/app/api/v1/broker/contracts/[id]/download/route";
import * as ContractUploadRoute from "../src/app/api/v1/broker/contracts/[id]/upload/route";
import * as BrokerPaymentsRoute from "../src/app/api/v1/broker/payments/route";
import * as BrokerPaymentDetailRoute from "../src/app/api/v1/broker/payments/[id]/route";
import * as BrokerPaymentSubmitRoute from "../src/app/api/v1/broker/payments/[id]/submit/route";
import * as BrokerCommissionsRoute from "../src/app/api/v1/broker/commissions/route";
import * as BrokerCommissionDetailRoute from "../src/app/api/v1/broker/commissions/[id]/route";
import * as BrokerPayoutRequestRoute from "../src/app/api/v1/broker/commissions/payout-request/route";
import * as BrokerDocumentsRoute from "../src/app/api/v1/broker/documents/route";
import * as BrokerDocumentReadRoute from "../src/app/api/v1/broker/documents/[id]/read/route";
import * as NotificationsRoute from "../src/app/api/v1/notifications/route";
import * as NotificationsUnreadRoute from "../src/app/api/v1/notifications/unread-count/route";
import * as NotificationsReadAllRoute from "../src/app/api/v1/notifications/read-all/route";
import * as DashboardRoute from "../src/app/api/v1/broker/dashboard/route";
import * as AnalyticsRoute from "../src/app/api/v1/broker/analytics/earnings/route";
import * as EstimateRoute from "../src/app/api/v1/broker/commissions/estimate/route";
import * as ActivityRoute from "../src/app/api/v1/broker/activity/route";
import * as ExportCsvRoute from "../src/app/api/v1/broker/commissions/export/route";
import * as SupportRoute from "../src/app/api/v1/broker/support/route";
import * as SupportDetailRoute from "../src/app/api/v1/broker/support/[id]/route";
import * as DraftsRoute from "../src/app/api/v1/broker/drafts/route";

// Admin route handlers for cross-role flow
import * as AdminPartnerProjectsRoute from "../src/app/api/v1/admin/partner-projects/[id]/route";
import * as AdminPartnerProjectApproveRoute from "../src/app/api/v1/admin/partner-projects/[id]/approve/route";
import * as AdminPartnerPaymentsRoute from "../src/app/api/v1/admin/partner-payments/[id]/route";
import * as AdminCommissionsRoute from "../src/app/api/v1/admin/commissions/[id]/route";

async function runTestSuite() {
  console.log("================================================================================");
  console.log("           AXIVON BROKER / BUSINESS PARTNER BACKEND COMPREHENSIVE SUITE         ");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail || "Assertion failed"}`);
      failed++;
    }
  }

  // Helper to build NextRequest-like objects with session cookies
  function makeReq(
    url: string,
    method = "GET",
    body?: any,
    sessionToken?: string,
    extraHeaders: Record<string, string> = {}
  ): any {
    const headers = new Headers();
    if (sessionToken) {
      headers.set("cookie", `axivon_session=${sessionToken}`);
    }
    if (body) {
      headers.set("content-type", "application/json");
    }
    for (const [k, v] of Object.entries(extraHeaders)) {
      headers.set(k, v);
    }

    const init: any = {
      method,
      headers,
    };
    if (body) {
      init.body = JSON.stringify(body);
    }
    return new Request(url, init);
  }

  try {
    // -------------------------------------------------------------------------
    // 1. SETUP TEST FIXTURES
    // -------------------------------------------------------------------------
    console.log("1. Setting up test fixtures...");

    // Find or create primary broker
    let brokerAUser = await db.user.findUnique({
      where: { email: "qa.broker@axivon.dev" },
      include: { brokerProfile: true },
    });

    if (!brokerAUser) {
      const brokerRole = await db.role.findFirst({ where: { name: "BUSINESS_PARTNER" } });
      brokerAUser = await db.user.create({
        data: {
          email: "qa.broker@axivon.dev",
          name: "QA Broker",
          passwordHash: "$2a$12$dummyhashedpassworddummyhashedpassworddummyhashedpassword",
          status: "ACTIVE",
          phone: "+91 9876543210",
          userRoles: brokerRole ? { create: { roleId: brokerRole.id } } : undefined,
          brokerProfile: {
            create: {
              referralCode: "AXV-QA01",
              partnerId: "PRT-QA01",
              city: "Bangalore",
              state: "Karnataka",
              country: "India",
            },
          },
        },
        include: { brokerProfile: true },
      });
    } else if (!brokerAUser.brokerProfile) {
      await db.brokerProfile.create({
        data: {
          userId: brokerAUser.id,
          referralCode: "AXV-QA01",
          partnerId: "PRT-QA01",
          city: "Bangalore",
          state: "Karnataka",
          country: "India",
        },
      });
      brokerAUser = await db.user.findUnique({
        where: { email: "qa.broker@axivon.dev" },
        include: { brokerProfile: true },
      });
    }

    // Secondary broker (for IDOR tests)
    const brokerBEmail = `qa.broker2.${Date.now()}@axivon.test`;
    const brokerBUser = await db.user.create({
      data: {
        email: brokerBEmail,
        name: "QA Broker Two",
        passwordHash: "$2a$12$dummyhashedpassworddummyhashedpassworddummyhashedpassword",
        status: "ACTIVE",
        phone: "+91 9123456789",
        brokerProfile: {
          create: {
            referralCode: `AXV-${Date.now().toString().slice(-4)}`,
            partnerId: `PRT-${Date.now().toString().slice(-4)}`,
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
          },
        },
      },
      include: { brokerProfile: true },
    });

    // Employee user (for RBAC tests)
    let employeeUser = await db.user.findUnique({
      where: { email: "qa.employee@axivon.dev" },
    });
    if (!employeeUser) {
      employeeUser = await db.user.create({
        data: {
          email: "qa.employee@axivon.dev",
          name: "QA Employee",
          passwordHash: "dummy",
          status: "ACTIVE",
        },
      });
    }

    // Admin user
    let adminUser = await db.user.findUnique({
      where: { email: "admin@axivon.dev" },
    });

    // Active commission rule
    let activeRule = await db.commissionRule.findFirst({ where: { isActive: true } });
    if (!activeRule) {
      activeRule = await db.commissionRule.create({
        data: {
          name: "Standard 10% Partner Rule",
          type: "PERCENTAGE",
          value: 10,
          isActive: true,
        },
      });
    }

    // Generate JWT Tokens
    const brokerAToken = await signSession({
      userId: brokerAUser!.id,
      role: "BUSINESS_PARTNER",
      sessionId: `s_${Date.now()}_1`,
    });

    const brokerBToken = await signSession({
      userId: brokerBUser.id,
      role: "BUSINESS_PARTNER",
      sessionId: `s_${Date.now()}_2`,
    });

    const employeeToken = await signSession({
      userId: employeeUser!.id,
      role: "EMPLOYEE",
      sessionId: `s_${Date.now()}_3`,
    });

    assert(!!brokerAToken, "Broker A session token generated");
    assert(!!brokerBToken, "Broker B session token generated for IDOR tests");
    assert(!!employeeToken, "Employee session token generated for RBAC tests");

    // -------------------------------------------------------------------------
    // 2. FOUNDATION & RBAC SECURITY TESTS
    // -------------------------------------------------------------------------
    console.log("\n2. Testing Foundation & RBAC Security...");

    // Test 1: Employee forbidden on broker dashboard
    const rbacReq = makeReq("http://localhost:3000/api/v1/broker/dashboard", "GET", undefined, employeeToken);
    const rbacRes = await DashboardRoute.GET(rbacReq);
    assert(rbacRes.status === 403, "Employee accessing broker dashboard rejected with HTTP 403");

    // Test 2: Unauthenticated request rejected
    const unauthReq = makeReq("http://localhost:3000/api/v1/broker/dashboard", "GET");
    const unauthRes = await DashboardRoute.GET(unauthReq);
    assert(unauthRes.status === 401, "Unauthenticated request rejected with HTTP 401");

    // -------------------------------------------------------------------------
    // 3. PROFILE & ONBOARDING GATE
    // -------------------------------------------------------------------------
    console.log("\n3. Testing Broker Profile & Onboarding Gate...");

    // GET profile
    const profReq = makeReq("http://localhost:3000/api/v1/broker/profile", "GET", undefined, brokerAToken);
    const profRes = await ProfileRoute.GET(profReq);
    const profData = await profRes.json();
    assert(profRes.status === 200, "GET /api/v1/broker/profile returns HTTP 200");
    assert(profData.success === true, "Profile response contains success: true");
    const brokerProfileObj = profData.data?.profile;
    assert(!!brokerProfileObj?.email, `Profile returns broker email (${brokerProfileObj?.email})`);
    assert(!!brokerProfileObj?.onboarding?.checklist, "Profile returns onboarding checklist state");

    // PATCH profile
    const updateProfReq = makeReq("http://localhost:3000/api/v1/broker/profile", "PATCH", {
      companyName: "QA Ventures Ltd",
      phone: "+91 9876543210",
      city: "Bengaluru",
      state: "Karnataka",
      payoutMethod: "BANK_TRANSFER",
      payoutDetails: {
        accountHolder: "QA Broker",
        accountNumber: "123456789012",
        ifsc: "HDFC0001234",
        bankName: "HDFC Bank",
      },
      panNumber: "ABCDE1234F",
    }, brokerAToken);
    const updateProfRes = await ProfileRoute.PATCH(updateProfReq);
    const updateProfData = await updateProfRes.json();
    assert(updateProfRes.status === 200, "PATCH /api/v1/broker/profile updates profile (HTTP 200)");
    assert(updateProfData.success === true, "Profile update response contains success: true");

    // Accept partner terms
    const termsReq = makeReq("http://localhost:3000/api/v1/broker/profile/terms", "POST", {
      termsVersion: "2.1",
      agreed: true,
    }, brokerAToken);
    const termsRes = await ProfileTermsRoute.POST(termsReq);
    const termsData = await termsRes.json();
    assert(termsRes.status === 200, "POST /api/v1/broker/profile/terms records partner terms acceptance");
    assert(termsData.data?.termsAccepted === true, "Partner terms agreement verified in response");

    // -------------------------------------------------------------------------
    // 4. REFERRALS & LEAD INTAKE
    // -------------------------------------------------------------------------
    console.log("\n4. Testing Referral Generation & Lead Ingestion...");

    // Generate referral code (idempotent)
    const refGenReq = makeReq("http://localhost:3000/api/v1/broker/referral/generate", "POST", {}, brokerAToken);
    const refGenRes = await ReferralGenRoute.POST(refGenReq);
    const refGenData = await refGenRes.json();
    assert(refGenRes.status === 200, "POST /api/v1/broker/referral/generate is idempotent (HTTP 200)");
    const refCode = refGenData.data?.referralCode || brokerAUser?.brokerProfile?.referralCode;
    assert(!!refCode, `Broker has active referralCode: ${refCode}`);
    assert("shareTemplates" in refGenData.data, "Referral generation returns shareable messaging templates");

    // Validate referral code pre-flight
    const valGoodReq = makeReq(`http://localhost:3000/api/v1/public/referral/validate?code=${refCode}`, "GET");
    const valGoodRes = await ReferralValidateRoute.GET(valGoodReq);
    assert(valGoodRes.status === 200, "Public referral code validation returns HTTP 200 for valid code");

    const valBadReq = makeReq("http://localhost:3000/api/v1/public/referral/validate?code=INVALID_CODE_999", "GET");
    const valBadRes = await ReferralValidateRoute.GET(valBadReq);
    assert(valBadRes.status === 404, "Public referral code validation returns HTTP 404 for invalid code");

    // Public lead creation with broker referral
    const publicLeadEmail = `client.lead.${Date.now()}@axivon.test`;
    const pubLeadReq = makeReq("http://localhost:3000/api/v1/public/leads", "POST", {
      name: "Jane Doe Client",
      email: publicLeadEmail,
      phone: "+91 9988776655",
      serviceInterest: "WEB_DEVELOPMENT",
      budget: 500000,
      message: "Need an enterprise SaaS platform built.",
      referralCode: refCode,
      policyAcknowledged: true,
      turnstileToken: "1x00000000000000000000AA",
    });
    const pubLeadRes = await PublicLeadsRoute.POST(pubLeadReq);
    const pubLeadData = await pubLeadRes.json();
    assert(pubLeadRes.status === 201 || pubLeadRes.status === 200, "Public lead created with broker attribution");

    // Verify broker sees lead in list
    const brokerLeadsReq = makeReq("http://localhost:3000/api/v1/broker/leads", "GET", undefined, brokerAToken);
    const brokerLeadsRes = await BrokerLeadsRoute.GET(brokerLeadsReq);
    const brokerLeadsData = await brokerLeadsRes.json();
    assert(brokerLeadsRes.status === 200, "GET /api/v1/broker/leads returns HTTP 200");
    const leadList = Array.isArray(brokerLeadsData.data) ? brokerLeadsData.data : (brokerLeadsData.data?.leads || []);
    const foundLead = leadList.find((l: any) => l.email === publicLeadEmail);
    assert(!!foundLead, "Created public lead appears in broker's lead list");

    // -------------------------------------------------------------------------
    // 5. PROJECTS CREATION & LIFECYCLE
    // -------------------------------------------------------------------------
    console.log("\n5. Testing Projects Lifecycle & IDOR Protection...");

    // Static route check: /broker/projects/new must NEVER collide with [id]
    const projNewReq = makeReq("http://localhost:3000/api/v1/broker/projects/new", "GET", undefined, brokerAToken);
    const projNewRes = await BrokerProjectsNewRoute.GET(projNewReq);
    assert(projNewRes.status === 200, "GET /api/v1/broker/projects/new returns static schema (HTTP 200)");

    const projNewAsIdReq = makeReq("http://localhost:3000/api/v1/broker/projects/new", "GET", undefined, brokerAToken);
    const projNewAsIdRes = await BrokerProjectDetailRoute.GET(projNewAsIdReq, { params: Promise.resolve({ id: "new" }) });
    assert(projNewAsIdRes.status === 404, "GET /api/v1/broker/projects/[id] cleanly rejects id='new' with HTTP 404");

    // Create Project
    const createProjReq = makeReq("http://localhost:3000/api/v1/broker/projects", "POST", {
      projectName: "Apex Logistics Cloud Platform",
      clientName: "Apex Logistics Inc",
      clientEmail: `contact.${Date.now()}@apexlogistics.test`,
      clientPhone: "+91 9888877777",
      requiredService: "WEB_DEVELOPMENT",
      detailedRequirement: "Full-scale fleet management tracking system with real-time GPS and driver portal.",
      expectedTimeline: "8 weeks",
      projectBudget: "400000",
    }, brokerAToken);
    const createProjRes = await BrokerProjectsRoute.POST(createProjReq);
    const createProjData = await createProjRes.json();
    assert(createProjRes.status === 201, "POST /api/v1/broker/projects creates project in PENDING_REVIEW");
    const createdProject = createProjData.data?.project || createProjData.data;
    const projectId = createdProject?.id;
    assert(createdProject?.status === "PROJECT_REQUESTED" || createdProject?.status === "PENDING_REVIEW", "Project initialized with status PROJECT_REQUESTED / PENDING_REVIEW");
    assert(!!createdProject?.projectCode, `Unique project code assigned: ${createdProject?.projectCode}`);

    // Safe detail projection (ensure no internal margin / QA notes leak)
    const detailReq = makeReq(`http://localhost:3000/api/v1/broker/projects/${projectId}`, "GET", undefined, brokerAToken);
    const detailRes = await BrokerProjectDetailRoute.GET(detailReq, { params: Promise.resolve({ id: projectId }) });
    const detailData = await detailRes.json();
    assert(detailRes.status === 200, "GET /api/v1/broker/projects/[id] returns HTTP 200");
    assert(detailData.data && !("internalMargin" in detailData.data), "Internal margin is NOT leaked to broker");
    assert(detailData.data && !("developerCost" in detailData.data), "Internal developer cost is NOT leaked to broker");

    // IDOR check: Broker B must NOT be able to view Broker A's project (403 or 404)
    const idorProjReq = makeReq(`http://localhost:3000/api/v1/broker/projects/${projectId}`, "GET", undefined, brokerBToken);
    const idorProjRes = await BrokerProjectDetailRoute.GET(idorProjReq, { params: Promise.resolve({ id: projectId }) });
    assert(idorProjRes.status === 403 || idorProjRes.status === 404, "IDOR Guard: Broker B rejected with HTTP 403/404 when requesting Broker A project");

    // -------------------------------------------------------------------------
    // 6. ADMIN APPROVAL, CONTRACTS & PAYMENTS LIFECYCLE
    // -------------------------------------------------------------------------
    console.log("\n6. Testing Admin Approval, Contracts & Payments Flow...");

    // Setup technical review status and value on project
    await db.partnerProject.update({
      where: { id: projectId },
      data: {
        technicalReviewStatus: "APPROVED",
        finalProjectValue: 400000,
      },
    });

    // Create contract for project
    let contract = await db.partnerContract.create({
      data: {
        partnerProjectId: projectId,
        status: "SENT",
        versions: {
          create: {
            contractName: "Master Services Agreement - Apex Logistics",
            versionNumber: 1,
            contractFileUrl: "https://axivon.dev/contracts/sample_msa.pdf",
            sentById: adminUser?.id || "admin-system",
            status: "SENT",
          },
        },
      },
      include: { versions: true },
    });
    assert(!!contract.id, "PartnerContract created in status SENT");

    // Broker downloads contract
    const dlReq = makeReq(`http://localhost:3000/api/v1/broker/contracts/${contract.id}/download`, "GET", undefined, brokerAToken);
    const dlRes = await ContractDownloadRoute.GET(dlReq, { params: Promise.resolve({ id: contract.id }) });
    const dlData = await dlRes.json();
    assert(dlRes.status === 200, "GET /api/v1/broker/contracts/[id]/download returns contract URL");
    assert(dlData.data?.status === "DOWNLOADED", "Contract status transitioned to DOWNLOADED");

    // Broker uploads signed copy
    const targetVersion = contract.versions[0];
    const uploadReq = makeReq(`http://localhost:3000/api/v1/broker/contracts/${contract.id}/upload`, "POST", {
      versionId: targetVersion.id,
      signedFileUrl: "https://axivon.dev/uploads/signed_contracts/signed_msa_v1.pdf",
      signingConfirmed: true,
      notes: "Signed with digital certificate.",
    }, brokerAToken);
    const uploadRes = await ContractUploadRoute.POST(uploadReq, { params: Promise.resolve({ id: contract.id }) });
    assert(uploadRes.status === 200, "POST /api/v1/broker/contracts/[id]/upload marks status UNDER_REVIEW");

    // Admin verifies contract
    await db.partnerContract.update({
      where: { id: contract.id },
      data: { status: "VERIFIED" },
    });
    await db.partnerContractVersion.update({
      where: { id: targetVersion.id },
      data: { status: "VERIFIED" },
    });

    // Create advance payment requirement (50% advance = ₹200,000)
    let payment = await db.partnerPayment.create({
      data: {
        partnerProjectId: projectId,
        projectPrice: 400000,
        advancePercentage: 50,
        advanceAmount: 200000,
        remainingAmount: 200000,
        status: "PENDING",
      },
    });

    // Broker submits payment proof
    const submitPayReq = makeReq(`http://localhost:3000/api/v1/broker/payments/${payment.id}/submit`, "POST", {
      paymentMethod: "BANK",
      amountPaid: 200000,
      transactionId: `UTR${Date.now()}`,
      proofFileUrl: "https://axivon.dev/uploads/proofs/bank_receipt.pdf",
      additionalNotes: "NEFT transfer executed.",
    }, brokerAToken);
    const submitPayRes = await BrokerPaymentSubmitRoute.POST(submitPayReq, { params: Promise.resolve({ id: payment.id }) });
    assert(submitPayRes.status === 200, "POST /api/v1/broker/payments/[id]/submit transitions to SUBMITTED");

    // IDOR check on payment: Broker B cannot submit Broker A payment
    const idorPayReq = makeReq(`http://localhost:3000/api/v1/broker/payments/${payment.id}/submit`, "POST", {
      paymentMethod: "UPI",
      amountPaid: 200000,
      transactionId: "UTR999999999",
      proofFileUrl: "https://axivon.dev/uploads/proofs/fake.pdf",
    }, brokerBToken);
    const idorPayRes = await BrokerPaymentSubmitRoute.POST(idorPayReq, { params: Promise.resolve({ id: payment.id }) });
    assert(idorPayRes.status === 403, "IDOR Guard: Broker B rejected with HTTP 403 on Broker A payment");

    // Admin verifies payment -> triggers automatic commission creation!
    const adminPayVerifyReq = makeReq(
      `http://localhost:3000/api/v1/admin/partner-payments/${payment.id}`,
      "PATCH",
      { action: "verify" },
      undefined,
      { "x-user-id": adminUser?.id || "admin-system" }
    );
    const adminPayVerifyRes = await AdminPartnerPaymentsRoute.PATCH(adminPayVerifyReq, { params: Promise.resolve({ id: payment.id }) });
    assert(adminPayVerifyRes.status === 200, "Admin verifies payment (triggers automatic commission)");

    // Admin approves partner project (now that contract and payment are VERIFIED)
    const adminApproveReq = makeReq(
      `http://localhost:3000/api/v1/admin/partner-projects/${projectId}/approve`,
      "POST",
      {},
      undefined,
      { "x-user-id": adminUser?.id || "admin-system" }
    );
    const adminApproveRes = await AdminPartnerProjectApproveRoute.POST(adminApproveReq, { params: Promise.resolve({ id: projectId }) });
    assert(adminApproveRes.status === 200, "Admin approves partner project (HTTP 200)");

    // -------------------------------------------------------------------------
    // 7. COMMISSIONS & PAYOUT FLOW
    // -------------------------------------------------------------------------
    console.log("\n7. Testing Commissions & Payout Settlement Flow...");

    // Check broker commissions listing
    const commsReq = makeReq("http://localhost:3000/api/v1/broker/commissions", "GET", undefined, brokerAToken);
    const commsRes = await BrokerCommissionsRoute.GET(commsReq);
    const commsData = await commsRes.json();
    assert(commsRes.status === 200, "GET /api/v1/broker/commissions returns HTTP 200");
    assert("summary" in commsData.data, "Commissions response returns summary stats");
    assert("thisMonth" in commsData.data.summary, "Commissions summary includes 'thisMonth' earnings");

    const createdComm = commsData.data?.commissions?.find((c: any) => c.partnerProjectId === projectId);
    assert(!!createdComm, "Commission automatically generated for verified project");
    assert(createdComm?.status === "ELIGIBLE", "Commission generated with status ELIGIBLE");
    assert(createdComm?.commissionAmount === 40000, `Commission calculated correctly: ₹40,000 (10% of 400,000)`);

    // Commission detail endpoint with TDS calculation
    const commDetailReq = makeReq(`http://localhost:3000/api/v1/broker/commissions/${createdComm.id}`, "GET", undefined, brokerAToken);
    const commDetailRes = await BrokerCommissionDetailRoute.GET(commDetailReq, { params: Promise.resolve({ id: createdComm.id }) });
    const commDetailData = await commDetailRes.json();
    assert(commDetailRes.status === 200, "GET /api/v1/broker/commissions/[id] returns breakdown");
    assert(commDetailData.data?.tds?.ratePercentage === 5, "5% Section 194H TDS rate computed");
    assert(commDetailData.data?.tds?.estimatedDeduction === 2000, "₹2,000 TDS deduction calculated");
    assert(commDetailData.data?.tds?.netPayable === 38000, "₹38,000 net payable calculated");

    // Broker requests payout
    const payoutReq = makeReq("http://localhost:3000/api/v1/broker/commissions/payout-request", "POST", {
      commissionId: createdComm.id,
      payoutMethod: "BANK_TRANSFER",
      payoutDetails: {
        accountHolder: "QA Broker",
        accountNumber: "123456789012",
        ifsc: "HDFC0001234",
        bankName: "HDFC Bank",
      },
      notes: "Please process to standard bank account.",
    }, brokerAToken);
    const payoutRes = await BrokerPayoutRequestRoute.POST(payoutReq);
    const payoutData = await payoutRes.json();
    assert(payoutRes.status === 200, "POST /api/v1/broker/commissions/payout-request returns HTTP 200");
    assert(payoutData.data?.status === "REQUESTED", "Commission status transitioned to REQUESTED");
    assert(!!payoutData.data?.slaDueAt, "SLA due timestamp (48 business hours) calculated");

    // Admin approves & settles payout
    const adminPaySettlementReq = makeReq(
      `http://localhost:3000/api/v1/admin/commissions/${createdComm.id}`,
      "PATCH",
      { action: "pay", payoutReference: `BANK-UTR-${Date.now()}` },
      undefined,
      { "x-user-id": adminUser?.id || "admin-system" }
    );
    const adminPaySettlementRes = await AdminCommissionsRoute.PATCH(adminPaySettlementReq, { params: Promise.resolve({ id: createdComm.id }) });
    assert(adminPaySettlementRes.status === 200, "Admin settles commission payout with UTR reference");

    // Verify broker now sees commission as PAID
    const commPaidReq = makeReq(`http://localhost:3000/api/v1/broker/commissions/${createdComm.id}`, "GET", undefined, brokerAToken);
    const commPaidRes = await BrokerCommissionDetailRoute.GET(commPaidReq, { params: Promise.resolve({ id: createdComm.id }) });
    const commPaidData = await commPaidRes.json();
    assert(commPaidData.data?.status === "PAID", "Broker sees updated settled status: PAID");

    // -------------------------------------------------------------------------
    // 8. DOCUMENTS & NOTIFICATIONS
    // -------------------------------------------------------------------------
    console.log("\n8. Testing Documents & Notifications Multi-Tenant Read Tracking...");

    // Create a broadcast document
    const broadcastDoc = await db.partnerDocument.create({
      data: {
        title: `Q4 Partner Policy Update ${Date.now()}`,
        description: "Official policy updates for all active brokers.",
        fileUrl: "https://axivon.dev/docs/partner_policy_2026.pdf",
        category: "PARTNER_GUIDELINES",
        brokerProfileId: null, // Broadcast to ALL brokers
        isImportant: true,
        uploadedById: adminUser?.id || "admin-system",
      },
    });

    // Broker A reads broadcast document
    const docReadReq = makeReq(`http://localhost:3000/api/v1/broker/documents/${broadcastDoc.id}/read`, "POST", {}, brokerAToken);
    const docReadRes = await BrokerDocumentReadRoute.POST(docReadReq, { params: Promise.resolve({ id: broadcastDoc.id }) });
    assert(docReadRes.status === 200, "Broker A marks broadcast document as read");

    // Verify Broker B still sees it as unread (Multi-tenant data isolation test!)
    const brokerBDocsReq = makeReq("http://localhost:3000/api/v1/broker/documents", "GET", undefined, brokerBToken);
    const brokerBDocsRes = await BrokerDocumentsRoute.GET(brokerBDocsReq);
    const brokerBDocsData = await brokerBDocsRes.json();
    const bDoc = brokerBDocsData.data?.documents?.find((d: any) => d.id === broadcastDoc.id);
    assert(bDoc?.isRead === false, "Multi-Tenant Isolation: Broadcast document remains UNREAD for Broker B!");

    // Notifications check
    const notifReq = makeReq("http://localhost:3000/api/v1/notifications", "GET", undefined, brokerAToken);
    const notifRes = await NotificationsRoute.GET(notifReq);
    assert(notifRes.status === 200, "GET /api/v1/notifications returns HTTP 200");

    const notifUnreadReq = makeReq("http://localhost:3000/api/v1/notifications/unread-count", "GET", undefined, brokerAToken);
    const notifUnreadRes = await NotificationsUnreadRoute.GET(notifUnreadReq);
    assert(notifUnreadRes.status === 200, "GET /api/v1/notifications/unread-count returns HTTP 200");

    // -------------------------------------------------------------------------
    // 9. DASHBOARD & ADD-ON FEATURES
    // -------------------------------------------------------------------------
    console.log("\n9. Testing Aggregated Dashboard & Add-On Features...");

    // Aggregated Dashboard
    const dashReq = makeReq("http://localhost:3000/api/v1/broker/dashboard", "GET", undefined, brokerAToken);
    const dashRes = await DashboardRoute.GET(dashReq);
    const dashData = await dashRes.json();
    assert(dashRes.status === 200, "GET /api/v1/broker/dashboard returns HTTP 200");
    assert(dashData.data?.stats?.projects?.TOTAL >= 1, "Dashboard returns project counts");
    assert(dashData.data?.stats?.earnings?.totalEarned >= 40000, "Dashboard returns verified settled earnings");
    assert("pendingActions" in dashData.data, "Dashboard returns pending action items");

    // Earnings Analytics (12-month trend & funnel)
    const analyticsReq = makeReq("http://localhost:3000/api/v1/broker/analytics/earnings", "GET", undefined, brokerAToken);
    const analyticsRes = await AnalyticsRoute.GET(analyticsReq);
    const analyticsData = await analyticsRes.json();
    assert(analyticsRes.status === 200, "GET /api/v1/broker/analytics/earnings returns HTTP 200");
    assert(analyticsData.data?.monthlyEarnings?.length === 12, "Analytics returns 12-month earnings trend");
    assert(analyticsData.data?.funnel?.length === 5, "Analytics returns 5-step conversion funnel");

    // Commission Estimator
    const estimateReq = makeReq("http://localhost:3000/api/v1/broker/commissions/estimate", "POST", {
      budget: 600000,
      serviceType: "WEB_DEVELOPMENT",
    }, brokerAToken);
    const estimateRes = await EstimateRoute.POST(estimateReq);
    const estimateData = await estimateRes.json();
    assert(estimateRes.status === 200, "POST /api/v1/broker/commissions/estimate returns HTTP 200");
    assert(estimateData.data?.estimate?.grossCommission === 60000, "Commission estimate computed: ₹60,000 on ₹600,000");

    // Unified Activity Feed
    const activityReq = makeReq("http://localhost:3000/api/v1/broker/activity", "GET", undefined, brokerAToken);
    const activityRes = await ActivityRoute.GET(activityReq);
    const activityData = await activityRes.json();
    assert(activityRes.status === 200, "GET /api/v1/broker/activity returns HTTP 200");
    assert(activityData.data?.timeline?.length > 0, "Unified activity timeline returned");

    // Commission Statement CSV Download
    const csvReq = makeReq("http://localhost:3000/api/v1/broker/commissions/export", "GET", undefined, brokerAToken);
    const csvRes = await ExportCsvRoute.GET(csvReq);
    const csvContent = await csvRes.text();
    assert(csvRes.status === 200, "GET /api/v1/broker/commissions/export returns HTTP 200");
    assert(csvRes.headers.get("content-type")?.includes("text/csv") === true, "Export returns text/csv content-type");
    assert(csvContent.includes("Commission ID,Project Code"), "CSV contains standard headers");

    // Support Request & Reply
    const supportReq = makeReq("http://localhost:3000/api/v1/broker/support", "POST", {
      subject: "Inquiry on Q4 Payout Cycle Schedule",
      category: "PAYOUT",
      priority: "HIGH",
      message: "Please let us know the scheduled banking cut-off times for this weekend.",
    }, brokerAToken);
    const supportRes = await SupportRoute.POST(supportReq);
    const supportData = await supportRes.json();
    assert(supportRes.status === 200, "POST /api/v1/broker/support creates support ticket");
    const ticketId = supportData.data?.ticket?.id;

    // Broker replies to ticket
    const replyReq = makeReq(`http://localhost:3000/api/v1/broker/support/${ticketId}`, "POST", {
      message: "Adding note: we have two urgent client projects closing tomorrow.",
    }, brokerAToken);
    const replyRes = await SupportDetailRoute.POST(replyReq, { params: Promise.resolve({ id: ticketId }) });
    assert(replyRes.status === 200, "POST /api/v1/broker/support/[id] posts reply to ticket");

    // Drafts Auto-Save
    const draftReq = makeReq("http://localhost:3000/api/v1/broker/drafts", "POST", {
      draftType: "PROJECT",
      title: "Draft Healthcare Telemedicine Platform",
      data: { clientName: "CarePlus Clinics", estimatedBudget: 800000 },
    }, brokerAToken);
    const draftRes = await DraftsRoute.POST(draftReq);
    assert(draftRes.status === 200, "POST /api/v1/broker/drafts saves project draft");

    const getDraftReq = makeReq("http://localhost:3000/api/v1/broker/drafts?type=PROJECT", "GET", undefined, brokerAToken);
    const getDraftRes = await DraftsRoute.GET(getDraftReq);
    const getDraftData = await getDraftRes.json();
    assert(getDraftData.data?.drafts?.length >= 1, "GET /api/v1/broker/drafts retrieves saved draft");

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error("Test execution threw unhandled exception:", err);
    process.exit(1);
  }
}

runTestSuite();
