const fs = require('fs');
const path = require('path');

const portalDirs = [
  'src/app/admin',
  'src/app/employee',
  'src/app/broker',
  'src/app/manager',
  'src/app/executive',
  'src/app/client',
  'src/components/portal',
  'src/components/admin',
  'src/components/employee',
  'src/components/broker',
  'src/components/client',
];

function scanDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) scanDir(full, fileList);
    else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) fileList.push(full);
  });
  return fileList;
}

const allPortalFiles = [];
portalDirs.forEach(d => scanDir(path.join(process.cwd(), d), allPortalFiles));
const uniquePortalFiles = Array.from(new Set(allPortalFiles));
console.log('Auditing', uniquePortalFiles.length, 'portal files...');

// 1. Check for empty onClick or javascript:
const badHandlers = [];
uniquePortalFiles.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, idx) => {
    if (/onClick=\{\(\)\s*=>\s*\{\s*\}\}/.test(l)) {
      badHandlers.push({ file: path.relative(process.cwd(), f), line: idx + 1, code: l.trim() });
    }
    if (/href=["']#["']/.test(l)) {
      badHandlers.push({ file: path.relative(process.cwd(), f), line: idx + 1, code: l.trim() });
    }
  });
});

console.log('Bad handlers in portals:', badHandlers.length);
console.log(JSON.stringify(badHandlers, null, 2));
