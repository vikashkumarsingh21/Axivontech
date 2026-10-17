import { describe, it, expect } from "vitest";
import { DEMO_PROJECTS } from "@/data/demo-projects";
import {
  FITZONE_PROGRAMS,
  FITZONE_TRAINERS,
  FITZONE_SCHEDULE,
  FITZONE_MEMBERSHIPS,
  FITZONE_FACILITIES,
  FITZONE_TESTIMONIALS,
  FITZONE_FAQS,
} from "@/data/fitzone-data";

describe("FitZone Demo Project Integration", () => {
  it("should be registered as a Live Demo in DEMO_PROJECTS", () => {
    const fitzone = DEMO_PROJECTS.find((p) => p.id === "fitzone");
    expect(fitzone).toBeDefined();
    expect(fitzone?.name).toBe("FitZone");
    expect(fitzone?.status).toBe("Live Demo");
    expect(fitzone?.demoUrl).toBe("/demo-projects/fitness/fitzone");
    expect(fitzone?.category).toBe("Fitness & Wellness");
    expect(fitzone?.accentColor).toBe("#FF7138");
    expect(fitzone?.isFeatured).toBe(true);
    expect(fitzone?.features.length).toBeGreaterThanOrEqual(4);
  });

  describe("Training Programs Data", () => {
    it("should have at least 5 structured training programs", () => {
      expect(FITZONE_PROGRAMS.length).toBeGreaterThanOrEqual(5);
    });

    it("every program should have complete metadata and phase curriculum", () => {
      FITZONE_PROGRAMS.forEach((program) => {
        expect(program.id).toBeTruthy();
        expect(program.name).toBeTruthy();
        expect(program.durationMinutes).toBeGreaterThan(0);
        expect(program.targetFocus.length).toBeGreaterThanOrEqual(3);
        expect(program.equipment.length).toBeGreaterThanOrEqual(2);
        expect(program.sampleCurriculum.length).toBeGreaterThanOrEqual(3);
        expect(program.trainerName).toBeTruthy();
      });
    });
  });

  describe("Coaching Roster Data", () => {
    it("should feature qualified master coaches with certifications and achievements", () => {
      expect(FITZONE_TRAINERS.length).toBeGreaterThanOrEqual(5);
      FITZONE_TRAINERS.forEach((trainer) => {
        expect(trainer.name).toBeTruthy();
        expect(trainer.experienceYears).toBeGreaterThanOrEqual(5);
        expect(trainer.certifications.length).toBeGreaterThanOrEqual(2);
        expect(trainer.achievements.length).toBeGreaterThanOrEqual(1);
        expect(trainer.coachingPhilosophy).toBeTruthy();
      });
    });
  });

  describe("Class Schedule Telemetry", () => {
    it("should cover all 7 days of the week", () => {
      const daysRepresented = new Set(FITZONE_SCHEDULE.map((s) => s.dayOfWeek));
      expect(daysRepresented.size).toBe(7);
      expect(daysRepresented.has("Monday")).toBe(true);
      expect(daysRepresented.has("Sunday")).toBe(true);
    });

    it("should have valid capacity telemetry and time categories", () => {
      FITZONE_SCHEDULE.forEach((session) => {
        expect(session.spotsTotal).toBeGreaterThanOrEqual(session.spotsRemaining);
        expect(session.spotsRemaining).toBeGreaterThanOrEqual(0);
        expect(["morning", "afternoon", "evening"]).toContain(session.timeCategory);
        expect(session.timeSlot).toMatch(/\d{2}:\d{2}\s(AM|PM)/);
      });
    });
  });

  describe("Memberships and Pricing", () => {
    it("should include 3 transparent tiers with 20% annual savings", () => {
      expect(FITZONE_MEMBERSHIPS.length).toBe(3);
      FITZONE_MEMBERSHIPS.forEach((plan) => {
        expect(plan.monthlyPrice).toBeGreaterThan(plan.annualPriceMonthly);
        expect(plan.features.length).toBeGreaterThanOrEqual(5);
        // Annual monthly savings should be approximately 20%
        const savingsRatio = (plan.monthlyPrice - plan.annualPriceMonthly) / plan.monthlyPrice;
        expect(savingsRatio).toBeGreaterThanOrEqual(0.18);
        expect(savingsRatio).toBeLessThanOrEqual(0.22);
      });
    });

    it("should highlight the Performance tier as popular", () => {
      const popular = FITZONE_MEMBERSHIPS.find((p) => p.isPopular);
      expect(popular).toBeDefined();
      expect(popular?.id).toBe("performance");
    });
  });

  describe("Facility Pavilions & FAQ", () => {
    it("should detail multiple pavilions totaling over 20,000 sq ft", () => {
      const totalSqFt = FITZONE_FACILITIES.reduce((acc, f) => acc + f.sqFt, 0);
      expect(totalSqFt).toBeGreaterThanOrEqual(20000);
      FITZONE_FACILITIES.forEach((fac) => {
        expect(fac.equipmentList.length).toBeGreaterThanOrEqual(3);
        expect(fac.highlights.length).toBeGreaterThanOrEqual(3);
      });
    });

    it("should provide comprehensive FAQs", () => {
      expect(FITZONE_FAQS.length).toBeGreaterThanOrEqual(4);
      FITZONE_FAQS.forEach((faq) => {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
      });
    });
  });
});
