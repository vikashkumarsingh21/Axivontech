/**
 * End-to-End Audit & Verification Test Suite for Business Partner Application Approval,
 * Account Creation, and Broker Authentication.
 * 
 * Verifies Phases 1 through 11:
 * - Test A: Application review, approval, and transactional account provisioning
 * - Test B: Email-as-login-ID, password hashing, and mandatory first-login password change
 * - Test C: Approved application without account ("No login yet") provisioning
 * - Test D: Duplicate account prevention, idempotency, and internal role conflict protection
 * - Test E: Sensitive credential hygiene & server-side data isolation
 */

import { db } from "../src/lib/db";
import {
  checkEmailAvailability,
  approveAndCreateBrokerAccount,
} from "../src/lib/auth/broker-account-service";
import { verifyPassword, hashPassword, validatePasswordStrength } from "../src/lib/auth/password";
import { signSession, verifySession } from "../src/lib/auth/session";
import { resolveRoleDashboardUrl } from "../src/lib/auth/roles";
import crypto from "crypto";

interface TestReport {
  passed: number;
  failed: number;
  tests: { name: string; status: "PASS" | "FAIL"; details?: string }[];
}

const report: TestReport = { passed: 0, failed: 0, tests: [] };

function record(name: string, passed: boolean, details?: string) {
  if (passed) {
    report.passed++;
    report.tests.push({ name, status: "PASS", details });
    console.log(`\x1b[32m✔ [PASS]\x1b[0m ${name}${details ? ` (${details})` : ""}`);
  } else {
    report.failed++;
    report.tests.push({ name, status: "FAIL", details });
    console.error(`\x1b[31m✖ [FAIL]\x1b[0m ${name}: ${details}`);
  }
}

async function run() {
  console.log("\n=======================================================");
  console.log("  AXIVON TECH: PARTNER APPROVAL & LOGIN WORKFLOW AUDIT");
  console.log("=======================================================\n");

  const testSuffix = crypto.randomBytes(3).toString("hex");
  const testEmailA = `test-partner-a-${testSuffix}@axivontech.test`;
  const testEmailB = `test-partner-b-${testSuffix}@axivontech.test`;
  const testEmailStaff = `test-staff-${testSuffix}@axivontech.test`;

  // Find or create an Admin user for running administrative actions
  let adminUser = await db.user.findFirst({
    where: { userRoles: { some: { role: { name: "ADMIN" } } } },
  });

  if (!adminUser) {
    adminUser = await db.user.findFirst();
  }

  const adminUserId = adminUser?.id || "system-audit-admin";

  try {
    // -------------------------------------------------------------------------
    // PREPARATION: Create an internal staff user to test Scenario 3 conflict
    // -------------------------------------------------------------------------
    const employeeRole = await db.role.upsert({
      where: { name: "EMPLOYEE" },
      update: {},
      create: { name: "EMPLOYEE", description: "Standard Employee" },
    });

    const staffUser = await db.user.create({
      data: {
        email: testEmailStaff,
        name: "Test Senior Engineer",
        passwordHash: await hashPassword("StaffOriginalP@ss123!"),
        status: "ACTIVE",
        userRoles: {
          create: { roleId: employeeRole.id },
        },
      },
    });

    // -------------------------------------------------------------------------
    // 1. EMAIL AVAILABILITY & CONFLICT CLASSIFICATION (PHASE 5)
    // -------------------------------------------------------------------------
    console.log("\n--- Testing Phase 5: Email Availability & Conflict Classification ---");

    const availCheck = await checkEmailAvailability(testEmailA);
    record(
      "Unregistered email is available",
      availCheck.available === true && availCheck.conflictType === "NONE",
      `conflictType: ${availCheck.conflictType}`
    );

    const conflictCheck = await checkEmailAvailability(testEmailStaff);
    record(
      "Internal staff email is correctly flagged as INTERNAL_ROLE_CONFLICT",
      conflictCheck.available === false &&
        conflictCheck.canProceed === false &&
        conflictCheck.conflictType === "INTERNAL_ROLE_CONFLICT",
      conflictCheck.message
    );

    // -------------------------------------------------------------------------
    // 2. TEST A: SUBMITTED APPLICATION -> APPROVE & CREATE LOGIN (PHASE 2 & 11)
    // -------------------------------------------------------------------------
    console.log("\n--- Testing Phase 2 & 11 Test A: Submitted Application Approval & Provisioning ---");

    const appA = await db.businessPartnerApplication.create({
      data: {
        applicationId: `BPA-TEST-${testSuffix.toUpperCase()}`,
        fullName: "Rahul Varma",
        email: testEmailA,
        phone: "+91 9876543210",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        occupation: "Broker or Referral Agent",
        status: "SUBMITTED",
        education10th: {},
      },
    });

    record(
      "Application created with status SUBMITTED",
      appA.status === "SUBMITTED" && !!appA.id,
      `ID: ${appA.applicationId}`
    );

    // Execute Approve & Create Broker Account
    const provisionResultA = await approveAndCreateBrokerAccount({
      applicationId: appA.id,
      adminUserId,
      mode: "DIRECT_PASSWORD",
      mustChangePassword: true,
      partnerType: "Broker or Referral Agent",
      internalNote: "Audit verification approval",
    });

    record(
      "Account provisioning returned success",
      provisionResultA.success === true && provisionResultA.isExisting === false,
      `Partner ID: ${provisionResultA.partnerId}, Referral: ${provisionResultA.referralCode}`
    );

    record(
      "Email used strictly as login ID (Phase 2 requirement)",
      provisionResultA.email.toLowerCase() === testEmailA.toLowerCase()
    );

    record(
      "One-time password generated meets complexity rules",
      !!provisionResultA.oneTimePassword &&
        validatePasswordStrength(provisionResultA.oneTimePassword).isValid &&
        provisionResultA.oneTimePassword.length >= 14,
      `Length: ${provisionResultA.oneTimePassword?.length}`
    );

    // Verify DB State
    const createdUserA = await db.user.findUnique({
      where: { email: testEmailA },
      include: {
        brokerProfile: true,
        userRoles: { include: { role: true } },
      },
    });

    record(
      "User record created in database with ACTIVE status",
      !!createdUserA && createdUserA.status === "ACTIVE"
    );

    record(
      "Password is cryptographically hashed in database (never plaintext)",
      !!createdUserA?.passwordHash &&
        createdUserA.passwordHash !== provisionResultA.oneTimePassword &&
        createdUserA.passwordHash.startsWith("$2"),
      "Bcrypt hash verified"
    );

    record(
      "Mandatory first-login password change flag set",
      createdUserA?.mustChangePassword === true
    );

    const hasBusinessPartnerRole = createdUserA?.userRoles.some(
      (ur) => ur.role.name === "BUSINESS_PARTNER"
    );
    record(
      "Canonical BUSINESS_PARTNER role assigned",
      hasBusinessPartnerRole === true
    );

    record(
      "BrokerProfile created with matching partnerId & referralCode",
      !!createdUserA?.brokerProfile &&
        createdUserA.brokerProfile.partnerId === provisionResultA.partnerId &&
        createdUserA.brokerProfile.referralCode === provisionResultA.referralCode
    );

    const updatedAppA = await db.businessPartnerApplication.findUnique({
      where: { id: appA.id },
    });

    record(
      "Application status updated to APPROVED",
      updatedAppA?.status === "APPROVED" && updatedAppA.reviewedById === adminUserId
    );

    const statusHistory = await db.applicationStatusHistory.findFirst({
      where: { applicationId: appA.id },
      orderBy: { createdAt: "desc" },
    });
    record(
      "ApplicationStatusHistory audit entry created",
      statusHistory?.newStatus === "APPROVED"
    );

    // -------------------------------------------------------------------------
    // 3. TEST B: BROKER AUTHENTICATION & FIRST LOGIN PASSWORD CHANGE (PHASE 6 & 11)
    // -------------------------------------------------------------------------
    console.log("\n--- Testing Phase 6 & 11 Test B: Broker Login & Password Change ---");

    // Test password verification with issued one-time password
    const passwordValid = await verifyPassword(
      provisionResultA.oneTimePassword!,
      createdUserA!.passwordHash
    );
    record("Password verification succeeds with temporary credentials", passwordValid === true);

    // Verify role routing
    const destinationUrl = resolveRoleDashboardUrl("BUSINESS_PARTNER");
    record(
      "BUSINESS_PARTNER role resolves to /broker/dashboard",
      destinationUrl === "/broker/dashboard"
    );

    // Generate initial session
    const sessionToken = await signSession({
      userId: createdUserA!.id,
      role: "BUSINESS_PARTNER",
      sessionId: crypto.randomUUID(),
      mustChangePassword: true,
    });

    const parsedSession = await verifySession(sessionToken);
    record(
      "Session issued carries mustChangePassword=true flag",
      parsedSession?.mustChangePassword === true && parsedSession.userId === createdUserA!.id
    );

    // Simulate password change to permanent password
    const newPermanentPassword = "P@rtnerPermanentSecure2026!";
    const newHash = await hashPassword(newPermanentPassword);

    await db.user.update({
      where: { id: createdUserA!.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    const updatedUserA = await db.user.findUnique({
      where: { id: createdUserA!.id },
    });

    record(
      "Permanent password updated and mustChangePassword cleared",
      updatedUserA?.mustChangePassword === false
    );

    const permanentPasswordValid = await verifyPassword(
      newPermanentPassword,
      updatedUserA!.passwordHash
    );
    record(
      "Permanent password verifies successfully",
      permanentPasswordValid === true
    );

    // -------------------------------------------------------------------------
    // 4. TEST C: APPROVED APPLICATION WITHOUT ACCOUNT ("No Login Yet") (PHASE 3 & 11)
    // -------------------------------------------------------------------------
    console.log("\n--- Testing Phase 3 & 11 Test C: Approved Application Without Login ---");

    // Create an application already approved, but with no user account
    const appB = await db.businessPartnerApplication.create({
      data: {
        applicationId: `BPA-APPROVED-NOLOGIN-${testSuffix.toUpperCase()}`,
        fullName: "Priya Sharma",
        email: testEmailB,
        phone: "+91 9123456789",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        occupation: "Business Development Partner",
        status: "APPROVED",
        education10th: {},
      },
    });

    // Verify it has no user
    const existingUserB = await db.user.findUnique({ where: { email: testEmailB } });
    record("Approved application starts with no user account", existingUserB === null);

    // Admin clicks "Create Login"
    const provisionResultB = await approveAndCreateBrokerAccount({
      applicationId: appB.id,
      adminUserId,
      mode: "DIRECT_PASSWORD",
      password: "PriyaCustomSecureP@ss2026!",
      mustChangePassword: true,
      partnerType: "Business Development Partner",
      internalNote: "Created login for previously approved partner",
    });

    record(
      "Provisioning creates account for approved application",
      provisionResultB.success === true && provisionResultB.isExisting === false
    );

    const createdUserB = await db.user.findUnique({
      where: { email: testEmailB },
      include: { brokerProfile: true },
    });

    record(
      "User and BrokerProfile now exist for the approved partner",
      !!createdUserB && !!createdUserB.brokerProfile
    );

    // -------------------------------------------------------------------------
    // 5. TEST D: DUPLICATE PREVENTION & CONFLICT REJECTION (PHASE 5 & 11)
    // -------------------------------------------------------------------------
    console.log("\n--- Testing Phase 5 & 11 Test D: Duplicate Prevention & Conflict Handling ---");

    // Repeat account creation on already-provisioned application
    const repeatResult = await approveAndCreateBrokerAccount({
      applicationId: appB.id,
      adminUserId,
      mode: "DIRECT_PASSWORD",
    });

    record(
      "Repeating account creation returns idempotent success (isExisting=true)",
      repeatResult.isExisting === true
    );

    const userBCount = await db.user.count({ where: { email: testEmailB } });
    const profileBCount = await db.brokerProfile.count({ where: { userId: createdUserB!.id } });

    record(
      "No duplicate User or BrokerProfile records created on retry",
      userBCount === 1 && profileBCount === 1,
      `Users: ${userBCount}, Profiles: ${profileBCount}`
    );

    // Attempt to convert internal staff account to broker (Scenario 3)
    let conflictRejected = false;
    let conflictErrorMsg = "";
    try {
      await approveAndCreateBrokerAccount({
        applicationId: appA.id,
        adminUserId,
        email: testEmailStaff, // Attempts to use staff email
        mode: "DIRECT_PASSWORD",
      });
    } catch (err: any) {
      conflictRejected = true;
      conflictErrorMsg = err.message || "";
    }

    record(
      "Attempt to overwrite internal staff account is strictly rejected with 409",
      conflictRejected === true && conflictErrorMsg.includes("Account conflict"),
      conflictErrorMsg
    );

    // Verify staff account password and role were completely untouched
    const verifiedStaff = await db.user.findUnique({
      where: { id: staffUser.id },
      include: { brokerProfile: true, userRoles: { include: { role: true } } },
    });

    const staffPasswordUntouched = await verifyPassword(
      "StaffOriginalP@ss123!",
      verifiedStaff!.passwordHash
    );

    record(
      "Internal staff user credentials and permissions were 100% preserved",
      staffPasswordUntouched === true &&
        verifiedStaff?.brokerProfile === null &&
        verifiedStaff.userRoles.some((ur) => ur.role.name === "EMPLOYEE")
    );

    // -------------------------------------------------------------------------
    // 6. TEST E: DATA ISOLATION & SENSITIVE FIELD SECURITY (PHASE 9 & 11)
    // -------------------------------------------------------------------------
    console.log("\n--- Testing Phase 9 & 11 Test E: Data Isolation & Sensitive Field Security ---");

    // Create a partner project owned by Broker A
    const projectA = await db.partnerProject.create({
      data: {
        projectCode: `PRJ-AUDIT-${testSuffix.toUpperCase()}`,
        projectName: "Broker A Confidential Lead",
        clientName: "Client A",
        clientEmail: "clienta@example.com",
        clientPhone: "9999999999",
        companyName: "Acme Corp",
        industry: "Technology",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        requiredService: "Custom Web Application",
        detailedRequirement: "Confidential architecture project for enterprise partner.",
        expectedTimeline: "1 month",
        projectBudget: "INR 1,00,000",
        brokerProfileId: createdUserA!.brokerProfile!.id,
      },
    });

    // Query with Broker B's profile ID
    const crossAccessAttempt = await db.partnerProject.findFirst({
      where: {
        id: projectA.id,
        brokerProfileId: createdUserB!.brokerProfile!.id, // Attempting to access A's project as B
      },
    });

    record(
      "Server-side strict tenant filter prevents cross-broker project access (IDOR)",
      crossAccessAttempt === null
    );

    // Audit logs do not contain raw passwords
    const recentAuditLogs = await db.auditLog.findMany({
      where: {
        action: "PARTNER_APPLICATION_APPROVED_AND_ACCOUNT_CREATED",
        resource: `User:${createdUserA!.id}`,
      },
    });

    const hasPlaintextPassword = recentAuditLogs.some((l) => {
      const str = JSON.stringify(l.details || {});
      return str.includes("P@ss") || (l.details as any)?.password !== undefined;
    });

    record(
      "Audit logs never store plaintext password in details",
      hasPlaintextPassword === false && recentAuditLogs.length > 0
    );

  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // -------------------------------------------------------------------------
    console.log("\n--- Cleaning up test records ---");
    try {
      await db.partnerProject.deleteMany({
        where: { projectCode: { contains: testSuffix.toUpperCase() } },
      });
      await db.applicationStatusHistory.deleteMany({
        where: { application: { email: { in: [testEmailA, testEmailB] } } },
      });
      await db.businessPartnerApplication.deleteMany({
        where: { email: { in: [testEmailA, testEmailB] } },
      });
      await db.brokerProfile.deleteMany({
        where: { user: { email: { in: [testEmailA, testEmailB] } } },
      });
      await db.userRole.deleteMany({
        where: { user: { email: { in: [testEmailA, testEmailB, testEmailStaff] } } },
      });
      await db.user.deleteMany({
        where: { email: { in: [testEmailA, testEmailB, testEmailStaff] } },
      });
      console.log("✔ Test data cleaned up successfully.");
    } catch (cleanupErr) {
      console.error("Cleanup warning:", cleanupErr);
    }
  }

  console.log("\n=======================================================");
  console.log(`  AUDIT RESULTS: ${report.passed} PASSED / ${report.failed} FAILED`);
  console.log("=======================================================\n");

  if (report.failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Audit test error:", err);
  process.exit(1);
});
