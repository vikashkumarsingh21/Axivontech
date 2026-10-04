import { describe, it, expect } from "vitest";
import { calculateAdvance } from "@/lib/finance";

describe("calculateAdvance", () => {
  it("calculates 40% correctly for 10000", () => {
    expect(calculateAdvance(10000)).toBe(4000);
  });

  it("calculates 40% correctly for 20000", () => {
    expect(calculateAdvance(20000)).toBe(8000);
  });

  it("calculates 40% correctly for 50000", () => {
    expect(calculateAdvance(50000)).toBe(20000);
  });

  it("calculates 40% correctly for 100000", () => {
    expect(calculateAdvance(100000)).toBe(40000);
  });

  it("handles decimals correctly", () => {
    expect(calculateAdvance(10000.50)).toBe(4000.20);
    expect(calculateAdvance(33333.33)).toBe(13333.33); // 33333.33 * 0.4 = 13333.332 -> 13333.33
  });

  it("throws on negative amount", () => {
    expect(() => calculateAdvance(-5000)).toThrow("Invalid project value");
  });

  it("throws on zero", () => {
    expect(() => calculateAdvance(0)).toThrow("Invalid project value");
  });
});
