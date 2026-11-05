const fs = require('fs');
const path = require('path');

// Gather all defined routes
function getAppRoutes(dir, baseRoute = '') {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
        routes.push(...getAppRoutes(path.join(dir, entry.name), baseRoute));
      } else if (!entry.name.startsWith('@')) {
        routes.push(...getAppRoutes(path.join(dir, entry.name), baseRoute + '/' + entry.name));
      }
    } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx' || entry.name === 'page.js') {
      routes.push(baseRoute === '' ? '/' : baseRoute);
    }
  }
  return routes;
}

const knownRoutes = getAppRoutes(path.join(process.cwd(), 'src/app'));

function matchesRoute(targetPath) {
  // strip query and hash
  const urlPath = targetPath.split('?')[0].split('#')[0];
  if (!urlPath.startsWith('/')) return true; // external or anchor
  if (urlPath === '' || urlPath === '/') return true;
  if (
    urlPath.startsWith('/assets') ||
    urlPath.startsWith('/downloads') ||
    urlPath.startsWith('/api') ||
    urlPath.startsWith('/favicon') ||
    urlPath.endsWith('.png') ||
    urlPath.endsWith('.jpg') ||
    urlPath.endsWith('.svg') ||
    urlPath.endsWith('.webp') ||
    urlPath.endsWith('.apk') ||
    urlPath.endsWith('.pdf')
  ) {
    return true; // asset/api/download
  }

  // Exact match
  if (knownRoutes.includes(urlPath)) return true;

  // Match dynamic routes
  const targetSegments = urlPath.split('/').filter(Boolean);
  
  for (const r of knownRoutes) {
    const rSegments = r.split('/').filter(Boolean);
    if (rSegments.length !== targetSegments.length) continue;
    let match = true;
    for (let i = 0; i < rSegments.length; i++) {
      if (rSegments[i].startsWith('[') && rSegments[i].endsWith(']')) {
        continue; // dynamic segment matches any value
      }
      if (rSegments[i] !== targetSegments[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

// Search all files in src/
function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'node_modules' && file.name !== '.next') {
        scanDir(fullPath, fileList);
      }
    } else if (
      file.name.endsWith('.tsx') ||
      file.name.endsWith('.ts') ||
      file.name.endsWith('.jsx') ||
      file.name.endsWith('.js')
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = scanDir(path.join(process.cwd(), 'src'));
console.log('Scanning ' + allFiles.length + ' source files for links...');

const brokenLinks = [];
const linkPatterns = [
  /href=["'](\/[^"']*)["']/g,
  /href=\{["'](\/[^"']*)["']\}/g,
  /href=\{`(\/[^`$]*)`\}/g,
  /router\.push\(["'](\/[^"']*)["']\)/g,
  /router\.replace\(["'](\/[^"']*)["']\)/g,
  /redirect\(["'](\/[^"']*)["']\)/g,
];

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const pattern of linkPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const link = match[1];
      if (!matchesRoute(link)) {
        brokenLinks.push({
          file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
          link: link,
        });
      }
    }
  }
}

console.log('Broken link references found:', brokenLinks.length);
console.log(JSON.stringify(brokenLinks, null, 2));
