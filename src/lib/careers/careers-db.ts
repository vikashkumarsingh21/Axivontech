import { db } from "@/lib/db";
import { HIRING_PROCESS_STAGES, CANDIDATE_FAQS, WHY_WORK_PILLARS, CAREERS_PAGE_STATS } from "@/data/careers";

/**
 * Ensures the database contains the foundational careers settings.
 * Safe to call repeatedly (idempotent).
 * IMPORTANT: Does NOT seed fake or mock job postings. All job postings must be
 * intentionally created and published by authorized administrators.
 */
export async function seedInitialCareersData() {
  try {
    // 1. Seed or ensure default page settings exist
    const existingSettings = await db.careersPageSetting.findUnique({
      where: { id: "default" },
    });

    if (!existingSettings) {
      await db.careersPageSetting.create({
        data: {
          id: "default",
          careersPageEnabled: false, // Default is OFF (safe, admin-controlled)
          heroEyebrow: "CAREERS AT AXIVON • INNOVATION & ENGINEERING",
          heroTitle: "Build the Future of Enterprise Software & AI",
          heroDescription:
            "Join our engineering-driven team building mission-critical SaaS, robotics, IoT, and AI solutions. We offer high-impact opportunities with hands-on production code, direct mentorship, and fast-track career growth.",
          primaryCtaText: "Explore Open Positions",
          secondaryCtaText: "Submit General Application",
          statTotalOpenings: "0",
          statWorkPolicy: CAREERS_PAGE_STATS.workArrangement || "100% Remote-First",
          statExperienceLevel: "Freshers & Experienced",
          statResponseTime: "< 48h Response",
          whyWorkTitle: "Why Launch Your Career at Axivon",
          whyWorkSubtitle:
            "We value real engineering impact. From day one, you contribute to real software deployed to production.",
          culturePillars: WHY_WORK_PILLARS as any,
          hiringSteps: HIRING_PROCESS_STAGES as any,
          faqs: CANDIDATE_FAQS as any,
          ctaHeading: "Don't See the Perfect Match?",
          ctaDescription:
            "We are always looking for driven engineers, designers, and innovators. Submit your profile for future openings or speculative roles.",
          ctaButtonText: "Send Speculative Application",
          ctaEmail: "careers@axivontech.in",
          seoTitle: "Careers at Axivon Technologies | Engineering & AI Careers",
          seoDescription:
            "Explore engineering, AI/ML, and UI/UX opportunities at Axivon Technologies. Work on production software with mentorship and high-growth potential.",
          sectionsVisibility: {
            hero: true,
            stats: true,
            whyWork: true,
            positions: true,
            hiringProcess: true,
            faq: true,
            cta: true,
            applicationForm: true,
          },
        },
      });
    }
  } catch (err: any) {
    console.warn("[Careers DB Seed Warning]:", err?.message || err);
  }
}

/**
 * Check whether the public careers page is enabled by administrators.
 * Returns false if disabled, unconfigured, or if database is unreachable.
 */
export async function isCareersPageEnabled(): Promise<boolean> {
  try {
    const setting = await db.careersPageSetting.findUnique({
      where: { id: "default" },
      select: { careersPageEnabled: true },
    });
    return setting?.careersPageEnabled ?? false;
  } catch (error) {
    console.error("[isCareersPageEnabled Error]:", error);
    return false;
  }
}

/**
 * Fetch all published, eligible jobs for the public careers page.
 * Returns ONLY genuine database records with status === 'PUBLISHED'.
 * Never returns mock or fake jobs.
 */
export async function getPublishedJobs(options?: {
  department?: string;
  search?: string;
  limit?: number;
}) {
  try {
    await seedInitialCareersData();

    const whereClause: any = {
      status: "PUBLISHED",
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } },
      ],
    };

    if (options?.department && options.department !== "All") {
      whereClause.department = options.department;
    }

    if (options?.search?.trim()) {
      const q = options.search.trim();
      whereClause.AND = [
        {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { department: { contains: q, mode: "insensitive" } },
            { skills: { hasSome: [q] } },
          ],
        },
      ];
    }

    const jobs = await db.jobPosting.findMany({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        title: true,
        department: true,
        employmentType: true,
        workArrangement: true,
        location: true,
        experienceLevel: true,
        stipend: true,
        salaryRange: true,
        summary: true,
        description: true,
        responsibilities: true,
        qualifications: true,
        skills: true,
        benefits: true,
        deadline: true,
        isFeatured: true,
        displayOrder: true,
        publishedAt: true,
      },
      orderBy: [
        { isFeatured: "desc" },
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      take: options?.limit ?? 50,
    });

    return jobs;
  } catch (error) {
    console.error("[getPublishedJobs DB Error]:", error);
    // Never return mock or fake jobs — return genuine empty list
    return [];
  }
}

/**
 * Fetch a single published job by slug.
 * Returns null if not found or unpublished. Never returns mock or fake jobs.
 */
export async function getPublishedJobBySlug(slug: string) {
  try {
    await seedInitialCareersData();

    const job = await db.jobPosting.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        department: true,
        employmentType: true,
        workArrangement: true,
        location: true,
        experienceLevel: true,
        stipend: true,
        salaryRange: true,
        summary: true,
        description: true,
        responsibilities: true,
        qualifications: true,
        skills: true,
        preferredSkills: true,
        benefits: true,
        deadline: true,
        isFeatured: true,
        seoTitle: true,
        seoDescription: true,
        publishedAt: true,
      },
    });

    if (job) return job;
    return null;
  } catch (error) {
    console.error("[getPublishedJobBySlug DB Error]:", error);
    return null;
  }
}

/**
 * Fetch the public Careers Page Settings.
 */
export async function getCareersPageSettings() {
  try {
    await seedInitialCareersData();

    const settings = await db.careersPageSetting.findUnique({
      where: { id: "default" },
    });

    if (settings) {
      return settings;
    }
  } catch (error) {
    console.warn("[getCareersPageSettings DB Warning]:", error);
  }

  // Safe default fallback with careersPageEnabled = false and statTotalOpenings = "0"
  return {
    id: "default",
    careersPageEnabled: false,
    heroEyebrow: "CAREERS AT AXIVON • INNOVATION & ENGINEERING",
    heroTitle: "Build the Future of Enterprise Software & AI",
    heroDescription:
      "Join our engineering-driven team building mission-critical SaaS, robotics, IoT, and AI solutions. We offer high-impact opportunities with hands-on production code, direct mentorship, and fast-track career growth.",
    primaryCtaText: "Explore Open Positions",
    secondaryCtaText: "Submit General Application",
    statTotalOpenings: "0",
    statWorkPolicy: "100% Remote-First",
    statExperienceLevel: "Freshers & Experienced",
    statResponseTime: "< 48h Response",
    whyWorkTitle: "Why Launch Your Career at Axivon",
    whyWorkSubtitle:
      "We value real engineering impact. From day one, you contribute to real software deployed to production.",
    culturePillars: WHY_WORK_PILLARS,
    hiringSteps: HIRING_PROCESS_STAGES,
    faqs: CANDIDATE_FAQS,
    ctaHeading: "Don't See the Perfect Match?",
    ctaDescription:
      "We are always looking for driven engineers, designers, and innovators. Submit your profile for future openings or speculative roles.",
    ctaButtonText: "Send Speculative Application",
    ctaEmail: "careers@axivontech.in",
    seoTitle: "Careers at Axivon Technologies | Engineering & AI Careers",
    seoDescription:
      "Explore engineering, AI/ML, and UI/UX opportunities at Axivon Technologies. Work on production software with mentorship and high-growth potential.",
    sectionsVisibility: {
      hero: true,
      stats: true,
      whyWork: true,
      positions: true,
      hiringProcess: true,
      faq: true,
      cta: true,
      applicationForm: true,
    },
    updatedById: null,
    updatedAt: new Date(),
  };
}

/**
 * Compute real administrative stats from the database.
 * Never fabricates numbers. If no jobs exist, 0 is returned.
 */
export async function getAdminCareersStats() {
  try {
    const [
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
      archivedJobs,
      totalApplications,
      newApplications,
      underReviewApplications,
      shortlistedApplications,
      interviewApplications,
      rejectedApplications,
    ] = await Promise.all([
      db.jobPosting.count(),
      db.jobPosting.count({ where: { status: "PUBLISHED" } }),
      db.jobPosting.count({ where: { status: "DRAFT" } }),
      db.jobPosting.count({ where: { status: "CLOSED" } }),
      db.jobPosting.count({ where: { status: "ARCHIVED" } }),
      db.careerApplication.count(),
      db.careerApplication.count({ where: { status: "NEW" } }),
      db.careerApplication.count({ where: { status: "UNDER_REVIEW" } }),
      db.careerApplication.count({ where: { status: "SHORTLISTED" } }),
      db.careerApplication.count({ where: { status: "INTERVIEW" } }),
      db.careerApplication.count({ where: { status: "REJECTED" } }),
    ]);

    return {
      jobs: {
        total: totalJobs,
        published: publishedJobs,
        draft: draftJobs,
        closed: closedJobs,
        archived: archivedJobs,
      },
      applications: {
        total: totalApplications,
        new: newApplications,
        underReview: underReviewApplications,
        shortlisted: shortlistedApplications,
        interview: interviewApplications,
        rejected: rejectedApplications,
      },
    };
  } catch (error) {
    console.error("[getAdminCareersStats DB Error]:", error);
    // Strict zero-count fallback - never invent numbers
    return {
      jobs: { total: 0, published: 0, draft: 0, closed: 0, archived: 0 },
      applications: { total: 0, new: 0, underReview: 0, shortlisted: 0, interview: 0, rejected: 0 },
    };
  }
}
