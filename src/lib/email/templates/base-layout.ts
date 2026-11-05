/**
 * Axivon Technologies — Official Email Layout Engine
 * 
 * Generates responsive, accessible, mobile-first transactional HTML emails
 * and clean plain-text fallbacks.
 */

export interface BaseLayoutOptions {
  title: string;
  previewText?: string;
  badge?: { text: string; variant?: "emerald" | "amber" | "blue" | "red" | "gray" };
  greeting?: string;
  paragraphs: string[];
  detailsTable?: Array<{ label: string; value: string }>;
  highlightBox?: {
    title?: string;
    content: string;
    variant?: "info" | "success" | "warning" | "alert";
  };
  ctaButton?: {
    text: string;
    url: string;
    variant?: "primary" | "secondary";
  };
  securityNote?: string;
  referenceId?: string;
}

const BADGE_STYLES = {
  emerald: "background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;",
  amber: "background: #fffbeb; color: #92400e; border: 1px solid #fde68a;",
  blue: "background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;",
  red: "background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;",
  gray: "background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb;",
};

const BOX_STYLES = {
  info: "background: #f8fafc; border-left: 4px solid #3b82f6; color: #1e293b;",
  success: "background: #f0fdf4; border-left: 4px solid #10b981; color: #064e3b;",
  warning: "background: #fffbeb; border-left: 4px solid #f59e0b; color: #78350f;",
  alert: "background: #fef2f2; border-left: 4px solid #ef4444; color: #7f1d1d;",
};

/**
 * Format a Date in Asia/Kolkata timezone with 12-hour AM/PM format.
 */
export function formatKolkataDateTime(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return date.toISOString().replace("T", " ").slice(0, 19) + " IST";
  }
}

/**
 * Escapes HTML characters safely.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderEmailHtml(options: BaseLayoutOptions): string {
  const currentYear = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axivontech.in";
  const badgeStyle = options.badge ? BADGE_STYLES[options.badge.variant || "gray"] : "";
  const boxStyle = options.highlightBox ? BOX_STYLES[options.highlightBox.variant || "info"] : "";

  const paragraphsHtml = options.paragraphs
    .map((p) => `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">${p}</p>`)
    .join("");

  const detailsHtml = options.detailsTable && options.detailsTable.length > 0
    ? `
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <tbody>
          ${options.detailsTable
            .map(
              (row, idx) => `
            <tr style="border-bottom: ${idx === options.detailsTable!.length - 1 ? "none" : "1px solid #e5e7eb"};">
              <td style="padding: 10px 16px; color: #6b7280; font-weight: 600; width: 35%; background: #f4f4f5;">${escapeHtml(row.label)}</td>
              <td style="padding: 10px 16px; color: #111827; font-weight: 500;">${row.value}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `
    : "";

  const highlightBoxHtml = options.highlightBox
    ? `
      <div style="${boxStyle} padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 14px; line-height: 1.5;">
        ${options.highlightBox.title ? `<strong style="display: block; margin-bottom: 6px; font-size: 14px;">${escapeHtml(options.highlightBox.title)}</strong>` : ""}
        <div>${options.highlightBox.content}</div>
      </div>
    `
    : "";

  const ctaHtml = options.ctaButton
    ? `
      <div style="text-align: center; margin: 32px 0 24px;">
        <a href="${options.ctaButton.url}" target="_blank" rel="noopener noreferrer" style="background: ${options.ctaButton.variant === "secondary" ? "#1f2937" : "#10b981"}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          ${escapeHtml(options.ctaButton.text)} &rarr;
        </a>
      </div>
    `
    : "";

  const securityNoteHtml = options.securityNote
    ? `
      <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #92400e; line-height: 1.4; margin: 20px 0;">
        <strong>Security Notice:</strong> ${options.securityNote}
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  ${options.previewText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${escapeHtml(options.previewText)}</div>` : ""}
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0d0d11; padding: 24px 28px; border-bottom: 3px solid #C2A878;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="padding-right: 12px;">
                          <img src="${appUrl}/assets/logo/logo-white.png" alt="AxivonTech" height="32" style="display: block; height: 32px; width: auto; border: 0;" />
                        </td>
                        <td valign="middle">
                          <span style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase; line-height: 1;">
                            Axivon<span style="color: #C2A878;">Tech</span>
                          </span>
                          <span style="display: block; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
                            Axivon Technologies Private Limited
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  ${options.referenceId ? `
                  <td align="right" valign="middle">
                    <span style="display: inline-block; padding: 4px 10px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 4px; font-family: monospace; font-size: 12px; color: #e5e7eb;">
                      ${escapeHtml(options.referenceId)}
                    </span>
                  </td>` : ""}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 28px;">
              <!-- Title & Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827; line-height: 1.3;">
                      ${escapeHtml(options.title)}
                    </h1>
                  </td>
                  ${options.badge ? `
                  <td align="right" style="vertical-align: top;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; ${badgeStyle}">
                      ${escapeHtml(options.badge.text)}
                    </span>
                  </td>` : ""}
                </tr>
              </table>

              <!-- Greeting -->
              ${options.greeting ? `<p style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px;">Hello ${escapeHtml(options.greeting)},</p>` : ""}

              <!-- Narrative Paragraphs -->
              ${paragraphsHtml}

              <!-- Details Table -->
              ${detailsHtml}

              <!-- Highlight Callout Box -->
              ${highlightBoxHtml}

              <!-- Action Button -->
              ${ctaHtml}

              <!-- Security Notice -->
              ${securityNoteHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 28px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; line-height: 1.6;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #374151;">
                Axivon Technologies • Next-Generation Enterprise Systems &amp; Software Solutions
              </p>
              <p style="margin: 0 0 8px;">
                Official Inquiries: <a href="mailto:axivontech.in@gmail.com" style="color: #10b981; text-decoration: none;">axivontech.in@gmail.com</a> • Website: <a href="https://axivontech.in" style="color: #10b981; text-decoration: none;">https://axivontech.in</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                This is an automated transactional notification sent securely from Axivon Technologies. Please do not reply directly with passwords or sensitive personal authentication keys.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function renderEmailPlainText(options: BaseLayoutOptions): string {
  const lines: string[] = [
    `======================================================`,
    `AXIVON TECHNOLOGIES — OFFICIAL TRANSACTIONAL NOTIFICATION`,
    `======================================================`,
    ``,
    options.title.toUpperCase(),
    options.referenceId ? `Reference ID: ${options.referenceId}` : ``,
    options.badge ? `Status: [${options.badge.text}]` : ``,
    ``,
    options.greeting ? `Hello ${options.greeting},` : ``,
    ``,
    ...options.paragraphs,
    ``,
  ];

  if (options.detailsTable && options.detailsTable.length > 0) {
    lines.push(`DETAILS:`);
    lines.push(`--------`);
    for (const row of options.detailsTable) {
      lines.push(`${row.label}: ${row.value.replace(/<[^>]*>/g, "")}`);
    }
    lines.push(``);
  }

  if (options.highlightBox) {
    lines.push(`NOTICE:`);
    if (options.highlightBox.title) lines.push(`[${options.highlightBox.title}]`);
    lines.push(options.highlightBox.content.replace(/<[^>]*>/g, ""));
    lines.push(``);
  }

  if (options.ctaButton) {
    lines.push(`ACTION REQUIRED:`);
    lines.push(`${options.ctaButton.text}: ${options.ctaButton.url}`);
    lines.push(``);
  }

  if (options.securityNote) {
    lines.push(`SECURITY NOTICE: ${options.securityNote}`);
    lines.push(``);
  }

  lines.push(`------------------------------------------------------`);
  lines.push(`Axivon Technologies • Enterprise Systems`);
  lines.push(`Email: axivontech.in@gmail.com • Web: https://axivontech.in`);
  lines.push(`Date: ${formatKolkataDateTime()}`);

  return lines.filter((l) => l !== "").join("\n");
}
