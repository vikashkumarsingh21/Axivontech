import { describe, it, expect, vi, beforeEach } from "vitest";
import { toastManager, toast } from "@/lib/notifications/toast";

describe("Global Toast System (Step 4)", () => {
  beforeEach(() => {
    toastManager.clear();
  });

  it("adds toasts and notifies subscribers", () => {
    let capturedToasts: any[] = [];
    const unsubscribe = toastManager.subscribe((items) => {
      capturedToasts = items;
    });

    toast.success("Account created successfully");
    expect(capturedToasts.length).toBe(1);
    expect(capturedToasts[0].type).toBe("success");
    expect(capturedToasts[0].message).toBe("Account created successfully");
    expect(capturedToasts[0].duration).toBe(5000);

    toast.error(new Error("Database disconnected"));
    expect(capturedToasts.length).toBe(2);
    expect(capturedToasts[1].type).toBe("error");
    expect(capturedToasts[1].message).toBe("Database disconnected");
    expect(capturedToasts[1].duration).toBe(7000);

    unsubscribe();
  });

  it("guarantees error toast NEVER receives '[object Object]'", () => {
    let capturedToasts: any[] = [];
    toastManager.subscribe((items) => {
      capturedToasts = items;
    });

    toast.error({ error: { message: "Invalid payload" } });
    expect(capturedToasts[0].message).toBe("Invalid payload");

    toast.error({ code: "AUTH_INVALID_CREDENTIALS" });
    expect(capturedToasts[1].message).toBe("Incorrect email or password.");

    toast.error({});
    expect(capturedToasts[2].message).toBe("Something went wrong. Please try again.");
    expect(capturedToasts[2].message).not.toContain("[object");
  });

  it("enforces maximum 3 visible toasts with stacking", () => {
    toast.info("Message 1");
    toast.info("Message 2");
    toast.info("Message 3");
    expect(toastManager.getToasts().length).toBe(3);

    toast.info("Message 4");
    const current = toastManager.getToasts();
    expect(current.length).toBe(3);
    // Oldest ("Message 1") dropped
    expect(current.map((t) => t.message)).toEqual(["Message 2", "Message 3", "Message 4"]);
  });

  it("supports manual dismissal by ID", () => {
    const id1 = toast.success("First");
    toast.success("Second");
    expect(toastManager.getToasts().length).toBe(2);

    toast.dismiss(id1);
    const remaining = toastManager.getToasts();
    expect(remaining.length).toBe(1);
    expect(remaining[0].message).toBe("Second");
  });
});
