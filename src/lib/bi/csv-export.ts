/**
 * Safe CSV Generation Utility
 * Features:
 * - RFC 4180 compliance (double quotes for strings containing commas, quotes, or newlines)
 * - Formula Injection Protection: Prefixes values starting with '=', '+', '-', '@', '\t', '\r' with an apostrophe (')
 * - Unicode UTF-8 BOM support for Excel compatibility
 */

export interface CsvColumn<T = any> {
  header: string;
  accessor: (row: T) => any;
}

/**
 * Sanitizes a string against CSV/Formula Injection attacks.
 */
export function sanitizeCsvValue(val: any): string {
  if (val === null || val === undefined) {
    return "";
  }

  const raw = String(val);
  const dangerousPrefixes = ["=", "+", "-", "@", "\t", "\r"];
  const hasDangerousPrefix = dangerousPrefixes.some((prefix) => raw.startsWith(prefix));

  let str = hasDangerousPrefix ? `'${raw}` : raw.trim();

  // If contains comma, quote, or newline, escape quotes and wrap in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generates an RFC 4180-compliant CSV string from rows and column definitions.
 */
export function generateCsv<T>(data: T[], columns: CsvColumn<T>[]): string {
  const headers = columns.map((col) => sanitizeCsvValue(col.header)).join(",");
  const rows = data.map((row) =>
    columns.map((col) => sanitizeCsvValue(col.accessor(row))).join(",")
  );

  // Prepend UTF-8 Byte Order Mark (BOM) for correct rendering in Excel
  return "\uFEFF" + [headers, ...rows].join("\r\n");
}
