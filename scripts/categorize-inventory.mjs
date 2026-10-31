import fs from "fs";

const raw = JSON.parse(fs.readFileSync("inventory-raw.json", "utf-8"));

// Group by file
const grouped = {};
for (const item of raw) {
  if (!grouped[item.file]) {
    grouped[item.file] = [];
  }
  grouped[item.file].push(item);
}

const categories = {
  publicPages: [],
  components: [],
  adminPortal: [],
  brokerPortal: [],
  apiRoutes: [],
  libAndServices: [],
  databaseAndPrisma: [],
  documentation: [],
  testsAndScripts: [],
};

for (const [file, items] of Object.entries(grouped)) {
  const sample = items[0];
  const info = {
    file,
    count: items.length,
    lines: items.map((i) => i.line),
    snippets: items.map((i) => i.snippet),
  };

  if (file.startsWith("src/app/(public)/") || file.startsWith("src/app/business-partner") || file.startsWith("src/app/broker-") || file.startsWith("src/app/partner-") || file === "src/app/sitemap.ts" || file === "src/app/cookie-preferences/CookiePreferencesPageClient.tsx" || file === "src/app/preview-palettes/page.tsx") {
    categories.publicPages.push(info);
  } else if (file.startsWith("src/components/")) {
    categories.components.push(info);
  } else if (file.startsWith("src/app/admin/")) {
    categories.adminPortal.push(info);
  } else if (file.startsWith("src/app/broker/") || file.startsWith("src/app/executive/")) {
    categories.brokerPortal.push(info);
  } else if (file.startsWith("src/app/api/")) {
    categories.apiRoutes.push(info);
  } else if (file.startsWith("src/lib/") || file.startsWith("src/config/")) {
    categories.libAndServices.push(info);
  } else if (file.startsWith("prisma/")) {
    categories.databaseAndPrisma.push(info);
  } else if (file.endsWith(".md")) {
    categories.documentation.push(info);
  } else {
    categories.testsAndScripts.push(info);
  }
}

fs.writeFileSync("inventory-categorized.json", JSON.stringify(categories, null, 2));
console.log("Categorization complete.");
for (const [k, v] of Object.entries(categories)) {
  console.log(`- ${k}: ${v.length} files`);
}
