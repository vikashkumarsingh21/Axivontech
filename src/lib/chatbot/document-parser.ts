import path from "path";
import zlib from "zlib";

export interface ParsedDocument {
  title: string;
  content: string;
  category: string;
  tags: string[];
  chunks: string[];
  metadata: {
    filename: string;
    extension: string;
    size: number;
    wordCount: number;
    charCount: number;
  };
}

/**
 * Validate upload file parameters
 */
export function validateUploadFile(file: { name: string; size: number; type?: string }): {
  valid: boolean;
  error?: string;
  ext: string;
} {
  const maxSize = 5 * 1024 * 1024; // 5 MB max
  if (file.size > maxSize) {
    return { valid: false, error: "File exceeds maximum size limit of 5MB.", ext: "" };
  }
  if (file.size === 0) {
    return { valid: false, error: "File is empty (0 bytes).", ext: "" };
  }

  const ext = path.extname(file.name).toLowerCase();
  const allowed = [".txt", ".md", ".json", ".csv", ".pdf", ".docx"];
  if (!allowed.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file format '${ext}'. Supported formats: .txt, .md, .json, .csv, .pdf, .docx`,
      ext,
    };
  }

  return { valid: true, ext };
}

/**
 * Clean & normalize extracted text
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // remove non-printable ASCII
    .replace(/\t/g, "  ")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Split text into semantic chunks for retrieval
 */
export function chunkText(text: string, maxChunkLength = 1000): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length + 2 <= maxChunkLength) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmed}` : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (trimmed.length > maxChunkLength) {
        // Break long paragraph by sentences or fixed chunks
        const sentences = trimmed.split(/(?<=[.?!])\s+/);
        let subChunk = "";
        for (const sent of sentences) {
          if (subChunk.length + sent.length + 1 <= maxChunkLength) {
            subChunk = subChunk ? `${subChunk} ${sent}` : sent;
          } else {
            if (subChunk) chunks.push(subChunk);
            subChunk = sent.slice(0, maxChunkLength);
          }
        }
        if (subChunk) currentChunk = subChunk;
        else currentChunk = "";
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks.length > 0 ? chunks : [text.slice(0, maxChunkLength)];
}

/**
 * Parse plain text or markdown buffer
 */
function parsePlainText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

/**
 * Parse CSV buffer into structured readable statements
 */
function parseCsv(buffer: Buffer): string {
  const text = buffer.toString("utf-8");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return "";

  const headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim());
  const rows: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.replace(/^["']|["']$/g, "").trim());
    const rowDesc = headers
      .map((h, idx) => (cols[idx] ? `${h}: ${cols[idx]}` : null))
      .filter(Boolean)
      .join(" | ");
    if (rowDesc) rows.push(`- ${rowDesc}`);
  }

  return rows.join("\n");
}

/**
 * Parse JSON buffer into readable text
 */
function parseJson(buffer: Buffer): string {
  try {
    const obj = JSON.parse(buffer.toString("utf-8"));
    if (typeof obj === "string") return obj;
    if (Array.isArray(obj)) {
      return obj
        .map((item) => (typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)))
        .join("\n\n");
    }
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    return buffer.toString("utf-8");
  }
}

/**
 * Extract readable text streams from a text-based PDF buffer without native dependencies
 */
function extractTextFromPdf(buffer: Buffer): string {
  const content = buffer.toString("latin1");
  const textFragments: string[] = [];

  // Match PDF text objects: BT ... ET
  const textObjectRegex = /BT[\s\S]*?ET/g;
  let match: RegExpExecArray | null;

  while ((match = textObjectRegex.exec(content)) !== null) {
    const block = match[0];
    // Match literal strings in parentheses: (string) Tj or ' or "
    const stringRegex = /\(((?:[^()\\]|\\.)*)\)\s*(?:Tj|'|")/g;
    let strMatch: RegExpExecArray | null;
    while ((strMatch = stringRegex.exec(block)) !== null) {
      const decoded = strMatch[1]
        .replace(/\\([()\\])/g, "$1")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, " ");
      if (decoded.trim()) textFragments.push(decoded);
    }

    // Match hex encoded strings: <HEX> Tj
    const hexRegex = /<([0-9A-Fa-f]+)>\s*(?:Tj|'|")/g;
    let hexMatch: RegExpExecArray | null;
    while ((hexMatch = hexRegex.exec(block)) !== null) {
      try {
        const hex = hexMatch[1];
        const bytes = Buffer.from(hex, "hex");
        const decoded = bytes.toString("utf-8");
        if (decoded.trim()) textFragments.push(decoded);
      } catch {}
    }
  }

  if (textFragments.length > 0) {
    return textFragments.join(" ");
  }

  // If no streams matched, check for standard ASCII text sequences
  const asciiMatches = content.match(/[A-Za-z0-9 ,.;:?!'"`@#$%&*()\-+=\/\n]{6,}/g);
  if (asciiMatches && asciiMatches.length > 5) {
    return asciiMatches.filter((s) => !s.startsWith("/Font") && !s.includes("endobj")).join(" ");
  }

  return "";
}

/**
 * Extract readable text from DOCX (unzip word/document.xml)
 */
function extractTextFromDocx(buffer: Buffer): string {
  try {
    // Look for PK\x03\x04 zip header
    const zipHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    let pos = 0;
    while (pos < buffer.length) {
      const nextHeader = buffer.indexOf(zipHeader, pos);
      if (nextHeader === -1) break;

      const filenameLen = buffer.readUInt16LE(nextHeader + 26);
      const extraLen = buffer.readUInt16LE(nextHeader + 28);
      const filename = buffer.toString("utf-8", nextHeader + 30, nextHeader + 30 + filenameLen);

      if (filename === "word/document.xml") {
        const compMethod = buffer.readUInt16LE(nextHeader + 8);
        const compSize = buffer.readUInt32LE(nextHeader + 18);
        const dataStart = nextHeader + 30 + filenameLen + extraLen;
        const compressedData = buffer.slice(dataStart, dataStart + compSize);

        let xmlContent = "";
        if (compMethod === 8) {
          // Deflate compressed
          xmlContent = zlib.inflateRawSync(compressedData).toString("utf-8");
        } else if (compMethod === 0) {
          xmlContent = compressedData.toString("utf-8");
        }

        if (xmlContent) {
          // Extract text inside <w:t> tags
          const textMatches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
          if (textMatches) {
            return textMatches.map((t) => t.replace(/<[^>]+>/g, "")).join(" ");
          }
        }
      }
      pos = nextHeader + 4;
    }
  } catch (err) {
    console.error("[Docx Extraction] Parsing error:", err);
  }
  return "";
}

/**
 * Main parser entry point
 */
export async function parseDocument(
  filename: string,
  buffer: Buffer,
  category = "COMPANY"
): Promise<{ success: boolean; data?: ParsedDocument; error?: string }> {
  const validation = validateUploadFile({ name: filename, size: buffer.length });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  let rawText = "";
  const ext = validation.ext;

  try {
    switch (ext) {
      case ".txt":
      case ".md":
        rawText = parsePlainText(buffer);
        break;
      case ".csv":
        rawText = parseCsv(buffer);
        break;
      case ".json":
        rawText = parseJson(buffer);
        break;
      case ".pdf":
        rawText = extractTextFromPdf(buffer);
        break;
      case ".docx":
        rawText = extractTextFromDocx(buffer);
        break;
      default:
        return { success: false, error: `Unsupported file extension: ${ext}` };
    }
  } catch (err) {
    return { success: false, error: `Failed to parse document: ${(err as Error).message}` };
  }

  const normalized = normalizeText(rawText);
  if (!normalized || normalized.length < 10) {
    return {
      success: false,
      error:
        ext === ".pdf"
          ? "No readable text could be extracted. The PDF might be scanned, image-only, or encrypted. (OCR is not supported)."
          : "The file contains no readable text content.",
    };
  }

  const baseTitle = path
    .basename(filename, ext)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  const chunks = chunkText(normalized);
  const words = normalized.split(/\s+/).filter(Boolean);

  // Extract automatic tags
  const tags = [ext.replace(".", ""), category.toLowerCase()];
  if (words.length > 50) tags.push("comprehensive");

  return {
    success: true,
    data: {
      title: baseTitle || "Uploaded Document",
      content: normalized,
      category,
      tags,
      chunks,
      metadata: {
        filename,
        extension: ext,
        size: buffer.length,
        wordCount: words.length,
        charCount: normalized.length,
      },
    },
  };
}
