import fs from "fs";
import path from "path";

function walk(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) res.push(p);
  }
  return res;
}

const files = walk("./src");
const issues = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
  const lines = content.split("\n");

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const l = line.trim();

    // 1. throw new Error(data.error ...) or new Error(res.error) or new Error(json.error)
    if (/new\s+Error\s*\(\s*(data|res|json|result)\.error/.test(l)) {
      issues.push({
        file: rel,
        line: lineNum,
        problem: "Unsafe new Error(data.error): if API returns { error: { message } }, Error message becomes '[object Object]'",
        snippet: l,
      });
    }

    // 2. setError(data.error ...) or setError(json.error ...)
    else if (/setError\s*\(\s*(data|res|json|result)\.error/.test(l)) {
      issues.push({
        file: rel,
        line: lineNum,
        problem: "Unsafe setError(data.error): sets state to object if API returns { error: { message } }",
        snippet: l,
      });
    }

    // 3. setError(err.message) or setError(error.message) after unsafe throw
    else if (/setError\s*\(\s*(err|error|e)\.message\s*(?:\|\|\s*["'].*?["'])?\s*\)/.test(l)) {
      issues.push({
        file: rel,
        line: lineNum,
        problem: "Potential '[object Object]' if err was constructed via new Error(object)",
        snippet: l,
      });
    }

    // 4. Directly rendering {error} or {err} in JSX
    else if (/<span>\s*\{\s*(error|err|formError)\s*\}\s*<\/span>|<p[^>]*>\s*\{\s*(error|err|formError)\s*\}\s*<\/p>|<div[^>]*>\s*\{\s*(error|err|formError)\s*\}\s*<\/div>/i.test(l)) {
      issues.push({
        file: rel,
        line: lineNum,
        problem: "Directly renders error state in JSX without safe string extraction",
        snippet: l,
      });
    }

    // 5. alert(err.message) or alert(data.error)
    else if (/alert\s*\(\s*(?:err|error|e)\.message/.test(l) || /alert\s*\(\s*(?:data|res|json)\.error/.test(l)) {
      issues.push({
        file: rel,
        line: lineNum,
        problem: "alert() used with potentially object-stringified error message",
        snippet: l,
      });
    }
  });
}

console.log(`Total unsafe error handling sites identified: ${issues.length}`);
fs.writeFileSync("./scripts/audit-issues.json", JSON.stringify(issues, null, 2));

// Summary by file
const byFile = {};
issues.forEach(iss => {
  if (!byFile[iss.file]) byFile[iss.file] = [];
  byFile[iss.file].push(iss);
});
console.log(`Unique files with issues: ${Object.keys(byFile).length}`);
for (const [f, list] of Object.entries(byFile)) {
  console.log(`${f} (${list.length} issues)`);
}
