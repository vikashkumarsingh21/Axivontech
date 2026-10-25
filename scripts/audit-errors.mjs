import fs from "fs";
import path from "path";

const srcDir = path.resolve("./src");

function walkDir(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files = files.concat(walkDir(full));
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walkDir(srcDir);
const results = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, "/");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Check patterns that might capture or render objects as errors
    const patterns = [
      { name: "setError with potential object or data.error", re: /setError\s*\(\s*(data\.error|res\.error|err\.message|error|data|result)\b/ },
      { name: "new Error(data.error)", re: /new\s+Error\s*\(\s*(data\.error|res\.error|json\.error)\b/ },
      { name: "throw new Error(data.error)", re: /throw\s+new\s+Error\s*\(\s*(data\.error|data\b)/ },
      { name: "data.error rendered in toast or alert", re: /(toast\s*\.\s*(?:error|warning|info|success)?|alert)\s*\(\s*(data\.error|err\.message|error\b)/ },
      { name: "JSX rendering {error} or {err}", re: /\{(?:\s*error\s*|\s*err\s*|\s*state\.error\s*|\s*formError\s*)\}/ },
      { name: "data.error directly assigned or checked", re: /(?:const|let|var)\s+\w*\s*=\s*(?:await\s+)?.*data\.error/ },
    ];

    for (const p of patterns) {
      if (p.re.test(line)) {
        results.push({
          file: relPath,
          line: lineNum,
          match: line.trim(),
          category: p.name,
        });
      }
    }
  });
}

console.log(`Found ${results.length} suspect locations across ${allFiles.length} files.`);
fs.writeFileSync("./scripts/audit-raw.json", JSON.stringify(results, null, 2));
