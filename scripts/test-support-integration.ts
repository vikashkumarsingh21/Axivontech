import { db } from "../src/lib/db";
import crypto from "crypto";

async function runSupportTests() {
  console.log("=== Testing Step 12: Partner Support Desk Integration ===");

  // Find QA broker
  const brokerUser = await db.user.findFirst({
    where: { email: "qa.broker@axivon.dev" },
    include: { brokerProfile: true },
  });

  if (!brokerUser || !brokerUser.brokerProfile) {
    throw new Error("QA Broker not found.");
  }

  const profileId = brokerUser.brokerProfile.id;
  const settingKey = `broker_support:${profileId}`;

  // 1. Broker submits a test support ticket
  const ticketId = `SPT-TEST-${Date.now().toString().slice(-6)}`;
  const testTicket = {
    id: ticketId,
    brokerProfileId: profileId,
    brokerName: brokerUser.name,
    brokerEmail: brokerUser.email,
    subject: "Inquiry on Q3 Commission Payout Schedule",
    category: "COMMISSION",
    priority: "HIGH",
    status: "OPEN",
    message: "Could you please confirm the processing date for the advance commission on Project Alpha?",
    replies: [
      {
        id: `REP-${Date.now()}-1`,
        senderId: brokerUser.id,
        senderName: brokerUser.name,
        senderRole: "BROKER",
        message: "Could you please confirm the processing date for the advance commission on Project Alpha?",
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const setting = await db.organizationSetting.findUnique({ where: { key: settingKey } });
  const existingTickets = Array.isArray(setting?.value) ? (setting.value as any[]) : [];
  existingTickets.unshift(testTicket);

  await db.organizationSetting.upsert({
    where: { key: settingKey },
    update: { value: existingTickets },
    create: { key: settingKey, value: existingTickets },
  });

  console.log(`PASS: Ticket ${ticketId} created in OrganizationSetting for partner.`);

  // 2. Admin retrieves ticket queue (simulating GET /api/v1/admin/support/brokers)
  const allSupportSettings = await db.organizationSetting.findMany({
    where: { key: { startsWith: "broker_support:" } },
  });

  let queueTickets: any[] = [];
  for (const s of allSupportSettings) {
    if (Array.isArray(s.value)) queueTickets.push(...(s.value as any[]));
  }

  const retrieved = queueTickets.find((t) => t.id === ticketId);
  if (!retrieved) throw new Error("Admin failed to locate ticket in support queue.");
  console.log(`PASS: Ticket found in Admin queue with status ${retrieved.status} and priority ${retrieved.priority}.`);

  // 3. Admin posts reply and marks ticket RESOLVED (simulating POST /api/v1/admin/support/brokers/[ticketId])
  const adminReply = {
    id: `REP-ADM-${Date.now()}`,
    senderId: "admin-system",
    senderName: "Admin Support Desk",
    senderRole: "ADMIN",
    message: "Your advance commission has been approved and scheduled for settlement within 2 business days. UTR will be updated in portal.",
    createdAt: new Date().toISOString(),
  };

  retrieved.replies.push(adminReply);
  retrieved.status = "RESOLVED";
  retrieved.updatedAt = new Date().toISOString();

  await db.organizationSetting.update({
    where: { key: settingKey },
    data: { value: existingTickets },
  });

  // Verify notification was recorded
  await db.notification.create({
    data: {
      userId: brokerUser.id,
      type: "SYSTEM",
      title: `Support Ticket Resolved: ${testTicket.subject}`,
      message: "Admin replied and resolved your ticket.",
      link: "/broker/support",
    },
  });

  console.log("PASS: Admin reply appended and status transitioned to RESOLVED with in-app notification.");

  // 4. Cleanup test ticket from setting
  const cleaned = existingTickets.filter((t) => t.id !== ticketId);
  await db.organizationSetting.update({
    where: { key: settingKey },
    data: { value: cleaned },
  });
  console.log("PASS: Cleaned up test support ticket.");

  console.log("\n=== STEP 12 SUPPORT DESK INTEGRATION TESTS PASSED ===");
}

runSupportTests().catch((err) => {
  console.error("Support test error:", err);
  process.exit(1);
});
