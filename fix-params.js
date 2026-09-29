const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file === 'route.ts' || file === 'page.tsx') {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const routes = walk(path.join(__dirname, 'src/app'));

let fixedCount = 0;

for (const file of routes) {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  const regex = /(export\s+(?:default\s+)?(?:async\s+)?function\s+\w+\s*\([^,]+(?:,\s*|\s*\())\{\s*params\s*\}[^)]*\)\s*\{/g;
  const regexApi = /(export\s+async\s+function\s+(?:GET|POST|PUT|PATCH|DELETE)\s*\([^,]+,\s*)\{\s*params\s*\}[^)]*\)\s*\{/g;

  content = content.replace(regexApi, (match, prefix) => {
    changed = true;
    return `${prefix}props: { params: Promise<any> }) {\n  const params = await props.params;`;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} files.`);
