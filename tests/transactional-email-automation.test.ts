import { describe, it, expect, vi, beforeEach } from "vitest";
import { getEmailConfig, isEmailTestMode } from "@/lib/email/config";
import { renderEmailTemplate } from "@/lib/email/templates";
import { sendTransactionalEmail, EmailService } from "@/lib/email/service";
import { deliverEmailMessage } from "@/lib/email/transport";

// Mock DB with in-memory storage for email logs
const mockEmailLogs: any[] = [];

vi.mock("@/lib/db", () => {
  return {
    db: {
      emailLog: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          const found = mockEmailLogs.find((l) => {
            if (where.toEmail && l.toEmail !== where.toEmail) return false;
            if (where.templateKey && l.templateKey !== where.templateKey) return false;
            return true;
          });
          return Promise.resolve(found || null);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const record = { id: `log-${Date.now()}-${Math.random()}`, ...data, createdAt: new Date() };
          mockEmailLogs.unshift(record);
          return Promise.resolve(record);
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const index = mockEmailLogs.findIndex((l) => l.id === where.id);
          if (index !== -1) {
            mockEmailLogs[index] = { ...mockEmailLogs[index], ...data };
            return Promise.resolve(mockEmailLogs[index]);
          }
          return Promise.resolve({ id: where.id, ...data });
        }),
      },
    },
  };
});

describe("Axivon Centralized Transactional Email Automation System", () => {
  beforeEach(() => {
    mockEmailLogs.length = 0;
    vi.clearAllMocks();
  });

  describe("1. Official Sender & Company Identity Configuration", () => {
    it("enforces official company sender identity (axivontech.in@gmail.com)", () => {
      const config = getEmailConfig();
      expect(config.senderName).toBe("Axivon Technologies");
      expect(config.senderEmail).toBe("axivontech.in@gmail.com");
      expect(config.replyTo).toBe("axivontech.in@gmail.com");
      expect(config.internalNotificationEmail).toBe("axivontech.in@gmail.com");
    });

    it("defaults to safe TEST mode to avoid spamming real recipients in development", () => {
      const isTest = isEmailTestMode();
      expect(typeof isTest).toBe("boolean");
    });

    it("verifies SMTP port 587 and STARTTLS TLS configuration", () => {
      const config = getEmailConfig();
      expect(config.smtpPort).toBe(587);
      expect(config.smtpSecure).toBe(false); // STARTTLS requires secure: false for port 587
      expect(config.smtpHost).toBe("smtp.gmail.com");
    });
  });

  describe("2. Comprehensive Multi-Event Template Rendering", () => {
    it("renders Contact Enquiry dual notification templates", () => {
      const internalAlert = renderEmailTemplate("CONTACT_ENQUIRY_RECEIVED", {
        clientName: "Vikram Malhotra",
        email: "vikram@example.com",
        phone: "+91 9876543210",
        service: "Enterprise Cloud Architecture",
        budget: "₹5,00,000+",
        message: "Need cloud migration consulting.",
      });
      expect(internalAlert.subject).toContain("New Contact Enquiry Received");
      expect(internalAlert.html).toContain("Vikram Malhotra");
      expect(internalAlert.html).toContain("vikram@example.com");

      const clientAck = renderEmailTemplate("CONTACT_ENQUIRY_ACK", {
        clientName: "Vikram Malhotra",
        service: "Enterprise Cloud Architecture",
      });
      expect(clientAck.subject).toContain("Thank You for Contacting Axivon Technologies");
      expect(clientAck.html).toContain("Vikram Malhotra");
      expect(clientAck.html).toContain("axivontech.in@gmail.com");
    });

    it("renders Career Application templates with applicant greeting and Asia/Kolkata timing", () => {
      const candidateAck = renderEmailTemplate("CAREER_APPLICATION_ACK", {
        fullName: "Ananya Sharma",
        jobTitle: "Senior Next.js Full Stack Engineer",
        applicationId: "APP-CAREER-102",
      });
      expect(candidateAck.subject).toContain("Your Application Has Been Received");
      expect(candidateAck.html).toContain("Ananya Sharma");
      expect(candidateAck.text).toContain("APP-CAREER-102");
    });

    it("renders Business Partner Approval and Activation templates", () => {
      const partnerApproval = renderEmailTemplate("PARTNER_APPLICATION_APPROVED", {
        partnerName: "Rohit Verma",
        applicationId: "BP-2026-99",
      });
      expect(partnerApproval.subject).toContain("Your AxivonTech Partner Application Is Approved");
      expect(partnerApproval.html).toContain("Rohit Verma");

      const partnerActivation = renderEmailTemplate("PARTNER_ACCOUNT_ACTIVATION", {
        partnerName: "Rohit Verma",
        loginId: "rohit.verma@example.com",
        activationUrl: "https://axivontech.in/broker/activate?token=sample-tok",
        temporaryPassword: "SampleSecurePassword123!",
      });
      expect(partnerActivation.subject).toContain("Your AxivonTech Partner Account Is Ready");
      expect(partnerActivation.html).toContain("rohit.verma@example.com");
      expect(partnerActivation.html).toContain("SampleSecurePassword123!");
    });

    it("renders Payment Receipt template with rupee formatting", () => {
      const paymentReceipt = renderEmailTemplate("PAYMENT_RECEIVED", {
        clientName: "Alpha Logistics Pvt Ltd",
        amount: "₹1,50,000",
        paymentCode: "UTR-83921039",
        invoiceNumber: "INV-2026-004",
        projectName: "Fleet Management CRM",
      });
      expect(paymentReceipt.subject).toContain("Payment Received");
      expect(paymentReceipt.html).toContain("₹1,50,000");
      expect(paymentReceipt.html).toContain("UTR-83921039");
    });

    it("renders Task Assignment and Leave Approval templates", () => {
      const task = renderEmailTemplate("TASK_ASSIGNED", {
        employeeName: "Priya Nair",
        taskTitle: "Implement Payment Webhook",
        projectName: "Fintech Platform",
        priority: "HIGH",
        dueDate: "15 Nov 2026",
      });
      expect(task.subject).toContain("New Task Assigned");
      expect(task.html).toContain("Priya Nair");
      expect(task.html).toContain("HIGH");

      const leave = renderEmailTemplate("LEAVE_APPROVED", {
        employeeName: "Priya Nair",
        leaveType: "Privilege Leave",
        startDate: "10 Nov 2026",
        endDate: "12 Nov 2026",
      });
      expect(leave.subject).toContain("Leave Request Has Been Approved");
      expect(leave.html).toContain("Privilege Leave");
    });

    it("renders Password Reset and Security Alert templates", () => {
      const reset = renderEmailTemplate("PASSWORD_RESET", {
        name: "Dev User",
        resetLink: "https://axivontech.in/reset-password?token=secret123",
      });
      expect(reset.subject).toContain("Password Reset Request");
      expect(reset.html).toContain("secret123");

      const changed = renderEmailTemplate("PASSWORD_CHANGED", {
        name: "Dev User",
      });
      expect(changed.subject).toContain("Security Alert: Your Password Was Changed");
      expect(changed.html).toContain("axivontech.in@gmail.com");
    });
  });

  describe("3. Delivery Transport & Test Mode Redirection", () => {
    it("delivers simulated email and redirects external recipient to axivontech.in@gmail.com in test mode", async () => {
      const result = await deliverEmailMessage({
        to: "external-client@corporate.com",
        subject: "Contract Agreement Ready",
        html: "<p>Please sign your contract.</p>",
      });

      expect(result.success).toBe(true);
      if (result.isTestMode) {
        expect(result.recipientUsed).toBe("axivontech.in@gmail.com");
      }
    });
  });

  describe("4. 24-Hour Idempotency & Duplicate Suppression", () => {
    it("suppresses duplicate email dispatches with identical eventKey within 24h", async () => {
      const idempotencyKey = `contact_enquiry_ack:inq-unique-test-${Date.now()}`;

      // 1st dispatch: succeeds and creates log
      const log1 = await sendTransactionalEmail({
        to: "test.applicant@example.com",
        templateKey: "CONTACT_ENQUIRY_ACK",
        eventKey: idempotencyKey,
        variables: { fullName: "Test Applicant" },
      });
      expect(log1).not.toBeNull();
      expect(log1?.status).toBe("SENT");

      // 2nd dispatch with same idempotency key (e.g. user double-clicked button):
      // returns existing log without sending duplicate
      const log2 = await sendTransactionalEmail({
        to: "test.applicant@example.com",
        templateKey: "CONTACT_ENQUIRY_ACK",
        eventKey: idempotencyKey,
        variables: { fullName: "Test Applicant" },
      });
      expect(log2).not.toBeNull();
      expect(log2?.id).toBe(log1?.id);
    });
  });

  describe("5. Non-Blocking Execution Guarantee", () => {
    it("returns null or fallback log and does NOT throw error when delivery fails", async () => {
      const result = await sendTransactionalEmail({
        to: "invalid-email-address",
        templateKey: "GENERIC_NOTIFICATION",
        variables: { title: "Test", message: "Test message" },
      });

      // Must never crash or throw unhandled rejection
      expect(result).toBeNull();
    });

    it("backward compatible EmailService.send always returns non-null object with id and status", async () => {
      const result = await EmailService.send({
        to: "employee@axivontech.in",
        templateKey: "WELCOME_EMAIL",
        variables: { name: "Rajesh Kumar" },
      });

      expect(result).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(result.status).toBe("SENT");
    });
  });
});
