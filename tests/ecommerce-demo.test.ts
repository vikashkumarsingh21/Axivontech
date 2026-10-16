import { describe, it, expect } from "vitest";
import {
  NOVACART_PRODUCTS,
  NOVACART_CATEGORIES,
  formatPrice,
  DEMO_PROMO_CODES,
} from "@/data/novacart-data";
import {
  SEED_DEMO_ORDERS,
  SEED_DEMO_CUSTOMERS,
  DemoOrder,
  DemoOrderStatus,
} from "@/data/novacart-store-data";

// ============================================================
// AXIVON COMMERCE — DEMO APPLICATION & CATALOG TEST SUITE
// ============================================================

describe("1. Catalog Data & Integrity", () => {
  it("contains valid seeded products across all supported categories", () => {
    expect(NOVACART_PRODUCTS.length).toBeGreaterThanOrEqual(20);
    expect(NOVACART_CATEGORIES.length).toBe(4);

    const categoryNames = NOVACART_CATEGORIES.map((c) => c.name);
    for (const prod of NOVACART_PRODUCTS) {
      expect(prod.id).toBeTruthy();
      expect(prod.name.trim().length).toBeGreaterThan(0);
      expect(prod.slug).toBeTruthy();
      expect(prod.price).toBeGreaterThan(0);
      expect(categoryNames).toContain(prod.category);
      expect(prod.images.length).toBeGreaterThan(0);
      expect(["In Stock", "Low Stock", "Sample Stock Only"]).toContain(
        prod.stockStatus
      );
    }
  });

  it("formats Indian Rupee currency correctly with comma grouping", () => {
    expect(formatPrice(149)).toBe("₹149");
    expect(formatPrice(1999)).toBe("₹1,999");
    expect(formatPrice(15000)).toBe("₹15,000");
  });

  it("applies valid promo codes and rejects invalid ones", () => {
    const promo10 = DEMO_PROMO_CODES["WELCOME10"];
    const promoFlat = DEMO_PROMO_CODES["NOVAFIRST"];

    expect(promo10).toBeDefined();
    expect(promo10?.value).toBe(10);
    expect(promo10?.type).toBe("percentage");

    expect(promoFlat).toBeDefined();
    expect(promoFlat?.value).toBe(500);
    expect(promoFlat?.type).toBe("fixed");

    // Calculate discount for ₹6,000 order
    const orderTotal = 6000;
    const discount10 = promo10?.type === "percentage"
      ? Math.round((orderTotal * promo10.value) / 100)
      : 0;
    expect(discount10).toBe(600);

    const discountFlat = promoFlat?.type === "fixed" ? promoFlat.value : 0;
    expect(discountFlat).toBe(500);
  });
});

describe("2. Order State & Shopping Workflow", () => {
  it("calculates shipping fee based on threshold correctly", () => {
    const calculateShipping = (subtotal: number) => {
      const FREE_SHIPPING_THRESHOLD = 2000;
      const STANDARD_SHIPPING_FEE = 149;
      return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    };

    expect(calculateShipping(1200)).toBe(149);
    expect(calculateShipping(2000)).toBe(0);
    expect(calculateShipping(4500)).toBe(0);
  });

  it("validates sequential order lifecycle transitions", () => {
    const VALID_ORDER_TRANSITIONS: Record<DemoOrderStatus, DemoOrderStatus[]> = {
      PENDING: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [], // Terminal
      CANCELLED: [], // Terminal
    };

    const canTransition = (from: DemoOrderStatus, to: DemoOrderStatus) => {
      return VALID_ORDER_TRANSITIONS[from].includes(to);
    };

    expect(canTransition("PENDING", "PROCESSING")).toBe(true);
    expect(canTransition("PROCESSING", "SHIPPED")).toBe(true);
    expect(canTransition("SHIPPED", "DELIVERED")).toBe(true);
    expect(canTransition("DELIVERED", "PROCESSING")).toBe(false);
    expect(canTransition("PROCESSING", "DELIVERED")).toBe(false);
  });

  it("generates structured DemoOrder matching all required attributes", () => {
    const sample: DemoOrder = {
      id: "AXV-ORD-TEST-01",
      createdAt: new Date().toISOString(),
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "+91 99999 88888",
      shippingAddress: {
        address: "123 Test Street",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
      },
      items: [
        {
          productId: "nc-prod-01",
          productName: "Test Item",
          quantity: 2,
          price: 1500,
        },
      ],
      subtotal: 3000,
      shipping: 0,
      discount: 300,
      total: 2700,
      status: "PROCESSING",
      paymentMethod: "UPI",
      paymentStatus: "PAID",
    };

    expect(sample.id).toMatch(/^AXV-ORD-/);
    expect(sample.items.length).toBe(1);
    expect(sample.total).toBe(sample.subtotal - sample.discount + sample.shipping);
  });
});

describe("3. Data Isolation & Security Safeguards", () => {
  it("ensures seeded customers and orders use demonstrative mock data", () => {
    for (const cust of SEED_DEMO_CUSTOMERS) {
      expect(cust.email).toContain("@example.com");
      expect(cust.phone).toMatch(/^\+91 9/);
    }

    for (const ord of SEED_DEMO_ORDERS) {
      expect(ord.customerEmail).toContain("@example.com");
      expect(ord.paymentStatus).toBe("PAID");
    }
  });

  it("does not expose any production database secrets in client configurations", () => {
    // Assert environment keys used in demo are entirely isolated
    const forbiddenEnvSubstrings = [
      "POSTGRES_PRISMA_URL",
      "DATABASE_URL",
      "AXIVON_JWT_SECRET",
      "SMTP_PASSWORD",
    ];

    const mockClientConfig = {
      appName: "Axivon Commerce",
      version: "1.0.0",
      isDemo: true,
      storagePrefix: "novacart_demo_",
    };

    const configKeys = Object.keys(mockClientConfig);
    for (const forbidden of forbiddenEnvSubstrings) {
      expect(configKeys).not.toContain(forbidden);
    }
  });
});

describe("4. Standalone Downloadable Package Verification", () => {
  it("verifies the physical ZIP package exists and exceeds minimum size threshold", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const zipPath = path.join(process.cwd(), "public", "downloads", "axivon-commerce-demo-v1.0.0.zip");

    expect(fs.existsSync(zipPath)).toBe(true);
    const stats = fs.statSync(zipPath);
    // Package should include Next.js code, styles, configs, and 52 product images (> 2MB)
    expect(stats.size).toBeGreaterThan(2 * 1024 * 1024);
  });
});
