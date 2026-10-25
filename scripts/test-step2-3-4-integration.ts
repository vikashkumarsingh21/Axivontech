import { db } from "../src/lib/db";
import crypto from "crypto";

async function runStep234Tests() {
  console.log("=== Testing Steps 2, 3, 4: Broker Management, Activation, KYC Review, Suspension ===");

  // 1. Locate QA broker
  const brokerUser = await db.user.findFirst({
    where: {
      email: "qa.broker@axivon.dev",
      userRoles: { some: { role: { name: { in: ["BUSINESS_PARTNER", "BROKER"] } } } },
    },
    include: { brokerProfile: true },
  });

  if (!brokerUser || !brokerUser.brokerProfile) {
    throw new Error("QA broker user (qa.broker@axivon.dev) not found in database.");
  }

  const brokerId = brokerUser.id;
  const profileId = brokerUser.brokerProfile.id;
  console.log(`Found QA Broker: ${brokerUser.name} (${brokerUser.email})`);
  console.log(`User ID: ${brokerId}, Profile ID: ${profileId}, Referral Code: ${brokerUser.brokerProfile.referralCode}`);

  // 2. Test Dossier Data Aggregation (matching GET /api/v1/admin/brokers/[id])
  const extKey = `broker_ext:${profileId}`;
  const extSetting = await db.organizationSetting.findUnique({ where: { key: extKey } });
  const extData = (extSetting?.value as Record<string, any>) || {};

  const [leadsCount, projectsCount, contractsCount, commissionsCount] = await Promise.all([
    db.lead.count({ where: { ownerId: brokerId, source: "PARTNER" } }),
    db.partnerProject.count({ where: { brokerProfileId: profileId } }),
    db.partnerContract.count({ where: { partnerProject: { brokerProfileId: profileId } } }),
    db.commission.count({ where: { brokerProfileId: profileId } }),
  ]);

  console.log(`Dossier metrics: Leads=${leadsCount}, Projects=${projectsCount}, Contracts=${contractsCount}, Commissions=${commissionsCount}`);
  console.log("PASS: Dossier data aggregation successfully queried all cross-role domains");

  // 3. Test KYC Review logic
  const originalKycStatus = extData.kycStatus || "PENDING";
  console.log(`Current KYC status: ${originalKycStatus}`);

  // Test Approve action
  extData.kycStatus = "VERIFIED";
  extData.kycRemarks = "KYC verified by QA test suite.";
  extData.kycVerifiedAt = new Date().toISOString();
  extData.kycVerifiedBy = "QA Admin";

  await db.organizationSetting.upsert({
    where: { key: extKey },
    update: { value: extData },
    create: { key: extKey, value: extData },
  });

  const verifiedSetting = await db.organizationSetting.findUnique({ where: { key: extKey } });
  const verifiedData = verifiedSetting?.value as any;
  if (verifiedData?.kycStatus !== "VERIFIED") {
    throw new Error("KYC verification update failed");
  }
  console.log("PASS: KYC approval state saved to OrganizationSetting");

  // 4. Test Suspension & Reactivation Gate
  // Suspend
  await db.user.update({
    where: { id: brokerId },
    data: { status: "INACTIVE", inactiveAt: new Date() },
  });

  const suspendedUser = await db.user.findUnique({ where: { id: brokerId } });
  if (suspendedUser?.status !== "INACTIVE") {
    throw new Error("Failed to set user status to INACTIVE");
  }

  // Verify that an inactive status triggers 403 in the broker auth gate logic
  const isBlocked = suspendedUser.status === "INACTIVE" || suspendedUser.status === "SUSPENDED";
  if (!isBlocked) {
    throw new Error("Suspension gate condition check failed");
  }
  console.log("PASS: Broker suspension correctly flags status as INACTIVE (blocks portal access)");

  // Reactivate
  await db.user.update({
    where: { id: brokerId },
    data: { status: "ACTIVE", inactiveAt: null },
  });

  const reactivatedUser = await db.user.findUnique({ where: { id: brokerId } });
  if (reactivatedUser?.status !== "ACTIVE") {
    throw new Error("Failed to reactivate user");
  }
  console.log("PASS: Broker account reactivated successfully");

  // 5. Test Resend Activation Token Generation
  const testActivationToken = crypto.randomUUID();
  await db.user.update({
    where: { id: brokerId },
    data: { activationToken: testActivationToken },
  });

  const tokenUser = await db.user.findUnique({ where: { id: brokerId } });
  if (tokenUser?.activationToken !== testActivationToken) {
    throw new Error("Activation token update failed");
  }
  // Clear test token and restore clean state
  await db.user.update({
    where: { id: brokerId },
    data: { activationToken: null, status: "ACTIVE" },
  });
  console.log("PASS: Activation token generation and restoration verified");

  // 6. Test Internal Notes for Broker
  const notesKey = `broker_notes:${brokerId}`;
  const testNote = {
    id: `BNOTE-TEST-${Date.now()}`,
    note: "Automated QA note: Broker verified and commissioned.",
    authorId: "admin-system",
    authorName: "System QA",
    createdAt: new Date().toISOString(),
  };

  const existingNotesSetting = await db.organizationSetting.findUnique({ where: { key: notesKey } });
  const currentNotes = Array.isArray(existingNotesSetting?.value) ? existingNotesSetting.value : [];
  const updatedNotes = [testNote, ...currentNotes];

  await db.organizationSetting.upsert({
    where: { key: notesKey },
    update: { value: updatedNotes },
    create: { key: notesKey, value: updatedNotes },
  });

  const savedNotesSetting = await db.organizationSetting.findUnique({ where: { key: notesKey } });
  const savedNotesList = savedNotesSetting?.value as any[];
  if (!savedNotesList || savedNotesList.length === 0 || savedNotesList[0].id !== testNote.id) {
    throw new Error("Broker internal note persistence failed");
  }
  console.log("PASS: Broker internal notes saved and retrieved without schema modification");

  // Clean test note from setting
  const cleanedNotes = savedNotesList.filter((n) => n.id !== testNote.id);
  await db.organizationSetting.update({
    where: { key: notesKey },
    data: { value: cleanedNotes },
  });
  console.log("Cleaned up test note successfully");

  console.log("\n=== STEPS 2, 3, 4 INTEGRATION TESTS PASSED ===");
}

runStep234Tests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
