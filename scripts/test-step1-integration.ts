import { db } from "../src/lib/db";
import crypto from "crypto";

async function runStep1Tests() {
  console.log("=== Testing Step 1: Partner Application -> Admin Review ===");

  // 1. Get or create a sample application
  const testEmail = `test.partner.${Date.now()}@example.com`;
  const applicationId = `BPA-TEST-${Date.now().toString().slice(-6)}`;

  console.log(`Creating test application: ${applicationId} (${testEmail})`);
  const app = await db.businessPartnerApplication.create({
    data: {
      applicationId,
      fullName: "Test Partner Applicant",
      email: testEmail,
      phone: "+919876543210",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      occupation: "IT Consultant",
      yearsOfExperience: 5,
      motivation: "Excited to partner with Axivon Technologies on digital transformation.",
      status: "SUBMITTED",
      education10th: { school: "National School", board: "CBSE", passingYear: "2012", percentage: "88%" },
    },
  });

  console.log("Application created successfully with ID:", app.id);

  // 2. Test status check logic (matching what /api/v1/public/business-partner/applications/status does)
  const statusLookup = await db.businessPartnerApplication.findFirst({
    where: {
      applicationId: { equals: applicationId, mode: "insensitive" },
      email: { equals: testEmail, mode: "insensitive" },
    },
    select: {
      id: true,
      applicationId: true,
      fullName: true,
      email: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      meetings: {
        select: {
          meetingDate: true,
          meetingType: true,
          locationOrLink: true,
        },
      },
    },
  });

  if (!statusLookup || statusLookup.status !== "SUBMITTED") {
    throw new Error("Public status check simulation failed");
  }
  console.log("PASS: Public status lookup successfully returned safe projection for applicant");

  // 3. Test Internal Notes (backed by OrganizationSetting)
  const settingKey = `bpa_notes:${app.id}`;
  const testNote = {
    id: `NOTE-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`,
    note: "Candidate has strong enterprise network in Mumbai. Recommended for initial review call.",
    authorId: "admin-system-test",
    authorName: "Admin Reviewer",
    createdAt: new Date().toISOString(),
  };

  await db.organizationSetting.upsert({
    where: { key: settingKey },
    update: { value: [testNote] },
    create: { key: settingKey, value: [testNote] },
  });

  const notesSetting = await db.organizationSetting.findUnique({
    where: { key: settingKey },
  });
  const savedNotes = notesSetting?.value as any[];
  if (!Array.isArray(savedNotes) || savedNotes.length === 0 || savedNotes[0].note !== testNote.note) {
    throw new Error("Internal notes retrieval failed");
  }
  console.log("PASS: Internal notes saved and retrieved from OrganizationSetting without schema mutation");

  // 4. Test Status Transition with reason and status history
  const updatedApp = await db.businessPartnerApplication.update({
    where: { id: app.id },
    data: {
      status: "UNDER_REVIEW",
      statusHistory: {
        create: {
          previousStatus: "SUBMITTED",
          newStatus: "UNDER_REVIEW",
          reason: "Initial vetting passed; background check initiated.",
        },
      },
    },
    include: {
      statusHistory: true,
    },
  });

  if (updatedApp.status !== "UNDER_REVIEW" || updatedApp.statusHistory.length !== 1) {
    throw new Error("Status transition or history logging failed");
  }
  console.log("PASS: Status transition to UNDER_REVIEW and statusHistory entry created successfully");

  // 5. Cleanup test application and notes setting
  await db.applicationStatusHistory.deleteMany({ where: { applicationId: app.id } });
  await db.businessPartnerApplication.delete({ where: { id: app.id } });
  await db.organizationSetting.deleteMany({ where: { key: settingKey } });
  console.log("Cleaned up test records successfully");

  console.log("\n=== STEP 1 INTEGRATION TESTS PASSED ===");
}

runStep1Tests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
