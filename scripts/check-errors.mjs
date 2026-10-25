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
const violations = [];

for (const file of files) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const l = line.trim();

    // 1. Raw alert calls
    if (/\balert\s*\(/.test(l) && !l.startsWith("//") && !l.startsWith("/*")) {
      violations.push({
        file: rel,
        line: lineNum,
        rule: "no-raw-alert",
        message: "Use toast.error, toast.success, or toast.warning instead of browser alert()",
        snippet: l,
      });
    }

    // 2. Unsafe new Error(data.error)
    if (/throw\s+new\s+Error\s*\(\s*(?:data|res|json|result)\.error\b/.test(l)) {
      violations.push({
        file: rel,
        line: lineNum,
        rule: "no-unsafe-error-throw",
        message: "Do not pass raw data.error to new Error(); use getErrorMessage(data)",
        snippet: l,
      });
    }

    // 3. Unsafe setError(data.error)
    if (/setError\s*\(\s*(?:data|res|json|result)\.error\b/.test(l)) {
      violations.push({
        file: rel,
        line: lineNum,
        rule: "no-unsafe-set-error",
        message: "Do not pass raw data.error to setError(); use getErrorMessage(data)",
        snippet: l,
      });
    }
  });
}

if (violations.length > 0) {
  console.error(`❌ check:errors FAILED with ${violations.length} violations:\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.message}`);
    console.error(`    Code: ${v.snippet}\n`);
  }
  process.exit(1);
} else {
  console.log("✅ check:errors PASSED: 0 unsafe error handling locations or raw alert() calls detected!");
  process.exit(0);
}
