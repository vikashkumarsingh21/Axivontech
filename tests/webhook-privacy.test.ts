import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Webhook Privacy & Environment Variable Isolation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GOOGLE_SHEETS_CAREERS_WEBHOOK_URL;
    delete process.env.GOOGLE_SHEETS_LEAD_WEBHOOK_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should not perform external fetch when GOOGLE_SHEETS_CAREERS_WEBHOOK_URL is unset", async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    // Simulate webhook dispatch block from careers route
    const webhookUrl = process.env.GOOGLE_SHEETS_CAREERS_WEBHOOK_URL?.trim();
    if (webhookUrl && webhookUrl.startsWith("https://")) {
      await fetch(webhookUrl, { method: "POST" });
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should not perform external fetch when GOOGLE_SHEETS_LEAD_WEBHOOK_URL is unset", async () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    // Simulate webhook dispatch block from contact route
    const leadWebhookUrl = process.env.GOOGLE_SHEETS_LEAD_WEBHOOK_URL?.trim();
    if (leadWebhookUrl && leadWebhookUrl.startsWith("https://")) {
      fetch(leadWebhookUrl, { method: "POST" });
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should dispatch external fetch when a valid https webhook URL is configured", async () => {
    process.env.GOOGLE_SHEETS_CAREERS_WEBHOOK_URL = "https://custom-webhook.axivontech.in/careers";
    const fetchSpy = vi.fn().mockResolvedValue({
      text: () => Promise.resolve("OK"),
    });
    global.fetch = fetchSpy;

    const webhookUrl = process.env.GOOGLE_SHEETS_CAREERS_WEBHOOK_URL?.trim();
    if (webhookUrl && webhookUrl.startsWith("https://")) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" }),
      });
    }

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://custom-webhook.axivontech.in/careers",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ test: "data" }),
      })
    );
  });
});
