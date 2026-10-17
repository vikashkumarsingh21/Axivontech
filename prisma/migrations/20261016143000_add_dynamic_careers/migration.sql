-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL DEFAULT 'Internship',
    "workArrangement" TEXT NOT NULL DEFAULT 'Remote',
    "location" TEXT NOT NULL DEFAULT 'Remote (India)',
    "experienceLevel" TEXT NOT NULL DEFAULT '0–1 Years / Freshers Welcome',
    "minExperience" INTEGER DEFAULT 0,
    "maxExperience" INTEGER DEFAULT 1,
    "stipend" TEXT,
    "salaryRange" TEXT,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "qualifications" TEXT[],
    "skills" TEXT[],
    "preferredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "jobTitle" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "currentRole" TEXT,
    "experience" TEXT,
    "resumeUrl" TEXT NOT NULL,
    "resumeFileName" TEXT,
    "portfolioUrl" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "coverLetter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "rating" INTEGER,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareersPageSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "careersPageEnabled" BOOLEAN NOT NULL DEFAULT false,
    "heroEyebrow" TEXT NOT NULL DEFAULT 'CAREERS AT AXIVON • WE ARE HIRING INTERNS',
    "heroTitle" TEXT NOT NULL DEFAULT 'Build the Future of Enterprise Software & AI',
    "heroDescription" TEXT NOT NULL DEFAULT 'Join our engineering-driven team building mission-critical SaaS, robotics, IoT, and AI solutions. We offer high-impact remote internships with hands-on production code, direct mentorship, and fast-track career growth.',
    "primaryCtaText" TEXT NOT NULL DEFAULT 'Explore Open Positions',
    "secondaryCtaText" TEXT NOT NULL DEFAULT 'Submit General Application',
    "statTotalOpenings" TEXT NOT NULL DEFAULT '0',
    "statWorkPolicy" TEXT NOT NULL DEFAULT '100% Remote-First',
    "statExperienceLevel" TEXT NOT NULL DEFAULT '0–1 Years Focus',
    "statResponseTime" TEXT NOT NULL DEFAULT '< 48h Response',
    "whyWorkTitle" TEXT NOT NULL DEFAULT 'Why Launch Your Career at Axivon',
    "whyWorkSubtitle" TEXT NOT NULL DEFAULT 'We don''t give interns busywork. From week one, you contribute to real software deployed to production.',
    "culturePillars" JSONB,
    "hiringSteps" JSONB,
    "faqs" JSONB,
    "ctaHeading" TEXT NOT NULL DEFAULT 'Don''t See the Perfect Match?',
    "ctaDescription" TEXT NOT NULL DEFAULT 'We are always looking for driven engineers, designers, and innovators. Submit your profile for future openings or speculative roles.',
    "ctaButtonText" TEXT NOT NULL DEFAULT 'Send Speculative Application',
    "ctaEmail" TEXT NOT NULL DEFAULT 'careers@axivontech.in',
    "seoTitle" TEXT NOT NULL DEFAULT 'Careers at Axivon Technologies | Remote Engineering & AI Internships',
    "seoDescription" TEXT NOT NULL DEFAULT 'Explore remote engineering, AI/ML, and UI/UX internship opportunities at Axivon Technologies. Work on production software with mentorship and high-growth potential.',
    "sectionsVisibility" JSONB,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareersPageSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_slug_key" ON "JobPosting"("slug");

-- CreateIndex
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");

-- CreateIndex
CREATE INDEX "JobPosting_slug_idx" ON "JobPosting"("slug");

-- CreateIndex
CREATE INDEX "JobPosting_department_idx" ON "JobPosting"("department");

-- CreateIndex
CREATE INDEX "JobPosting_isFeatured_idx" ON "JobPosting"("isFeatured");

-- CreateIndex
CREATE INDEX "JobPosting_displayOrder_idx" ON "JobPosting"("displayOrder");

-- CreateIndex
CREATE INDEX "JobPosting_createdAt_idx" ON "JobPosting"("createdAt");

-- CreateIndex
CREATE INDEX "CareerApplication_status_idx" ON "CareerApplication"("status");

-- CreateIndex
CREATE INDEX "CareerApplication_jobId_idx" ON "CareerApplication"("jobId");

-- CreateIndex
CREATE INDEX "CareerApplication_email_idx" ON "CareerApplication"("email");

-- CreateIndex
CREATE INDEX "CareerApplication_createdAt_idx" ON "CareerApplication"("createdAt");

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerApplication" ADD CONSTRAINT "CareerApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerApplication" ADD CONSTRAINT "CareerApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareersPageSetting" ADD CONSTRAINT "CareersPageSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
