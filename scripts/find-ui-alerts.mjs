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
const matches = [];

for (const file of files) {
  const c = fs.readFileSync(file, "utf8");
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
  const lines = c.split("\n");
  lines.forEach((l, i) => {
    if (/\balert\s*\(/.test(l)) matches.push({ file: rel, line: i + 1, code: l.trim(), type: "alert" });
    if (/\btoast\s*\(|\btoast\.[a-z]+\(/.test(l)) matches.push({ file: rel, line: i + 1, code: l.trim(), type: "toast" });
  });
}

console.log(`Found ${matches.length} matches:`);
for (const m of matches) {
  console.log(`[${m.type}] ${m.file}:${m.line} -> ${m.code}`);
}
