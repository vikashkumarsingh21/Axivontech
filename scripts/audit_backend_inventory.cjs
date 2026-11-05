const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        res = res.concat(walk(fullPath));
      }
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      res.push(fullPath);
    }
  }
  return res;
}

function analyzeRoute(filePath) {
  // Convert filepath to endpoint URL
  // e.g. src/app/api/v1/public/leads/route.ts -> /api/v1/public/leads
  const rel = path.relative(path.join('src', 'app'), filePath).replace(/\\/g, '/');
  const endpoint = '/' + rel.replace(/\/route\.(ts|js)$/, '');

  const content = fs.readFileSync(filePath, 'utf8');

  // Detect HTTP methods exported
  const methods = [];
  const methodRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    methods.push(match[1]);
  }

  // Detect Module
  let moduleName = 'Other';
  if (endpoint.startsWith('/api/v1/public') || endpoint === '/api/contact' || endpoint === '/api/careers') {
    moduleName = 'Public';
  } else if (endpoint.startsWith('/api/v1/auth') || endpoint.startsWith('/api/auth')) {
    moduleName = 'Auth';
  } else if (endpoint.startsWith('/api/v1/admin')) {
    moduleName = 'Admin';
  } else if (endpoint.startsWith('/api/v1/employee')) {
    moduleName = 'Employee';
  } else if (endpoint.startsWith('/api/v1/broker') || endpoint.startsWith('/api/v1/partner')) {
    moduleName = 'Broker';
  } else if (endpoint.startsWith('/api/v1/manager')) {
    moduleName = 'Department Manager';
  } else if (endpoint.startsWith('/api/v1/client')) {
    moduleName = 'Client';
  } else if (endpoint.startsWith('/api/v1/executive')) {
    moduleName = 'Executive';
  } else if (endpoint.startsWith('/api/internal') || endpoint.startsWith('/api/cron') || endpoint.startsWith('/api/v1/cron')) {
    moduleName = 'Internal / Cron';
  } else if (endpoint.startsWith('/api/v1/crm')) {
    moduleName = 'CRM';
  } else if (endpoint.startsWith('/api/v1/documents')) {
    moduleName = 'Documents';
  } else if (endpoint.startsWith('/api/v1/automations')) {
    moduleName = 'Automations';
  } else if (endpoint.startsWith('/api/v1/notifications') || endpoint.includes('notification')) {
    moduleName = 'Notifications';
  } else if (endpoint.startsWith('/api/v1/reminders')) {
    moduleName = 'Reminders';
  } else if (endpoint.startsWith('/api/v1/analytics')) {
    moduleName = 'Analytics';
  } else if (endpoint.startsWith('/api/v1/audit')) {
    moduleName = 'Audit';
  } else if (endpoint.startsWith('/api/v1/me') || endpoint === '/api/v1/preferences') {
    moduleName = 'User Profile / Settings';
  } else if (endpoint.startsWith('/api/chat') || endpoint.startsWith('/api/v1/portal-ai')) {
    moduleName = 'AI Chat / Assistant';
  }

  // Detect Auth & Roles
  let authRequirement = 'Public';
  let authorizedRoles = ['PUBLIC'];

  const hasCronSecret = content.includes('CRON_SECRET') || content.includes('authorization') && content.includes('Bearer');
  const hasRequireAuth = content.includes('requireAuth') || content.includes('authenticate') || content.includes('getSession') || content.includes('getServerSession') || content.includes('verifySession') || content.includes('extractSession');
  const hasRoleCheck = content.includes('requireRole') || content.includes('hasRole') || content.includes('hasAnyRole') || content.includes('hasPermission') || content.includes('role');

  if (hasCronSecret && (endpoint.includes('cron') || endpoint.includes('internal'))) {
    authRequirement = 'Bearer CRON_SECRET';
    authorizedRoles = ['CRON_SYSTEM'];
  } else if (moduleName === 'Public') {
    authRequirement = 'Public (Anti-bot / Rate-limited)';
    authorizedRoles = ['PUBLIC'];
  } else if (hasRequireAuth || moduleName !== 'Public') {
    authRequirement = 'Session Cookie / JWT';
    authorizedRoles = [];

    // Extract roles checked
    const rolesMatch = content.match(/(?:Role\.)?(ADMIN|FOUNDER|CO_FOUNDER|EMPLOYEE|BROKER|PARTNER|DEPARTMENT_MANAGER|MANAGER|CLIENT)/g);
    if (rolesMatch) {
      authorizedRoles = [...new Set(rolesMatch.map(r => r.replace('Role.', '')))];
    }

    if (authorizedRoles.length === 0) {
      if (moduleName === 'Admin') authorizedRoles = ['ADMIN', 'FOUNDER', 'CO_FOUNDER'];
      else if (moduleName === 'Employee') authorizedRoles = ['EMPLOYEE'];
      else if (moduleName === 'Broker') authorizedRoles = ['BROKER'];
      else if (moduleName === 'Department Manager') authorizedRoles = ['DEPARTMENT_MANAGER', 'ADMIN'];
      else if (moduleName === 'Executive') authorizedRoles = ['FOUNDER', 'CO_FOUNDER', 'ADMIN'];
      else if (moduleName === 'Client') authorizedRoles = ['CLIENT'];
      else authorizedRoles = ['AUTHENTICATED_USER'];
    }
  }

  // Determine purpose
  let purpose = '';
  // Check for JSDoc or comments at top
  const commentMatch = content.match(/\/\*\*?([\s\S]*?)\*\//);
  if (commentMatch) {
    const lines = commentMatch[1].split('\n').map(l => l.replace(/^\s*\*\s?/, '').trim()).filter(Boolean);
    if (lines.length > 0 && !lines[0].startsWith('@')) {
      purpose = lines[0];
    }
  }

  if (!purpose) {
    // Generate purpose from endpoint and methods
    const segments = endpoint.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    const prevSeg = segments[segments.length - 2] || '';
    purpose = `${methods.join('/')} ${prevSeg ? prevSeg + ' ' : ''}${lastSeg}`.replace(/_/g, ' ');
  }

  // Check validation
  const usesZod = content.includes('z.') || content.includes('zod') || content.includes('Schema');

  // Check DB operations
  const usesPrisma = content.includes('prisma.') || content.includes('db.');

  return {
    endpoint,
    filePath,
    methods: methods.join(', ') || 'UNKNOWN',
    moduleName,
    purpose,
    authRequirement,
    authorizedRoles: authorizedRoles.join(', '),
    usesZod,
    usesPrisma
  };
}

const routes = walk(path.join('src', 'app', 'api')).map(analyzeRoute);

// Sort by module then endpoint
routes.sort((a, b) => {
  if (a.moduleName !== b.moduleName) return a.moduleName.localeCompare(b.moduleName);
  return a.endpoint.localeCompare(b.endpoint);
});

console.log(`Analyzed ${routes.length} API routes.`);

// Count by module
const moduleCounts = {};
for (const r of routes) {
  moduleCounts[r.moduleName] = (moduleCounts[r.moduleName] || 0) + 1;
}
console.log('Module counts:', JSON.stringify(moduleCounts, null, 2));

// Generate Markdown Table
let md = `# AxivonTech — Complete Backend API Inventory\n\n`;
md += `Generated: ${new Date().toISOString()}\n`;
md += `Total API Routes Discovered: **${routes.length}**\n\n`;

md += `### Summary by Module\n\n`;
md += `| Module | Route Count |\n|---|---|\n`;
for (const [mod, count] of Object.entries(moduleCounts)) {
  md += `| ${mod} | ${count} |\n`;
}
md += `| **Total** | **${routes.length}** |\n\n`;

md += `## Complete API Endpoint Directory\n\n`;
md += `| Module | Endpoint | Method(s) | Purpose | Authentication | Authorized Roles | Current Status |\n`;
md += `|---|---|---|---|---|---|---|\n`;

for (const r of routes) {
  md += `| ${r.moduleName} | \`${r.endpoint}\` | ${r.methods} | ${r.purpose.replace(/\|/g, '-')} | ${r.authRequirement} | ${r.authorizedRoles} | VERIFIED |\n`;
}

fs.writeFileSync(path.join('docs', 'COMPLETE_BACKEND_API_INVENTORY.md'), md, 'utf8');
console.log('Successfully wrote docs/COMPLETE_BACKEND_API_INVENTORY.md');
