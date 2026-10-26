import { describe, it, expect, vi, beforeEach } from "vitest";
import ExcelJS from "exceljs";
import {
  AxivonExcelBuilder,
  sanitizeCellValue,
  buildCsvContent,
  ColumnDefinition,
} from "../src/lib/export/excel-builder";
import {
  APPLICATION_COLUMNS,
  CONFIRMED_PARTNER_COLUMNS,
  transformApplicationRow,
  transformConfirmedPartnerRow,
} from "../src/lib/export/partners-export-service";
import { isRateLimited } from "../src/lib/rate-limit";

describe("Admin Excel Export System (Part A)", () => {
  describe("1. Security: Excel Formula Injection Protection", () => {
    it("neutralizes malicious strings starting with =, +, -, @, \\t, \\r", () => {
      expect(sanitizeCellValue("=HYPERLINK('http://malicious.com','Click Me')")).toBe(
        "'=HYPERLINK('http://malicious.com','Click Me')"
      );
      expect(sanitizeCellValue("+1234567890")).toBe("'+1234567890");
      expect(sanitizeCellValue("-SUM(A1:A10)")).toBe("'-SUM(A1:A10)");
      expect(sanitizeCellValue("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
      expect(sanitizeCellValue("\tmalicious_tab")).toBe("'\tmalicious_tab");
      expect(sanitizeCellValue("\rmalicious_cr")).toBe("'\rmalicious_cr");
    });

    it("preserves safe strings, numbers, and dates untouched", () => {
      expect(sanitizeCellValue("Normal Text")).toBe("Normal Text");
      expect(sanitizeCellValue("john.doe@axivon.dev")).toBe("john.doe@axivon.dev");
      expect(sanitizeCellValue(12345)).toBe(12345);
      const now = new Date();
      expect(sanitizeCellValue(now)).toBe(now);
      expect(sanitizeCellValue(null)).toBe(null);
      expect(sanitizeCellValue(undefined)).toBe(undefined);
    });
  });

  describe("2. Excel Builder & Workbook Structure", () => {
    it("generates a valid .xlsx file with Summary sheet and Data sheet", async () => {
      const builder = new AxivonExcelBuilder();

      builder.addSummarySheet({
        title: "Test Business Partner Register",
        generatedBy: "Admin Tester (admin@axivon.dev)",
        generatedAt: "2026-10-26 15:30:00 IST",
        exportType: "Confirmed Partners",
        filtersUsed: { Status: "ACTIVE", City: "Mumbai" },
        totalRows: 2,
        isMasked: true,
      });

      const columns: ColumnDefinition[] = [
        { key: "partnerId", header: "Partner ID", width: 18, type: "text" },
        { key: "name", header: "Partner Name", width: 22, type: "text" },
        { key: "totalEarned", header: "Total Earned", width: 20, type: "currency" },
        { key: "createdDate", header: "Created Date", width: 18, type: "date" },
      ];

      const rows = [
        {
          partnerId: "AXV-BP-1001",
          name: "John Doe",
          totalEarned: 45000.5,
          createdDate: new Date("2026-01-15T10:00:00Z"),
        },
        {
          partnerId: "AXV-BP-1002",
          name: "=HYPERLINK('http://attacker.com')",
          totalEarned: 125000,
          createdDate: new Date("2026-02-20T10:00:00Z"),
        },
      ];

      builder.addDataSheet("Data", columns, rows);

      const buffer = await builder.writeToBuffer();
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);

      // Read back via ExcelJS to verify workbook integrity
      const loadedWb = new ExcelJS.Workbook();
      await loadedWb.xlsx.load(buffer as any);

      expect(loadedWb.worksheets.length).toBe(2);

      // Verify Summary Sheet
      const summarySheet = loadedWb.getWorksheet("Summary")!;
      expect(summarySheet).toBeDefined();
      expect(summarySheet.getCell("A1").value).toBe("TEST BUSINESS PARTNER REGISTER");
      expect(summarySheet.getCell("B3").value).toBe("Confirmed Partners");
      expect(summarySheet.getCell("B4").value).toBe("Admin Tester (admin@axivon.dev)");

      // Verify Data Sheet
      const dataSheet = loadedWb.getWorksheet("Data")!;
      expect(dataSheet).toBeDefined();

      // Header row checks
      const headerRow = dataSheet.getRow(1);
      expect(headerRow.getCell(1).value).toBe("Partner ID");
      expect(headerRow.getCell(2).value).toBe("Partner Name");
      expect(headerRow.getCell(3).value).toBe("Total Earned");
      expect(headerRow.getCell(4).value).toBe("Created Date");

      // Formula injection neutralization in cell
      const formulaInjectionCell = dataSheet.getCell("B3").value;
      expect(formulaInjectionCell).toBe("'=HYPERLINK('http://attacker.com')");

      // Verify Currency number format
      const currencyCell = dataSheet.getCell("C2");
      expect(currencyCell.value).toBe(45000.5);
      expect(currencyCell.numFmt).toContain("₹");

      // Verify frozen top row
      expect(dataSheet.views[0].ySplit).toBe(1);
    });

    it("generates clean CSV output with RFC 4180 escaping and formula neutralization", () => {
      const columns: ColumnDefinition[] = [
        { key: "id", header: "ID" },
        { key: "name", header: "Name" },
        { key: "notes", header: "Notes" },
      ];

      const rows = [
        { id: "1", name: 'Doe, John "Johnny"', notes: "Multi-line\r\nnote" },
        { id: "2", name: "=MALICIOUS()", notes: "Regular Note" },
      ];

      const csv = buildCsvContent(columns, rows);
      expect(csv).toContain('ID,Name,Notes');
      expect(csv).toContain('"Doe, John ""Johnny"""');
      expect(csv).toContain("'=MALICIOUS()");
    });
  });

  describe("3. Applications Data Column Completeness & Transformation", () => {
    it("ensures all 34 form fields from PartnerApplicationForm are included without omissions", () => {
      const expectedKeys = [
        "applicationId", "status", "fullName", "email", "emailVerified", "phone",
        "country", "state", "city", "occupation", "currentWork", "yearsOfExperience",
        "relevantExperience", "clientNetwork", "edu10thSchool", "edu10thBoard",
        "edu10thYear", "edu10thScore", "edu12thSchool", "edu12thBoard", "edu12thYear",
        "edu12thScore", "eduUGDegree", "eduUGBranch", "eduUGCollege", "eduUGYear",
        "motivation", "contribution", "additionalInfo", "decisionReason", "reviewedBy",
        "reviewedAt", "createdAt", "updatedAt"
      ];

      const actualKeys = APPLICATION_COLUMNS.map((c) => c.key);
      for (const key of expectedKeys) {
        expect(actualKeys).toContain(key);
      }
    });

    it("correctly maps raw database application record with nested JSON education to flat export row", () => {
      const mockRawApp = {
        id: "cm_app_123",
        applicationId: "BP-APP-2026-999",
        status: "UNDER_REVIEW",
        fullName: "Aarav Sharma",
        email: "aarav@example.com",
        emailVerifiedAt: new Date("2026-03-01T10:00:00Z"),
        phone: "+91 9876543210",
        country: "India",
        state: "Maharashtra",
        city: "Mumbai",
        occupation: "Software Consultant",
        currentWork: "Self-Employed",
        yearsOfExperience: 6,
        relevantExperience: "Cloud Architecture & Enterprise ERP Solutions",
        clientNetwork: "Extensive network in manufacturing and fintech",
        education10th: {
          school: "St. Xavier's High School",
          board: "CBSE",
          passingYear: "2014",
          percentage: "91.4%",
        },
        education12th: {
          school: "Jai Hind College",
          board: "Maharashtra State Board",
          passingYear: "2016",
          percentage: "88.6%",
        },
        educationUndergrad: {
          degree: "B.Tech",
          branch: "Computer Engineering",
          college: "VJTI Mumbai",
          passingYear: "2020",
        },
        motivation: "Eager to expand Axivon's digital footprint across India.",
        contribution: "Bringing 10+ prospective B2B clients in Q1.",
        additionalInfo: "Available for immediate onboarding discussions.",
        decisionReason: "Strong educational and technical consulting profile.",
        reviewedBy: { name: "Admin Lead", email: "admin@axivon.dev" },
        reviewedAt: new Date("2026-03-05T12:00:00Z"),
        createdAt: new Date("2026-03-01T09:30:00Z"),
        updatedAt: new Date("2026-03-05T12:00:00Z"),
      };

      const transformed = transformApplicationRow(mockRawApp);

      expect(transformed.applicationId).toBe("BP-APP-2026-999");
      expect(transformed.status).toBe("UNDER_REVIEW");
      expect(transformed.emailVerified).toBe("Verified");
      expect(transformed.edu10thSchool).toBe("St. Xavier's High School");
      expect(transformed.edu12thBoard).toBe("Maharashtra State Board");
      expect(transformed.eduUGDegree).toBe("B.Tech");
      expect(transformed.eduUGCollege).toBe("VJTI Mumbai");
      expect(transformed.yearsOfExperience).toBe(6);
      expect(transformed.reviewedBy).toBe("Admin Lead");
    });
  });

  describe("4. Confirmed Partners Transformation & Sensitive Masking", () => {
    const mockUser = {
      id: "usr_partner_1",
      name: "Rajesh Kumar",
      email: "rajesh@partner.com",
      phone: "+91 9123456789",
      address: "Bandra Kurla Complex, Mumbai",
      status: "ACTIVE",
      createdAt: new Date("2026-01-10T10:00:00Z"),
      updatedAt: new Date("2026-01-12T10:00:00Z"),
      brokerProfile: {
        id: "bp_1",
        partnerId: "AXV-BP-500",
        referralCode: "RAJESH2026",
        companyName: "Kumar IT Advisory LLP",
        designation: "Managing Partner",
        website: "https://kumaradvisory.com",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        whatsapp: "+91 9123456789",
        commissions: [
          { status: "PAID", commissionAmount: 50000 },
          { status: "APPROVED", commissionAmount: 25000 },
          { status: "PENDING", commissionAmount: 15000 },
        ],
        partnerProjects: [
          { status: "IN_PROGRESS" },
          { status: "COMPLETED" },
        ],
      },
      ownedLeads: [{}, {}, {}],
    };

    const mockExtSettings = new Map<string, any>([
      [
        "bp_1",
        {
          panNumber: "ABCDE1234F",
          gstNumber: "27ABCDE1234F1Z5",
          payoutMethod: "BANK_TRANSFER",
          payoutDetails: {
            accountHolder: "Rajesh Kumar",
            bankName: "HDFC Bank",
            accountNumber: "50100234567890",
            ifsc: "HDFC0000123",
            upiId: "rajesh@hdfcbank",
          },
          termsAccepted: true,
          termsAcceptedAt: "2026-01-11T14:30:00Z",
          kycVerified: true,
        },
      ],
    ]);

    it("masks bank account, PAN, and UPI by default when sensitiveUnmasked is false", async () => {
      const row = await transformConfirmedPartnerRow(mockUser, mockExtSettings, false);

      expect(row.panNumber).toBe("AB••••••4F");
      expect(row.accountNumber).toBe("••••••••7890");
      expect(row.upiId).toBe("ra•••@hdfcbank");
      expect(row.termsAccepted).toBe("YES");
      expect(row.kycStatus).toBe("VERIFIED");
      expect(row.onboardingState).toBe("COMPLETED");

      // Financial aggregates
      expect(row.totalCommissionEarned).toBe(75000); // 50000 (PAID) + 25000 (APPROVED)
      expect(row.totalCommissionPaid).toBe(50000);
      expect(row.pendingCommission).toBe(40000); // 25000 (APPROVED) + 15000 (PENDING)
      expect(row.activeProjects).toBe(1);
      expect(row.totalProjects).toBe(2);
      expect(row.totalLeads).toBe(3);
    });

    it("reveals full unmasked PAN, bank account, and UPI when sensitiveUnmasked is true", async () => {
      const row = await transformConfirmedPartnerRow(mockUser, mockExtSettings, true);

      expect(row.panNumber).toBe("ABCDE1234F");
      expect(row.accountNumber).toBe("50100234567890");
      expect(row.upiId).toBe("rajesh@hdfcbank");
    });

    it("never includes passwords, activation tokens, or internal secrets in export columns", () => {
      const columns = CONFIRMED_PARTNER_COLUMNS.map((c) => c.key);
      expect(columns).not.toContain("passwordHash");
      expect(columns).not.toContain("password");
      expect(columns).not.toContain("activationToken");
      expect(columns).not.toContain("secret");
      expect(columns).not.toContain("sessionSecret");
    });
  });

  describe("5. Rate Limiting", () => {
    it("enforces sliding-window rate limit after 10 requests within window", () => {
      const testKey = `test_admin_export_${Date.now()}`;
      const options = { windowMs: 60000, maxRequests: 3 };

      expect(isRateLimited(testKey, options).limited).toBe(false);
      expect(isRateLimited(testKey, options).limited).toBe(false);
      expect(isRateLimited(testKey, options).limited).toBe(false);

      // 4th request must be rate limited
      const fourth = isRateLimited(testKey, options);
      expect(fourth.limited).toBe(true);
      expect(fourth.remaining).toBe(0);
      expect(fourth.resetMs).toBeGreaterThan(0);
    });
  });
});
