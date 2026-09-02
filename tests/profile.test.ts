import { describe, it, expect } from "vitest";
import { updateProfileSchema, getEmployeeProfile } from "../src/lib/services/profile.service";

describe("Profile Management Security & Validation Tests", () => {
  it("should validate allowed profile fields successfully", () => {
    const validInput = {
      name: "John Doe",
      phone: "+91 9876543210",
      avatarUrl: "https://example.com/avatar.jpg",
      address: "Bangalore, India",
      emergencyContact: "Jane Doe - +91 9123456780",
    };

    const parsed = updateProfileSchema.parse(validInput);
    expect(parsed.name).toBe("John Doe");
    expect(parsed.phone).toBe("+91 9876543210");
    expect(parsed.avatarUrl).toBe("https://example.com/avatar.jpg");
    expect(parsed.address).toBe("Bangalore, India");
    expect(parsed.emergencyContact).toBe("Jane Doe - +91 9123456780");
  });

  it("should reject unauthorized attempt to modify role (Security Privilege Escalation test)", () => {
    const maliciousInput = {
      name: "John Doe",
      role: "ADMIN",
    };

    expect(() => updateProfileSchema.parse(maliciousInput)).toThrow();
  });

  it("should reject unauthorized attempt to modify permissions", () => {
    const maliciousInput = {
      name: "John Doe",
      permissions: ["users:delete", "admin:all"],
    };

    expect(() => updateProfileSchema.parse(maliciousInput)).toThrow();
  });

  it("should reject unauthorized attempt to modify employeeId or status", () => {
    const maliciousInput = {
      employeeId: "EMP-9999",
      status: "FOUNDER",
    };

    expect(() => updateProfileSchema.parse(maliciousInput)).toThrow();
  });

  it("should reject unauthorized attempt to modify joining date or salary", () => {
    const maliciousInput = {
      joiningDate: new Date().toISOString(),
      salary: 250000,
    };

    expect(() => updateProfileSchema.parse(maliciousInput)).toThrow();
  });

  it("should reject unauthenticated request when userId is empty/missing", async () => {
    await expect(getEmployeeProfile("")).rejects.toThrow("Unauthorized");
  });

  it("should reject invalid phone format", () => {
    const invalidInput = {
      phone: "invalid-phone-abc!@#",
    };

    expect(() => updateProfileSchema.parse(invalidInput)).toThrow();
  });

  it("should reject invalid avatar URL", () => {
    const invalidInput = {
      avatarUrl: "not-a-url",
    };

    expect(() => updateProfileSchema.parse(invalidInput)).toThrow();
  });

  it("should reject empty or whitespace-only name", () => {
    const invalidInput = {
      name: "   ",
    };

    expect(() => updateProfileSchema.parse(invalidInput)).toThrow();
  });
});
