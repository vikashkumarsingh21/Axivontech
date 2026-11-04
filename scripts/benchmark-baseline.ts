import { performance } from "perf_hooks";
import { PrismaClient } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";

const prisma = new PrismaClient();
const SESSION_SECRET = process.env.SESSION_SECRET || "development_session_secret_at_least_32_chars_long_placeholder";
const secretKey = new TextEncoder().encode(SESSION_SECRET);

interface BenchmarkMetric {
  name: string;
  category: "AUTH" | "API_QUERY" | "DATABASE" | "MIDDLEWARE";
  durationMs: number;
  queriesCount: number;
  details?: Record<string, any>;
}

async function benchmark() {
  console.log("=================================================");
  console.log("   AXIVONTECH REAL PERFORMANCE BASELINE AUDIT   ");
  console.log("=================================================");

  const results: BenchmarkMetric[] = [];

  // Find sample test users for different roles
  const [adminUser, employeeUser, brokerUser] = await Promise.all([
    prisma.user.findFirst({
      where: { userRoles: { some: { role: { name: "ADMIN" } } } },
      select: { id: true, email: true },
    }),
    prisma.user.findFirst({
      where: { userRoles: { some: { role: { name: "EMPLOYEE" } } } },
      select: { id: true, email: true },
    }),
    prisma.user.findFirst({
      where: { userRoles: { some: { role: { name: "BROKER" } } } },
      select: { id: true, email: true, brokerProfile: { select: { id: true, referralCode: true } } },
    }),
  ]);

  console.log("Identified Test Accounts:");
  console.log(`- Admin User: ${adminUser?.email || "none"} (${adminUser?.id})`);
  console.log(`- Employee User: ${employeeUser?.email || "none"} (${employeeUser?.id})`);
  console.log(`- Broker User: ${brokerUser?.email || "none"} (${brokerUser?.id})`);

  // 1. JWT Session Creation & Verification Overhead
  {
    const t0 = performance.now();
    const token = await new SignJWT({ userId: adminUser?.id || "test", role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(secretKey);
    const signTime = performance.now() - t0;

    const t1 = performance.now();
    await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    const verifyTime = performance.now() - t1;

    results.push({
      name: "JWT Sign Session (HS256)",
      category: "AUTH",
      durationMs: parseFloat(signTime.toFixed(2)),
      queriesCount: 0,
    });
    results.push({
      name: "JWT Verify Session in Middleware",
      category: "AUTH",
      durationMs: parseFloat(verifyTime.toFixed(2)),
      queriesCount: 0,
    });
  }

  // 2. Permission Check DB Query (4-level nested join in requirePermission)
  if (adminUser) {
    const { requirePermission, invalidateUserPermissionCache } = await import("../src/lib/auth/permissions");
    invalidateUserPermissionCache();

    // Cold cache (direct database query)
    const t0 = performance.now();
    await requirePermission(adminUser.id, "admin:access");
    const coldDuration = performance.now() - t0;

    results.push({
      name: "requirePermission() Cold Database Query",
      category: "DATABASE",
      durationMs: parseFloat(coldDuration.toFixed(2)),
      queriesCount: 1,
    });

    // Warm cache (in-memory lookup)
    const t1 = performance.now();
    await requirePermission(adminUser.id, "admin:access");
    const warmDuration = performance.now() - t1;

    results.push({
      name: "requirePermission() Warm Cache Hit (Optimized)",
      category: "AUTH",
      durationMs: parseFloat(warmDuration.toFixed(2)),
      queriesCount: 0,
    });
  }

  // 3. Admin Dashboard Summary Queries (28 concurrent Promise.all)
  {
    const t0 = performance.now();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.count({ where: { status: "NEW", lastContactAt: null } }),
      prisma.lead.count({ where: { qualificationStatus: "QUALIFIED" } }),
      prisma.lead.count({ where: { status: "CONVERTED" } }),
      prisma.followUp.count({
        where: { status: { in: ["UPCOMING", "OVERDUE"] }, dueAt: { lte: todayEnd } },
      }),
      prisma.businessPartnerApplication.count().catch(() => 0),
      prisma.businessPartnerApplication.count({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      }).catch(() => 0),
      prisma.brokerProfile.count({ where: { user: { status: "ACTIVE" } } }).catch(() => 0),
      prisma.crmClient.count().catch(() => 0),
      prisma.partnerProject.count({
        where: { status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] } },
      }).catch(() => 0),
      prisma.partnerProject.count({
        where: { status: { in: ["COMPLETED", "DELIVERED"] } },
      }).catch(() => 0),
      prisma.partnerContract.count({
        where: { status: { in: ["SENT", "SIGNED_BY_PARTNER"] } },
      }).catch(() => 0),
      prisma.partnerPayment.count({ where: { status: "SUBMITTED" } }).catch(() => 0),
      prisma.commission.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.user.count({
        where: {
          status: "ACTIVE",
          userRoles: {
            none: {
              role: {
                name: { in: ["ADMIN", "FOUNDER", "CO_FOUNDER", "BROKER", "BUSINESS_PARTNER", "CLIENT"] },
              },
            },
          },
        },
      }),
      prisma.attendance.count({ where: { date: { gte: todayStart } } }).catch(() => 0),
      prisma.task.count({ where: { status: { notIn: ["COMPLETED"] } } }).catch(() => 0),
      prisma.leaveRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.workReport.count({ where: { date: { gte: todayStart } } }).catch(() => 0),
      prisma.workReport.count({ where: { status: "SUBMITTED" } }).catch(() => 0),
      prisma.holiday.count({ where: { date: { gte: todayStart }, isCompanyHoliday: true } }).catch(() => 0),
      prisma.announcement.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
      prisma.lead.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: { id: true, leadCode: true, name: true, email: true, status: true },
      }),
      prisma.lead.groupBy({ by: ["source"], _count: { id: true } }),
      prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.businessPartnerApplication.groupBy({ by: ["status"], _count: { id: true } }).catch(() => []),
      prisma.auditLog.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, action: true } }),
    ]);
    const duration = performance.now() - t0;
    results.push({
      name: "Admin Dashboard Summary (28 Concurrent DB Queries)",
      category: "API_QUERY",
      durationMs: parseFloat(duration.toFixed(2)),
      queriesCount: 28,
    });
  }

  // 4. Employee Dashboard Summary Queries
  if (employeeUser) {
    const t0 = performance.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    await Promise.all([
      prisma.attendance.findMany({
        where: {
          userId: employeeUser.id,
          OR: [{ date: { gte: yesterday, lte: tomorrow } }],
        },
        include: { breaks: true },
      }),
      prisma.workReport.findMany({
        where: { userId: employeeUser.id, date: { gte: yesterday, lte: tomorrow } },
      }),
      prisma.task.findMany({
        where: { userId: employeeUser.id },
        include: { project: true },
        orderBy: { dueDate: "asc" },
      }),
      prisma.leaveRequest.count({ where: { userId: employeeUser.id, status: "PENDING" } }),
      prisma.notification.count({ where: { userId: employeeUser.id, isRead: false } }),
      prisma.announcement.findMany({
        where: { status: "PUBLISHED" },
        take: 5,
        orderBy: { publishAt: "desc" },
      }),
      prisma.holiday.findMany({
        where: { date: { gte: today } },
        take: 3,
        orderBy: { date: "asc" },
      }),
    ]);
    const duration = performance.now() - t0;
    results.push({
      name: "Employee Dashboard Data Fetch (7 DB Queries)",
      category: "API_QUERY",
      durationMs: parseFloat(duration.toFixed(2)),
      queriesCount: 7,
    });
  }

  // 5. Broker Dashboard Summary Queries (11 DB Queries with LIKE text search)
  if (brokerUser && brokerUser.brokerProfile) {
    const t0 = performance.now();
    const brokerId = brokerUser.brokerProfile.id;
    const referralCode = brokerUser.brokerProfile.referralCode;

    await Promise.all([
      prisma.lead.findMany({
        where: {
          OR: [
            { ownerId: brokerUser.id },
            ...(referralCode ? [{ qualificationNotes: { contains: `[Referral: ${referralCode}]` } }] : []),
          ],
        },
        select: { id: true, name: true, status: true },
        take: 50,
      }),
      prisma.partnerProject.findMany({
        where: { brokerProfileId: brokerId },
        select: { id: true, projectName: true, status: true },
      }),
      prisma.commission.findMany({
        where: { brokerProfileId: brokerId },
        select: { id: true, commissionAmount: true, status: true },
      }),
      prisma.partnerContract.findMany({
        where: { partnerProject: { brokerProfileId: brokerId } },
        select: { id: true, status: true },
      }),
      prisma.partnerPayment.findMany({
        where: { partnerProject: { brokerProfileId: brokerId } },
        select: { id: true, status: true },
      }),
      prisma.notification.count({ where: { userId: brokerUser.id, isRead: false } }),
    ]);
    const duration = performance.now() - t0;
    results.push({
      name: "Broker Dashboard Data Fetch (6 DB Queries including LIKE scan)",
      category: "API_QUERY",
      durationMs: parseFloat(duration.toFixed(2)),
      queriesCount: 6,
    });
  }

  // 6. Department Manager Dashboard Queries
  {
    const t0 = performance.now();
    try {
      const dept = await prisma.department.findFirst({ select: { id: true, name: true } });
      if (dept) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const employees = await prisma.user.findMany({
          where: { department: { equals: dept.name, mode: "insensitive" }, status: { not: "DELETED" } },
          select: { id: true },
        });
        const employeeIds = employees.map((e) => e.id);

        await Promise.all([
          prisma.task.findMany({ where: { userId: { in: employeeIds } }, take: 50 }),
          prisma.attendance.findMany({ where: { userId: { in: employeeIds }, date: { gte: today } } }),
          prisma.leaveRequest.findMany({ where: { userId: { in: employeeIds }, status: "PENDING" } }),
          prisma.workReport.findMany({ where: { userId: { in: employeeIds } }, take: 20 }),
        ]);

        const duration = performance.now() - t0;
        results.push({
          name: "Manager Dashboard Queries",
          category: "API_QUERY",
          durationMs: parseFloat(duration.toFixed(2)),
          queriesCount: 5,
        });
      }
    } catch (err: any) {
      results.push({
        name: "Manager Dashboard (Table Missing in DB)",
        category: "API_QUERY",
        durationMs: parseFloat((performance.now() - t0).toFixed(2)),
        queriesCount: 1,
        details: { error: err.message },
      });
    }
  }

  // 7. Executive Dashboard Queries
  {
    const t0 = performance.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Promise.all([
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.attendance.count({ where: { date: { gte: today } } }),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.task.count({ where: { status: { notIn: ["COMPLETED"] } } }),
      prisma.task.count({ where: { status: { notIn: ["COMPLETED"] }, dueDate: { lt: new Date() } } }),
      prisma.leaveRequest.count({ where: { status: "PENDING" } }),
      prisma.approvalRequest.count({ where: { status: "PENDING" } }),
    ]);
    const duration = performance.now() - t0;
    results.push({
      name: "Executive Dashboard KPI Queries (7 DB counts)",
      category: "API_QUERY",
      durationMs: parseFloat(duration.toFixed(2)),
      queriesCount: 7,
    });
  }

  // 8. Client Portal Projects Query
  {
    const t0 = performance.now();
    await prisma.partnerProject.findMany({
      select: {
        id: true,
        projectCode: true,
        projectName: true,
        status: true,
        progressPercentage: true,
      },
      take: 20,
    });
    const duration = performance.now() - t0;
    results.push({
      name: "Client Portal Projects Query",
      category: "API_QUERY",
      durationMs: parseFloat(duration.toFixed(2)),
      queriesCount: 1,
    });
  }

  console.log("\n================ BENCHMARK RESULTS ================");
  console.table(
    results.map((r) => ({
      Metric: r.name,
      Category: r.category,
      "Duration (ms)": r.durationMs,
      Queries: r.queriesCount,
    }))
  );
  console.log("===================================================\n");

  return results;
}

benchmark()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
