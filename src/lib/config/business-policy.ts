/**
 * AXIVON ONE - Core Business Policies
 * 
 * Phase 12 Requirement:
 * The commission eligibility trigger and commission rate MUST be explicit and configurable.
 */

export const CommissionPolicy = {
  /**
   * Commission Eligibility Trigger
   * 
   * Current Confirmed Policy:
   * Commission becomes ELIGIBLE when the client's advance payment is VERIFIED.
   * (Implemented in: src/app/api/v1/admin/partner-payments/[id]/route.ts)
   * 
   * Status: LOCKED
   */
  ELIGIBILITY_TRIGGER: "PAYMENT_VERIFIED",

  /**
   * Default Commission Rule Type
   * 
   * Note: The system supports both PERCENTAGE and FIXED.
   * The actual value (e.g. 15%) is dynamically pulled from the active CommissionRule
   * in the database. It is NEVER hard-coded in the calculation logic.
   */
  DEFAULT_RULE_TYPE: "PERCENTAGE",

  /**
   * Financial Rounding Strategy
   * 
   * Currently, amounts are stored as Float (currency format handled in UI).
   * Calculations evaluate as standard float math against the projectValue.
   */
  ROUNDING_STRATEGY: "FLOAT_STANDARD"
};
