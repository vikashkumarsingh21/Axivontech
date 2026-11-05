const fs = require('fs');
const path = require('path');

const publicDirs = [
  'src/app/about',
  'src/app/contact',
  'src/app/pricing',
  'src/app/reviews',
  'src/app/industries',
  'src/app/download',
  'src/app/services',
  'src/app/portfolio',
  'src/app/careers',
  'src/app/blog',
  'src/app/business-partner',
  'src/app/legal',
  'src/app/privacy-policy',
  'src/app/terms',
  'src/app/cookie-policy',
  'src/app/cookie-preferences',
  'src/app/privacy-requests',
  'src/app/refund-cancellation-policy',
  'src/app/security-policy',
  'src/components',
];

function scanDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (
        !full.includes('admin') &&
        !full.includes('employee') &&
        !full.includes('broker') &&
        !full.includes('manager') &&
        !full.includes('executive') &&
        !full.includes('client') &&
        !full.includes('mobile')
      ) {
        scanDir(full, fileList);
      }
    } else if (e.name.endsWith('.tsx') || e.name.endsWith('.jsx')) {
      fileList.push(full);
    }
  });
  return fileList;
}

const allPublicFiles = [];
publicDirs.forEach(d => {
  scanDir(path.join(process.cwd(), d), allPublicFiles);
});
allPublicFiles.push(path.join(process.cwd(), 'src/app/page.tsx'));
const uniqueFiles = Array.from(new Set(allPublicFiles));

const buttonIssues = [];

uniqueFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(process.cwd(), file).replace(/\\/g, '/');

  // match <button ...> or <motion.button ...>
  const btnRegex = /<(?:motion\.)?button([^>]*?)>/g;
  let match;
  while ((match = btnRegex.exec(content)) !== null) {
    const attrs = match[1];
    const hasOnClick = /onClick\s*=/.test(attrs);
    const isSubmit = /type\s*=\s*["']submit["']/.test(attrs);
    const isReset = /type\s*=\s*["']reset["']/.test(attrs);
    const isPopoverOrMenu = /popover|aria-haspopup|data-/.test(attrs);
    const isFormAttached = /form\s*=/.test(attrs);

    if (!hasOnClick && !isSubmit && !isReset && !isPopoverOrMenu && !isFormAttached) {
      // Find line number
      const lineNum = content.slice(0, match.index).split('\n').length;
      buttonIssues.push({
        file: relFile,
        line: lineNum,
        snippet: match[0].slice(0, 100),
      });
    }
  }
});

console.log('Buttons without explicit onClick or type="submit":', buttonIssues.length);
console.log(JSON.stringify(buttonIssues.slice(0, 30), null, 2));
