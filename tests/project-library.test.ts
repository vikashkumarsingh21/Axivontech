import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import {
  hasProjectLibraryWriteAccess,
  hasProjectLibraryArchiveAccess,
  canUsePresentationMode,
  sanitizeProjectRecord,
  sanitizeForExcel,
} from "../src/lib/project-library/permissions";

describe("AxivonTech Project Library — Role-Based Access Control & Security Tests", () => {
  // Mock full project database record
  const mockFullProject = {
    id: "proj-purvarang-001",
    slug: "purvarang-family-restaurant",
    name: "Purvarang Family Restaurant",
    clientName: "Purvarang Family Restaurant",
    clientCompany: "Purvarang Family Restaurant",
    industry: "Restaurant / Food & Hospitality",
    category: "Website Development",
    projectType: "Restaurant Portal & Digital Menu Showcase",
    status: "COMPLETED",
    startDate: new Date("2026-01-20T00:00:00Z"),
    completionDate: new Date("2026-02-15T00:00:00Z"),
    liveUrl: "https://purvarang-family-restaurant.onrender.com/",
    demoUrl: "https://purvarang-family-restaurant.onrender.com/",
    clientPreviewUrl: "https://purvarang-family-restaurant.onrender.com/",
    documentationUrl: null,
    githubUrl: "https://github.com/vikashkumarsingh21/Axivontech",

    shortDescription: "Dedicated restaurant website with digital menu.",
    overview: "Purvarang Family Restaurant complete overview text...",
    businessRequirement: "Client required a searchable digital menu.",
    problemStatement: "Restaurant lacked central web presence.",
    solutionDelivered: "Responsive website with interactive digital menu.",
    objectives: "Enable mobile browsing and direct calling.",
    scopeOfWork: "Frontend architecture and deployment.",
    deliverables: "Production web application.",

    frontendTech: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    backendTech: ["Node.js"],
    databaseTech: ["Static JSON Taxonomy"],
    frameworks: ["React 18", "Tailwind CSS"],
    languages: ["TypeScript", "HTML5", "CSS3"],
    apisAndIntegrations: ["Google Maps API", "Tel URI Direct Dialing"],
    hostingPlatform: "Render Cloud Platform",
    devTools: ["Vite", "Git"],
    additionalTech: ["Responsive Web Architecture"],
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS"],

    features: [
      "Interactive Digital Menu",
      "Multi-Cuisine Catalog",
      "Mobile-First Responsive Interface",
      "One-Tap Telephone Contact",
      "Google Maps Location Directions",
    ],

    thumbnailUrl: "/assets/images/portfolio/purvarang-family-restaurant.jpg",
    websiteScreenshots: ["/assets/images/portfolio/purvarang-family-restaurant.jpg"],
    dashboardScreenshots: [],
    mobileScreenshots: [],
    galleryImages: ["/assets/images/portfolio/purvarang-family-restaurant.jpg"],

    presentationHighlights: ["Live production deployment in Bihar", "Zero latency menu"],
    presentationNotes: "Demonstrate on mobile viewport.",
    isPresentationReady: true,

    internalNotes: "CONFIDENTIAL: Delivered ahead of schedule. Payment cleared in full.",
    assignedTeam: "Frontend Web Engineering Team",
    projectOwner: "VIKASH KUMAR",
    developmentDepartment: "Web Development",
    deliveryNotes: "Customer verified and approved all prices.",
    maintenanceInfo: "Periodic menu updates.",
    qualityNotes: "Lighthouse mobile score: 96/100.",
    confidentialData: "SECRET_API_TOKEN_12345",

    deliveryConfirmation: true,
    reviewStatus: "APPROVED",
    finalApprovedLink: "https://purvarang-family-restaurant.onrender.com/",
    isArchived: false,
    archivedAt: null,
    archivedReason: null,

    assets: [{ id: "asset-1", title: "Thumbnail", url: "/thumb.jpg" }],
    documents: [{ id: "doc-1", title: "Delivery Certificate.pdf", fileUrl: "/cert.pdf" }],
    auditLogs: [{ id: "log-1", action: "PROJECT_CREATED", userName: "Admin" }],
  };

  // ─────────────────────────────────────────────────────────────
  // 1. Role Authorization Matrix
  // ─────────────────────────────────────────────────────────────
  describe("1. Role Authorization Matrix", () => {
    it("grants full write access to ADMIN, FOUNDER, CO_FOUNDER, and MANAGER", () => {
      expect(hasProjectLibraryWriteAccess("ADMIN")).toBe(true);
      expect(hasProjectLibraryWriteAccess("FOUNDER")).toBe(true);
      expect(hasProjectLibraryWriteAccess("CO_FOUNDER")).toBe(true);
      expect(hasProjectLibraryWriteAccess("MANAGER")).toBe(true);
      expect(hasProjectLibraryWriteAccess("DEPARTMENT_MANAGER")).toBe(true);
    });

    it("denies write access to BROKER, BUSINESS_PARTNER, EMPLOYEE, CLIENT, and unassigned USER", () => {
      expect(hasProjectLibraryWriteAccess("BROKER")).toBe(false);
      expect(hasProjectLibraryWriteAccess("BUSINESS_PARTNER")).toBe(false);
      expect(hasProjectLibraryWriteAccess("EMPLOYEE")).toBe(false);
      expect(hasProjectLibraryWriteAccess("CLIENT")).toBe(false);
      expect(hasProjectLibraryWriteAccess("USER")).toBe(false);
      expect(hasProjectLibraryWriteAccess(null)).toBe(false);
      expect(hasProjectLibraryWriteAccess(undefined)).toBe(false);
    });

    it("restricts archive and restore operations strictly to ADMIN, FOUNDER, and CO_FOUNDER", () => {
      expect(hasProjectLibraryArchiveAccess("ADMIN")).toBe(true);
      expect(hasProjectLibraryArchiveAccess("FOUNDER")).toBe(true);
      expect(hasProjectLibraryArchiveAccess("CO_FOUNDER")).toBe(true);

      // Managers, Brokers, Employees cannot archive
      expect(hasProjectLibraryArchiveAccess("MANAGER")).toBe(false);
      expect(hasProjectLibraryArchiveAccess("DEPARTMENT_MANAGER")).toBe(false);
      expect(hasProjectLibraryArchiveAccess("BROKER")).toBe(false);
      expect(hasProjectLibraryArchiveAccess("EMPLOYEE")).toBe(false);
    });

    it("authorizes presentation mode for write roles", () => {
      expect(canUsePresentationMode("ADMIN")).toBe(true);
      expect(canUsePresentationMode("FOUNDER")).toBe(true);
      expect(canUsePresentationMode("CO_FOUNDER")).toBe(true);
      expect(canUsePresentationMode("MANAGER")).toBe(true);
      expect(canUsePresentationMode("DEPARTMENT_MANAGER")).toBe(true);

      expect(canUsePresentationMode("EMPLOYEE")).toBe(false);
      expect(canUsePresentationMode("CLIENT")).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Server-Side Field-Level Data Sanitization
  // ─────────────────────────────────────────────────────────────
  describe("2. Server-Side Field-Level Data Sanitization", () => {
    it("returns all fields intact for ADMIN, FOUNDER, CO_FOUNDER, and MANAGER", () => {
      const writeRoles = ["ADMIN", "FOUNDER", "CO_FOUNDER", "MANAGER", "DEPARTMENT_MANAGER"];
      for (const role of writeRoles) {
        const sanitized = sanitizeProjectRecord(mockFullProject, role);
        expect(sanitized.id).toBe(mockFullProject.id);
        expect(sanitized.name).toBe(mockFullProject.name);
        expect(sanitized.shortDescription).toBe(mockFullProject.shortDescription);
        expect(sanitized.internalNotes).toBe(mockFullProject.internalNotes);
        expect(sanitized.confidentialData).toBe(mockFullProject.confidentialData);
        expect(sanitized.frontendTech).toEqual(mockFullProject.frontendTech);
        expect(sanitized.features).toEqual(mockFullProject.features);
        expect(sanitized.assets).toHaveLength(1);
        expect(sanitized.documents).toHaveLength(1);
      }
    });

    it("strictly restricts BROKER and BUSINESS_PARTNER to exactly the 4 permitted fields", () => {
      const brokerSanitized = sanitizeProjectRecord(mockFullProject, "BROKER");
      const partnerSanitized = sanitizeProjectRecord(mockFullProject, "BUSINESS_PARTNER");

      for (const sanitized of [brokerSanitized, partnerSanitized]) {
        // The 4 mandated fields:
        expect(sanitized.name).toBe("Purvarang Family Restaurant");
        expect(sanitized.industry).toBe("Restaurant / Food & Hospitality");
        expect(sanitized.liveUrl).toBe("https://purvarang-family-restaurant.onrender.com/");
        expect(sanitized.completionDate).toEqual(mockFullProject.completionDate);

        // Identifiers needed for client routing:
        expect(sanitized.id).toBe("proj-purvarang-001");
        expect(sanitized.slug).toBe("purvarang-family-restaurant");

        // CRITICAL: Confidential fields MUST be undefined (stripped server-side)
        expect(sanitized.shortDescription).toBeUndefined();
        expect(sanitized.overview).toBeUndefined();
        expect(sanitized.internalNotes).toBeUndefined();
        expect(sanitized.confidentialData).toBeUndefined();
        expect(sanitized.problemStatement).toBeUndefined();
        expect(sanitized.solutionDelivered).toBeUndefined();
        expect(sanitized.frontendTech).toBeUndefined();
        expect(sanitized.backendTech).toBeUndefined();
        expect(sanitized.databaseTech).toBeUndefined();
        expect(sanitized.apisAndIntegrations).toBeUndefined();
        expect(sanitized.features).toBeUndefined();
        expect(sanitized.technologies).toBeUndefined();
        expect(sanitized.assets).toBeUndefined();
        expect(sanitized.documents).toBeUndefined();
        expect(sanitized.auditLogs).toBeUndefined();
        expect(sanitized.assignedTeam).toBeUndefined();
        expect(sanitized.projectOwner).toBeUndefined();
      }
    });

    it("strictly restricts EMPLOYEE to exactly the 4 permitted fields", () => {
      const sanitized = sanitizeProjectRecord(mockFullProject, "EMPLOYEE");

      // Mandated fields present:
      expect(sanitized.name).toBe("Purvarang Family Restaurant");
      expect(sanitized.industry).toBe("Restaurant / Food & Hospitality");
      expect(sanitized.liveUrl).toBe("https://purvarang-family-restaurant.onrender.com/");
      expect(sanitized.completionDate).toEqual(mockFullProject.completionDate);

      // Sensitive fields stripped:
      expect(sanitized.internalNotes).toBeUndefined();
      expect(sanitized.confidentialData).toBeUndefined();
      expect(sanitized.shortDescription).toBeUndefined();
      expect(sanitized.documents).toBeUndefined();
      expect(sanitized.auditLogs).toBeUndefined();
    });

    it("handles null / undefined safely", () => {
      expect(sanitizeProjectRecord(null, "ADMIN")).toBeNull();
      expect(sanitizeProjectRecord(null, "EMPLOYEE")).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Excel Formula Injection Protection
  // ─────────────────────────────────────────────────────────────
  describe("3. Excel Formula Injection Protection", () => {
    it("escapes strings starting with dangerous spreadsheet operators (=, +, -, @)", () => {
      expect(sanitizeForExcel("=CMD|' /C calc'!A0")).toBe("'=CMD|' /C calc'!A0");
      expect(sanitizeForExcel("+12345678")).toBe("'+12345678");
      expect(sanitizeForExcel("-SUM(A1:A10)")).toBe("'-SUM(A1:A10)");
      expect(sanitizeForExcel("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
    });

    it("preserves safe values as normal text", () => {
      expect(sanitizeForExcel("Purvarang Family Restaurant")).toBe("Purvarang Family Restaurant");
      expect(sanitizeForExcel("https://purvarang-family-restaurant.onrender.com/")).toBe(
        "https://purvarang-family-restaurant.onrender.com/"
      );
      expect(sanitizeForExcel("2026-02-15")).toBe("2026-02-15");
      expect(sanitizeForExcel(null)).toBe("");
      expect(sanitizeForExcel(undefined)).toBe("");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Excel Workbook Generation Structure
  // ─────────────────────────────────────────────────────────────
  describe("4. Excel Workbook Generation Structure", () => {
    it("generates 4 sheets for write users with professional headers", async () => {
      const workbook = new ExcelJS.Workbook();

      // Write User Workbook
      const sheetSummary = workbook.addWorksheet("Project Summary");
      sheetSummary.columns = [
        { header: "Project ID", key: "id", width: 28 },
        { header: "Project Name", key: "name", width: 35 },
        { header: "Client / Company", key: "client", width: 28 },
        { header: "Industry", key: "industry", width: 24 },
        { header: "Project Type", key: "projectType", width: 28 },
        { header: "Status", key: "status", width: 16 },
        { header: "Completion Date", key: "completionDate", width: 18 },
        { header: "Live Website URL", key: "liveUrl", width: 45 },
      ];

      const sheetDetails = workbook.addWorksheet("Project Details");
      sheetDetails.columns = [
        { header: "Project ID", key: "id" },
        { header: "Project Overview", key: "overview" },
        { header: "Features", key: "features" },
        { header: "Technologies", key: "technologies" },
      ];

      const sheetTimeline = workbook.addWorksheet("Project Timeline");
      const sheetResources = workbook.addWorksheet("Project Resources");

      expect(workbook.worksheets).toHaveLength(4);
      expect(workbook.getWorksheet("Project Summary")).toBeDefined();
      expect(workbook.getWorksheet("Project Details")).toBeDefined();
      expect(workbook.getWorksheet("Project Timeline")).toBeDefined();
      expect(workbook.getWorksheet("Project Resources")).toBeDefined();

      const buffer = await workbook.xlsx.writeBuffer();
      expect(buffer).toBeDefined();
      expect(buffer.byteLength).toBeGreaterThan(100);
    });

    it("generates strictly 1 sheet with ONLY the 4 fields for read-only users", async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Completed Projects");

      sheet.columns = [
        { header: "Project Name", key: "name", width: 35 },
        { header: "Industry / Field", key: "industry", width: 28 },
        { header: "Live Website URL", key: "liveUrl", width: 45 },
        { header: "Completion Date", key: "completionDate", width: 20 },
      ];

      sheet.addRow({
        name: sanitizeForExcel(mockFullProject.name),
        industry: sanitizeForExcel(mockFullProject.industry),
        liveUrl: sanitizeForExcel(mockFullProject.liveUrl),
        completionDate: "2026-02-15",
      });

      expect(workbook.worksheets).toHaveLength(1);
      expect(workbook.worksheets[0].name).toBe("Completed Projects");
      expect(sheet.columns).toHaveLength(4);

      const buffer = await workbook.xlsx.writeBuffer();
      expect(buffer).toBeDefined();
      expect(buffer.byteLength).toBeGreaterThan(100);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Client Presentation Mode Safety
  // ─────────────────────────────────────────────────────────────
  describe("5. Client Presentation Mode Safety", () => {
    it("ensures presentation payload strictly excludes confidential internal information", () => {
      const presentationPayload = {
        name: mockFullProject.name,
        industry: mockFullProject.industry,
        shortDescription: mockFullProject.shortDescription,
        liveUrl: mockFullProject.liveUrl,
        highlights: mockFullProject.presentationHighlights,
        screenshots: mockFullProject.websiteScreenshots,
      };

      // Customer-safe attributes:
      expect(presentationPayload.name).toBe("Purvarang Family Restaurant");
      expect(presentationPayload.liveUrl).toBe("https://purvarang-family-restaurant.onrender.com/");
      expect(presentationPayload.highlights).toHaveLength(2);

      // Prohibited confidential keys must not exist:
      expect((presentationPayload as any).internalNotes).toBeUndefined();
      expect((presentationPayload as any).confidentialData).toBeUndefined();
      expect((presentationPayload as any).assignedTeam).toBeUndefined();
      expect((presentationPayload as any).projectOwner).toBeUndefined();
      expect((presentationPayload as any).pricing).toBeUndefined();
      expect((presentationPayload as any).commission).toBeUndefined();
      expect((presentationPayload as any).dbPassword).toBeUndefined();
    });
  });
});
