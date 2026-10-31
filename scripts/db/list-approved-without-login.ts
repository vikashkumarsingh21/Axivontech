import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking for APPROVED applications without usable login accounts...\n");

  const approvedApps = await prisma.businessPartnerApplication.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${approvedApps.length} total APPROVED application(s).\n`);

  const results = [];

  for (const app of approvedApps) {
    const user = await prisma.user.findUnique({
      where: { email: app.email.toLowerCase().trim() },
      include: {
        brokerProfile: true,
        userRoles: { include: { role: true } },
      },
    });

    let hasUsableLogin = false;
    let reason = "";

    if (!user) {
      reason = "No User account exists for this email.";
    } else if (user.status === "PENDING_ACTIVATION") {
      reason = "User exists but is stuck in PENDING_ACTIVATION (activation link never clicked/completed).";
    } else if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
      reason = `User account exists but is ${user.status}.`;
    } else if (!user.brokerProfile) {
      reason = "User account exists and is ACTIVE, but no linked BrokerProfile exists.";
    } else {
      hasUsableLogin = true;
    }

    results.push({
      applicationId: app.applicationId,
      name: app.fullName,
      email: app.email,
      reviewedAt: app.reviewedAt,
      hasUsableLogin,
      reason: hasUsableLogin ? "Active with linked BrokerProfile" : reason,
      userStatus: user?.status || "NO_USER",
      partnerId: user?.brokerProfile?.partnerId || "NONE",
      referralCode: user?.brokerProfile?.referralCode || "NONE",
    });
  }

  console.table(results);

  const withoutLogin = results.filter((r) => !r.hasUsableLogin);
  console.log(`\n⚠️ Summary: ${withoutLogin.length} of ${approvedApps.length} approved applications DO NOT have a usable login.`);
}

main()
  .catch((e) => {
    console.error("Error executing dry-run script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
