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

// Get all API routes in src/app/api
function getApiRoutes(dir, baseRoute = '/api') {
  let routes = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    if (e.isDirectory()) {
      routes.push(...getApiRoutes(path.join(dir, e.name), baseRoute + '/' + e.name));
    } else if (e.name === 'route.ts' || e.name === 'route.js') {
      routes.push(baseRoute);
    }
  });
  return routes;
}

const knownApiRoutes = getApiRoutes(path.join(process.cwd(), 'src/app/api'));
console.log('Total known API routes in backend:', knownApiRoutes.length);

function matchesApiRoute(calledUrl) {
  const urlPath = calledUrl.split('?')[0].replace(/\/$/, '');
  if (knownApiRoutes.includes(urlPath)) return true;

  const targetSegments = urlPath.split('/').filter(Boolean);
  for (const r of knownApiRoutes) {
    const rSegments = r.split('/').filter(Boolean);
    if (rSegments.length !== targetSegments.length) continue;
    let match = true;
    for (let i = 0; i < rSegments.length; i++) {
      if (rSegments[i].startsWith('[') && rSegments[i].endsWith(']')) continue;
      if (rSegments[i] !== targetSegments[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

const calledApis = [];
const apiRegex = /fetch\(["'`](\/api\/[^"'`?]+)/g;

allPortalFiles.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = apiRegex.exec(c)) !== null) {
    calledApis.push({
      file: path.relative(process.cwd(), f),
      api: m[1],
    });
  }
});

console.log('Total API calls scanned in portals:', calledApis.length);

const missingApis = calledApis.filter(a => !matchesApiRoute(a.api));
console.log('Missing/unmatched API routes called by portals:', missingApis.length);
console.log(JSON.stringify(missingApis, null, 2));
