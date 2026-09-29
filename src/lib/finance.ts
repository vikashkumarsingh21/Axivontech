export function calculateAdvance(projectValue: number): number {
  if (projectValue <= 0) throw new Error("Invalid project value");
  // Exact 40% calculation, rounding to 2 decimal places to avoid floating point anomalies
  return Math.round(projectValue * 0.4 * 100) / 100;
}
