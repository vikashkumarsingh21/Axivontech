/**
 * Standardized Broker Portal formatting utilities.
 * Follows en-IN locale conventions, tabular figures, and safe date handling.
 */

export function formatCurrencyINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumberIN(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return "0";
  }
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatDateIN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

export function formatDateTimeIN(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "—";
  }
}

export function maskAccountNumber(acc: string | null | undefined): string {
  if (!acc) return "—";
  const clean = acc.replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  return `••••••••${clean.slice(-4)}`;
}

export function maskPanNumber(pan: string | null | undefined): string {
  if (!pan) return "—";
  const clean = pan.trim().toUpperCase();
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 2)}••••••${clean.slice(-2)}`;
}
