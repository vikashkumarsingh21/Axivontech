import { describe, it, expect } from "vitest";
import {
  ESTATEVISTA_PROPERTIES,
  NEIGHBORHOOD_GUIDES,
  REAL_ESTATE_FAQS,
  ESTATEVISTA_TESTIMONIALS,
} from "@/data/estatevista-properties";
import { DEMO_PROJECTS } from "@/data/demo-projects";

describe("EstateVista Real Estate Data Integrity", () => {
  it("should contain exactly 8 curated properties with unique IDs and slugs", () => {
    expect(ESTATEVISTA_PROPERTIES.length).toBe(8);

    const ids = ESTATEVISTA_PROPERTIES.map((p) => p.id);
    const slugs = ESTATEVISTA_PROPERTIES.map((p) => p.slug);

    expect(new Set(ids).size).toBe(8);
    expect(new Set(slugs).size).toBe(8);
  });

  it("should have comprehensive architectural specifications for every property", () => {
    for (const prop of ESTATEVISTA_PROPERTIES) {
      expect(prop.title).toBeTruthy();
      expect(prop.price).toBeGreaterThan(1000000);
      expect(prop.formattedPrice).toContain("$");
      expect(prop.location).toBeTruthy();
      expect(prop.neighborhood).toBeTruthy();
      expect(prop.areaSqFt).toBeGreaterThan(1000);
      expect(prop.pricePerSqFt).toBeGreaterThan(0);
      expect(prop.yearBuilt).toBeGreaterThanOrEqual(2020);
      expect(prop.keyAmenities.length).toBeGreaterThanOrEqual(4);
      expect(prop.features.length).toBeGreaterThanOrEqual(3);
      expect(prop.images.length).toBeGreaterThanOrEqual(1);
      expect(prop.floorPlans.length).toBeGreaterThanOrEqual(1);

      // Verify each floor plan has structured zones with dimensions
      for (const plan of prop.floorPlans) {
        expect(plan.levelName).toBeTruthy();
        expect(plan.totalAreaSqFt).toBeGreaterThan(0);
        expect(plan.zones.length).toBeGreaterThanOrEqual(1);
        for (const zone of plan.zones) {
          expect(zone.name).toBeTruthy();
          expect(zone.dimensions).toBeTruthy();
          expect(zone.areaSqFt).toBeGreaterThan(0);
        }
      }
    }
  });

  it("should correctly represent all 4 required property categories", () => {
    const categories = new Set(ESTATEVISTA_PROPERTIES.map((p) => p.propertyType));
    expect(categories).toContain("Luxury Villa");
    expect(categories).toContain("Penthouse");
    expect(categories).toContain("Modern Residence");
    expect(categories).toContain("Commercial Estate");
  });

  it("should contain complete neighborhood dossiers with walkability scores", () => {
    expect(NEIGHBORHOOD_GUIDES.length).toBe(4);
    for (const guide of NEIGHBORHOOD_GUIDES) {
      expect(guide.name).toBeTruthy();
      expect(guide.city).toBeTruthy();
      expect(guide.vibe).toBeTruthy();
      expect(guide.walkScore).toBeGreaterThan(50);
      expect(guide.transitScore).toBeGreaterThan(50);
      expect(guide.greeneryScore).toBeGreaterThan(50);
      expect(guide.highlights.length).toBeGreaterThanOrEqual(3);
      expect(guide.keyAttractions.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("should contain comprehensive advisory FAQs and sample client vignettes", () => {
    expect(REAL_ESTATE_FAQS.length).toBeGreaterThanOrEqual(5);
    for (const faq of REAL_ESTATE_FAQS) {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    }

    expect(ESTATEVISTA_TESTIMONIALS.length).toBe(3);
    for (const t of ESTATEVISTA_TESTIMONIALS) {
      expect(t.clientLabel).toContain("Sample Client Profile");
      expect(t.statement).toBeTruthy();
      expect(t.acquiredProperty).toBeTruthy();
    }
  });
});

describe("EstateVista Demo Registration in Axivon Showcase", () => {
  it("should be registered as Live Demo with correct URL in DEMO_PROJECTS catalogue", () => {
    const estatevista = DEMO_PROJECTS.find((p) => p.id === "estatevista");
    expect(estatevista).toBeDefined();
    expect(estatevista?.status).toBe("Live Demo");
    expect(estatevista?.enquiryType).toBe("View Demo");
    expect(estatevista?.demoUrl).toBe("/demo-projects/real-estate/estatevista");
    expect(estatevista?.priority).toBe("P1");
    expect(estatevista?.isFeatured).toBe(true);
  });
});

describe("EstateVista Mortgage Calculation Accuracy", () => {
  it("should accurately compute monthly debt service and carrying cost breakdown", () => {
    const price = 4500000;
    const downPercent = 20;
    const downAmount = price * (downPercent / 100);
    const principal = price - downAmount;
    expect(principal).toBe(3600000);

    const annualRate = 6.5 / 100;
    const monthlyRate = annualRate / 12;
    const nPayments = 30 * 12;

    const monthlyPI =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, nPayments))) /
      (Math.pow(1 + monthlyRate, nPayments) - 1);

    // Standard 30-year payment on $3.6M at 6.5% is ~$22,754/mo
    expect(monthlyPI).toBeGreaterThan(22000);
    expect(monthlyPI).toBeLessThan(23500);

    const monthlyTax = (price * 0.012) / 12; // 1.2% property tax = $4,500/mo
    expect(monthlyTax).toBe(4500);

    const monthlyInsurance = (price * 0.0035) / 12; // 0.35% = $1,312.5/mo
    expect(monthlyInsurance).toBe(1312.5);
  });
});
