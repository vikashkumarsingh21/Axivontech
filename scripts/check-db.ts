import { db } from "../src/lib/db";

async function main() {
  console.log("Connecting to database...");
  await db.$connect();
  console.log("Connected successfully!");

  const userCount = await db.user.count();
  console.log("User count in DB:", userCount);

  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      userRoles: { include: { role: true } },
    },
    take: 5,
  });
  console.log("Sample Users:", JSON.stringify(users, null, 2));

  try {
    const jobCount = await db.jobPosting.count();
    console.log("Job count in DB:", jobCount);
    const jobs = await db.jobPosting.findMany({
      select: { id: true, title: true, status: true, slug: true },
    });
    console.log("Jobs in DB:", jobs);
  } catch (e: any) {
    console.error("JobPosting table error:", e.message);
  }

  try {
    const appCount = await db.careerApplication.count();
    console.log("Application count in DB:", appCount);
    const apps = await db.careerApplication.findMany({
      select: { id: true, fullName: true, status: true, email: true },
    });
    console.log("Applications in DB:", apps);
  } catch (e: any) {
    console.error("CareerApplication table error:", e.message);
  }

  try {
    const settings = await db.careersPageSetting.findUnique({
      where: { id: "default" },
    });
    console.log("CareersPageSetting in DB:", settings ? "Found" : "Not Found");
    if (settings) {
      console.log("Settings keys:", Object.keys(settings));
    }
  } catch (e: any) {
    console.error("CareersPageSetting table error:", e.message);
  }
}

main()
  .catch((e) => console.error("Error running check:", e))
  .finally(() => db.$disconnect());
