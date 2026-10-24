/**
 * HTML content sanitizer to prevent stored and reflected XSS.
 * Strips script tags, onerror/onload/onclick and dangerous javascript: URIs.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  return html
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove inline event handlers (e.g. onerror=, onload=, onclick=)
    .replace(/\son\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, "")
    // Neutralize javascript: pseudo-protocol in links and images
    .replace(/(href|src)\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, '$1="#"')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Remove object/embed tags
    .replace(/<(object|embed)\b[^>]*>.*?<\/\1>/gi, "");
}
