import { ConditionGroup, ConditionRule, ConditionOperator } from "./types";

const FORBIDDEN_FIELDS = new Set([
  "__proto__",
  "prototype",
  "constructor",
  "password",
  "passwordHash",
  "token",
  "secret",
  "apiKey",
]);

/**
 * Safely resolves nested property paths (e.g. "lead.status" or "priority")
 */
export function resolveFieldValue(data: Record<string, any>, path: string): any {
  if (!data || typeof data !== "object" || !path) return undefined;

  const parts = path.split(".");
  let current: any = data;

  for (const part of parts) {
    if (FORBIDDEN_FIELDS.has(part.toLowerCase())) {
      return undefined;
    }
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Evaluates a single rule deterministically against contextual data
 */
export function evaluateRule(rule: ConditionRule, data: Record<string, any>): boolean {
  const actualValue = resolveFieldValue(data, rule.field);
  const targetValue = rule.value;

  switch (rule.operator) {
    case "EQUALS":
      if (actualValue instanceof Date && (targetValue instanceof Date || typeof targetValue === "string")) {
        return new Date(actualValue).getTime() === new Date(targetValue).getTime();
      }
      return actualValue === targetValue || String(actualValue).toLowerCase() === String(targetValue).toLowerCase();

    case "NOT_EQUALS":
      return actualValue !== targetValue && String(actualValue).toLowerCase() !== String(targetValue).toLowerCase();

    case "GREATER_THAN": {
      const a = Number(actualValue);
      const b = Number(targetValue);
      return !isNaN(a) && !isNaN(b) && a > b;
    }

    case "GREATER_THAN_OR_EQUAL": {
      const a = Number(actualValue);
      const b = Number(targetValue);
      return !isNaN(a) && !isNaN(b) && a >= b;
    }

    case "LESS_THAN": {
      const a = Number(actualValue);
      const b = Number(targetValue);
      return !isNaN(a) && !isNaN(b) && a < b;
    }

    case "LESS_THAN_OR_EQUAL": {
      const a = Number(actualValue);
      const b = Number(targetValue);
      return !isNaN(a) && !isNaN(b) && a <= b;
    }

    case "CONTAINS":
      if (actualValue === null || actualValue === undefined) return false;
      if (Array.isArray(actualValue)) {
        return actualValue.some((item) => String(item).toLowerCase() === String(targetValue).toLowerCase());
      }
      return String(actualValue).toLowerCase().includes(String(targetValue).toLowerCase());

    case "NOT_CONTAINS":
      if (actualValue === null || actualValue === undefined) return true;
      if (Array.isArray(actualValue)) {
        return !actualValue.some((item) => String(item).toLowerCase() === String(targetValue).toLowerCase());
      }
      return !String(actualValue).toLowerCase().includes(String(targetValue).toLowerCase());

    case "IS_EMPTY":
      if (actualValue === null || actualValue === undefined) return true;
      if (typeof actualValue === "string") return actualValue.trim().length === 0;
      if (Array.isArray(actualValue)) return actualValue.length === 0;
      if (typeof actualValue === "object") return Object.keys(actualValue).length === 0;
      return false;

    case "IS_NOT_EMPTY":
      if (actualValue === null || actualValue === undefined) return false;
      if (typeof actualValue === "string") return actualValue.trim().length > 0;
      if (Array.isArray(actualValue)) return actualValue.length > 0;
      if (typeof actualValue === "object") return Object.keys(actualValue).length > 0;
      return true;

    case "DATE_BEFORE": {
      const actualDate = new Date(actualValue);
      const targetDate = new Date(targetValue);
      return !isNaN(actualDate.getTime()) && !isNaN(targetDate.getTime()) && actualDate < targetDate;
    }

    case "DATE_AFTER": {
      const actualDate = new Date(actualValue);
      const targetDate = new Date(targetValue);
      return !isNaN(actualDate.getTime()) && !isNaN(targetDate.getTime()) && actualDate > targetDate;
    }

    case "IN_LIST":
      if (!Array.isArray(targetValue)) return false;
      return targetValue.map(String).map((s) => s.toLowerCase()).includes(String(actualValue).toLowerCase());

    default:
      console.warn(`[ConditionEvaluator] Unknown operator: ${rule.operator}`);
      return false;
  }
}

/**
 * Checks whether an item is a ConditionGroup
 */
function isConditionGroup(item: ConditionRule | ConditionGroup): item is ConditionGroup {
  return "combinator" in item && Array.isArray((item as any).rules);
}

/**
 * Evaluates a condition group (with recursive AND/OR trees) against input data
 */
export function evaluateConditionGroup(
  group: ConditionGroup | null | undefined,
  data: Record<string, any>
): boolean {
  if (!group || !Array.isArray(group.rules) || group.rules.length === 0) {
    return true; // No conditions defined means condition always satisfied
  }

  const combinator = group.combinator || "AND";

  if (combinator === "AND") {
    return group.rules.every((ruleOrGroup) => {
      if (isConditionGroup(ruleOrGroup)) {
        return evaluateConditionGroup(ruleOrGroup, data);
      }
      return evaluateRule(ruleOrGroup, data);
    });
  } else {
    // "OR" combinator
    return group.rules.some((ruleOrGroup) => {
      if (isConditionGroup(ruleOrGroup)) {
        return evaluateConditionGroup(ruleOrGroup, data);
      }
      return evaluateRule(ruleOrGroup, data);
    });
  }
}
