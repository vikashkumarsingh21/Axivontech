import fs from "fs";
import path from "path";

const apiDir = path.resolve("./src/app/api");

function walkDir(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files = files.concat(walkDir(full));
    } else if (full.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

const apiFiles = walkDir(apiDir);
const shapes = new Set();
const apiDetails = [];

for (const file of apiFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, "/");

  // Check handleApiError
  if (content.includes("handleApiError(")) {
    shapes.add("handleApiError ({ success: false, error: { code, message, fields? }, message, details? })");
    apiDetails.push({ file: relPath, pattern: "handleApiError" });
  }

  // Check NextResponse.json({ error: ... })
  const jsonMatches = content.match(/NextResponse\.json\(\s*\{[\s\S]*?\}\s*,\s*\{\s*status:\s*([45]\d\d)/g);
  if (jsonMatches) {
    for (const match of jsonMatches) {
      if (match.includes("error:")) {
        if (/error:\s*["'`]/.test(match)) {
          shapes.add('{ error: string }');
        } else if (/error:\s*\{/.test(match)) {
          shapes.add('{ error: { code, message, ... } }');
        } else if (/error:\s*error\.message/.test(match)) {
          shapes.add('{ error: error.message (string) }');
        } else {
          shapes.add('{ error: ... (variable/object) }');
        }
      }
      if (match.includes("message:") && !match.includes("error:")) {
        shapes.add('{ success?: false, message: string }');
      }
      if (match.includes("errors:")) {
        shapes.add('{ errors: [...] }');
      }
      apiDetails.push({ file: relPath, snippet: match.slice(0, 100).replace(/\s+/g, " ") });
    }
  }
}

console.log("API Error Response Shapes Found:");
for (const s of shapes) {
  console.log(" - " + s);
}
console.log(`Total API route error sites sampled: ${apiDetails.length}`);
