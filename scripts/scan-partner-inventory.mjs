import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const ignoreDirs = new Set([
  ".git",
  ".next",
  "node_modules",
  "broker-ui-screenshots",
  "browser-screenshots",
  "employee-ui-screenshots",
  "error-screenshots",
  "export-screenshots",
  "lead-mgmt-screenshots",
  "dist",
]);

const terms = [
  "business partner",
  "business-partner",
  "businesspartner",
  "partner program",
  "partner-program",
  "broker-program",
  "broker-terms",
  "business-partner-terms",
  "business development partner",
  "broker partner",
];

const results = [];

function searchDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      searchDir(fullPath);
    } else if (entry.isFile()) {
      // Skip binary, lockfiles, minified or large test artifact files
      if (
        relPath.endsWith(".png") ||
        relPath.endsWith(".jpg") ||
        relPath.endsWith(".ico") ||
        relPath.endsWith(".svg") ||
        relPath.endsWith(".lock") ||
        relPath.endsWith("package-lock.json") ||
        relPath.endsWith("tsconfig.tsbuildinfo") ||
        relPath.endsWith("lint_errors.txt") ||
        relPath.endsWith("lint_errors-utf8.txt") ||
        relPath.endsWith(".log")
      ) {
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const lines = content.split("\n");

        lines.forEach((line, index) => {
          const lower = line.toLowerCase();
          for (const t of terms) {
            if (lower.includes(t)) {
              results.push({
                file: relPath,
                line: index + 1,
                term: t,
                snippet: line.trim().slice(0, 200),
              });
              break; // one match per line is enough
            }
          }
        });
      } catch (e) {
        // ignore unreadable
      }
    }
  }
}

searchDir(rootDir);

fs.writeFileSync("inventory-raw.json", JSON.stringify(results, null, 2));
console.log(`Scan complete. Found ${results.length} occurrences across the codebase.`);
