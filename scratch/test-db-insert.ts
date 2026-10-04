import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";

const db = new PrismaClient();

async function testCreate() {
  try {
    const applicationId = "BPA-2026-TEST";
    const verificationToken = crypto.randomUUID();

    const application = await db.businessPartnerApplication.create({
      data: {
        applicationId,
        fullName: "Test User",
        email: "test2@example.com",
        phone: "1234567890",
        country: "Test",
        state: "Test",
        city: "Test",
        occupation: "Test",
        currentWork: "Test",
        yearsOfExperience: null,
        relevantExperience: "Test",
        clientNetwork: "Test",
        education10th: { school: "A", board: "B", passingYear: "C", percentage: "D" } as Prisma.InputJsonValue,
        education12th: Prisma.DbNull,
        educationUndergrad: Prisma.DbNull,
        motivation: "Test",
        contribution: "Test",
        additionalInfo: "Test",
        status: "SUBMITTED",
        verificationToken,
      },
    });
    console.log("App created", application.id);

    await db.backgroundJob.create({
        data: {
          jobType: "SEND_EMAIL",
          payload: { to: "test@example.com" } as Prisma.InputJsonValue,
          scheduledAt: new Date(),
          status: "PENDING",
        },
    });
    console.log("Job created");

    await db.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        previousStatus: null,
        newStatus: "SUBMITTED",
        reason: "Application submitted by applicant",
      },
    });
    console.log("History created");

  } catch (e) {
    console.error("Error creating:", e);
  } finally {
    await db.$disconnect();
  }
}

testCreate();
