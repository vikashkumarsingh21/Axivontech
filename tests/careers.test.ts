import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  JOB_POSITIONS,
  getOpenJobs,
  getJobById,
  CAREER_HIGHLIGHTS,
  RECRUITMENT_STAGES,
  CAREERS_FAQS,
} from "@/data/careers";

// Shared state for controlling mocked careers recruitment toggle in tests
let mockCareersEnabled = false;

vi.mock("@/lib/careers/careers-db", async () => {
  const actual = await vi.importActual<any>("@/lib/careers/careers-db");
  return {
    ...actual,
    isCareersPageEnabled: vi.fn(() => Promise.resolve(mockCareersEnabled)),
    getPublishedJobs: vi.fn(async () => {
      // In the new system, when no jobs are in the DB, it strictly returns []
      return [];
    }),
    getPublishedJobBySlug: vi.fn(async (_slug: string) => {
      return null;
    }),
  };
});

describe("Careers Static Reference Data Integrity", () => {
  it("should contain exactly 5 verified internship positions", () => {
    expect(JOB_POSITIONS.length).toBe(5);

    const slugs = JOB_POSITIONS.map((j) => j.slug);
    expect(slugs).toContain("frontend-developer-intern");
    expect(slugs).toContain("backend-developer-intern");
    expect(slugs).toContain("full-stack-developer-intern");
    expect(slugs).toContain("ai-ml-intern");
    expect(slugs).toContain("ui-ux-design-intern");
  });

  it("should have comprehensive role descriptions and skills for all positions", () => {
    for (const job of JOB_POSITIONS) {
      expect(job.title).toBeTruthy();
      expect(job.department).toBeTruthy();
      expect(job.type).toBe("Internship");
      expect(job.workMode).toBe("Remote");
      expect(job.location).toContain("Remote");
      expect(job.experience).toBe("0–1 Years");
      expect(job.shortDescription.length).toBeGreaterThan(20);
      expect(job.roleOverview.length).toBeGreaterThan(50);
      expect(job.responsibilities.length).toBeGreaterThanOrEqual(4);
      expect(job.qualifications.length).toBeGreaterThanOrEqual(4);
      expect(job.skills.length).toBeGreaterThanOrEqual(4);
      expect(job.status).toBe("Open");
    }
  });

  it("should correctly filter open jobs and look up by id or slug", () => {
    const openJobs = getOpenJobs();
    expect(openJobs.length).toBe(5);

    const frontendById = getJobById("frontend-intern");
    expect(frontendById?.title).toBe("Frontend Developer Intern");

    const aimlBySlug = getJobById("ai-ml-intern");
    expect(aimlBySlug?.title).toBe("AI / Machine Learning Intern");

    const nonExistent = getJobById("non-existent-role");
    expect(nonExistent).toBeUndefined();
  });

  it("should accurately reflect verified hiring statistics without inflated numbers", () => {
    expect(CAREER_HIGHLIGHTS.totalOpenings).toBe(5);
    expect(CAREER_HIGHLIGHTS.workArrangement).toBe("100% Remote-First");
    expect(CAREER_HIGHLIGHTS.experienceLevel).toContain("0–1 Years");
    expect(CAREER_HIGHLIGHTS.focusAreas.length).toBeGreaterThanOrEqual(4);
  });

  it("should define honest recruitment stages and candidate FAQs", () => {
    expect(RECRUITMENT_STAGES.length).toBe(4);
    expect(RECRUITMENT_STAGES[0].title).toBe("Submit Application");
    expect(RECRUITMENT_STAGES[3].title).toBe("Welcome & Onboarding");

    expect(CAREERS_FAQS.length).toBe(6);
    for (const faq of CAREERS_FAQS) {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    }
  });
});

describe("Admin-Controlled Careers Visibility & Access Guards", () => {
  beforeEach(() => {
    mockCareersEnabled = false;
  });

  it("should reject candidate applications with HTTP 403 when recruitment is disabled (OFF)", async () => {
    const { POST } = await import("@/app/api/careers/route");
    const request = new Request("http://localhost:3000/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Candidate",
        email: "candidate@example.com",
        position: "Frontend Developer Intern",
        location: "Patna, Bihar",
        resumeUrl: "https://drive.google.com/test-resume",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain("Recruitment is currently closed");
  }, 15000);

  it("should reject resume uploads with HTTP 403 when recruitment is disabled (OFF)", async () => {
    const { POST: uploadHandler } = await import("@/app/api/v1/public/careers/upload-resume/route");
    const formData = new FormData();
    const pdfFile = new File(["dummy pdf content"], "resume.pdf", { type: "application/pdf" });
    formData.append("file", pdfFile);

    const request = new Request("http://localhost:3000/api/v1/public/careers/upload-resume", {
      method: "POST",
      body: formData,
    });

    const response = await uploadHandler(request as any);
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toContain("Recruitment is currently closed");
  });
});

describe("Careers API Validations When Recruitment is Active (ON)", () => {
  beforeEach(() => {
    mockCareersEnabled = true;
  });

  it("should reject applications with missing required fields", async () => {
    const { POST } = await import("@/app/api/careers/route");
    const request = new Request("http://localhost:3000/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Candidate",
        captchaToken: "1x00000000000000000000AA",
        // missing email, position, location, resumeUrl
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain("Please fill all required fields");
  });

  it("should reject invalid email formats", async () => {
    const { POST } = await import("@/app/api/careers/route");
    const request = new Request("http://localhost:3000/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Test Candidate",
        email: "not-an-email",
        position: "Frontend Developer Intern",
        location: "Patna, Bihar",
        resumeUrl: "https://drive.google.com/test-resume",
        captchaToken: "1x00000000000000000000AA",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain("valid email address");
  });

  it("should successfully process a well-formed application", async () => {
    const { POST } = await import("@/app/api/careers/route");
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("Success"),
    } as any);

    const request = new Request("http://localhost:3000/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Ananya Sharma",
        email: "ananya.sharma@example.com",
        phone: "+91 9876543210",
        position: "Frontend Developer Intern",
        location: "New Delhi, India",
        resumeUrl: "https://drive.google.com/file/d/test-id/view",
        github: "https://github.com/ananya-dev",
        portfolio: "https://ananya.dev",
        coverLetter: "Excited about modern Next.js and Tailwind development at Axivon.",
        captchaToken: "1x00000000000000000000AA",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("application has been received");

    global.fetch = originalFetch;
  });

  it("should reject resume upload requests without a file payload", async () => {
    const { POST: uploadHandler } = await import("@/app/api/v1/public/careers/upload-resume/route");
    const formData = new FormData();
    formData.append("captchaToken", "1x00000000000000000000AA");
    const request = new Request("http://localhost:3000/api/v1/public/careers/upload-resume", {
      method: "POST",
      body: formData,
    });

    const response = await uploadHandler(request as any);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("No resume file was uploaded");
  });

  it("should reject executable or disallowed file extensions for resume uploads", async () => {
    const { POST: uploadHandler } = await import("@/app/api/v1/public/careers/upload-resume/route");
    const formData = new FormData();
    formData.append("captchaToken", "1x00000000000000000000AA");
    const maliciousFile = new File(["malicious script"], "payload.exe", { type: "application/x-msdownload" });
    formData.append("file", maliciousFile);

    const request = new Request("http://localhost:3000/api/v1/public/careers/upload-resume", {
      method: "POST",
      body: formData,
    });

    const response = await uploadHandler(request as any);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("Invalid file format");
  });
});

describe("Dynamic Careers DB Invariant (No Fake Jobs)", () => {
  it("should return an empty list of published jobs when none are published in the database", async () => {
    const { getPublishedJobs, getPublishedJobBySlug, getCareersPageSettings } = await import("@/lib/careers/careers-db");
    const jobs = await getPublishedJobs();
    expect(jobs).toBeDefined();
    expect(jobs.length).toBe(0);

    const nonExistent = await getPublishedJobBySlug("frontend-developer-intern");
    expect(nonExistent).toBeNull();

    const settings = await getCareersPageSettings();
    expect(settings).toBeDefined();
    expect(settings.heroTitle).toBeTruthy();
    expect(typeof settings.careersPageEnabled).toBe("boolean");
  });
});
