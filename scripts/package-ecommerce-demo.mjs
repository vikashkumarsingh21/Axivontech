import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const STAGING_DIR = path.join(ROOT_DIR, '.standalone-staging');
const TARGET_ZIP = path.join(ROOT_DIR, 'public', 'downloads', 'axivon-commerce-demo-v1.0.0.zip');
const EXTRACT_TEST_DIR = path.join(ROOT_DIR, '.temp_extract_test');

console.log('=== AXIVON COMMERCE DEMO STANDALONE PACKAGING ===\n');

// 1. Ensure public/downloads directory exists
const downloadsDir = path.join(ROOT_DIR, 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// 2. Clean staging directory
if (fs.existsSync(STAGING_DIR)) {
  fs.rmSync(STAGING_DIR, { recursive: true, force: true });
}
fs.mkdirSync(STAGING_DIR, { recursive: true });

// Helper to copy recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper to adapt code for standalone routes and imports
function adaptCode(content, isComponent = false) {
  let updated = content;

  // Adapt component imports
  updated = updated.replace(/@\/components\/demo-projects\/novacart\//g, '@/components/');
  
  // Adapt internal links from /demo-projects/ecommerce/novacart to top-level routes
  // e.g. "/demo-projects/ecommerce/novacart/shop" -> "/shop"
  updated = updated.replace(/\/demo-projects\/ecommerce\/novacart\//g, '/');
  // e.g. "/demo-projects/ecommerce/novacart" -> "/"
  updated = updated.replace(/["']\/demo-projects\/ecommerce\/novacart["']/g, '"/"');
  updated = updated.replace(/`\/demo-projects\/ecommerce\/novacart`/g, '"/"');

  return updated;
}

// 3. Setup folders in staging
const srcDir = path.join(STAGING_DIR, 'src');
const appDir = path.join(srcDir, 'app');
const compDir = path.join(srcDir, 'components');
const contextDir = path.join(srcDir, 'context');
const dataDir = path.join(srcDir, 'data');
const publicDir = path.join(STAGING_DIR, 'public');

fs.mkdirSync(appDir, { recursive: true });
fs.mkdirSync(compDir, { recursive: true });
fs.mkdirSync(contextDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

// 4. Copy and adapt components
console.log('Copying components...');
const componentsSource = path.join(ROOT_DIR, 'src', 'components', 'demo-projects', 'novacart');
const compFiles = fs.readdirSync(componentsSource);

for (const file of compFiles) {
  const srcFile = path.join(componentsSource, file);
  if (fs.statSync(srcFile).isFile()) {
    let content = fs.readFileSync(srcFile, 'utf8');

    if (file === 'NovaCartDemoStrip.tsx') {
      // Customize strip for standalone version
      content = `"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, RotateCcw, ExternalLink, Sparkles, Check } from "lucide-react";
import { resetDemoStoreData } from "@/data/novacart-store-data";

export default function NovaCartDemoStrip() {
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    if (confirm("Reset all demo orders, custom products, and cart to default state?")) {
      setResetting(true);
      resetDemoStoreData();
      setResetDone(true);
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  };

  return (
    <aside
      aria-label="Standalone Demo Bar"
      className="sticky top-0 z-50 w-full border-b border-[#DCDDD5] bg-[#E8EBE3]/95 text-[#1C1D1A] shadow-xs backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex h-9.5 max-w-7xl items-center justify-between gap-3 px-4 text-xs sm:px-6 lg:px-8">
        {/* Left: Brand & Local Mode Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#1C1D1A]">
            Axivon Commerce <span className="text-[#696D66]">v1.0.0</span> (Local Standalone Demo)
          </span>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="group inline-flex items-center gap-1.5 rounded-full border border-[#DCDDD5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1C1D1A] shadow-xs transition-all hover:bg-[#F7F7F2] active:scale-95"
            title="Reset demo data to default baseline"
          >
            {resetDone ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <RotateCcw className={"h-3 w-3 text-[#696D66] " + (resetting ? "animate-spin" : "")} />
            )}
            <span className="hidden sm:inline">{resetDone ? "Reset Complete" : "Reset Demo Data"}</span>
          </button>

          <Link
            href="/admin"
            className="group inline-flex items-center gap-1.5 rounded-full border border-[#DCDDD5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1C1D1A] shadow-xs transition-all hover:bg-[#F7F7F2]"
            title="Open isolated demo store admin console"
          >
            <LayoutDashboard className="h-3 w-3 text-[#1C1D1A]" />
            <span className="hidden sm:inline">Store Admin</span>
          </Link>

          <a
            href="https://axivontech.in/contact?project=NovaCart"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#1C1D1A] px-3 py-1 text-[11px] font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#343630]"
          >
            <Sparkles className="h-3 w-3 text-[#D8F16A]" />
            <span>Axivon Tech</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </div>
    </aside>
  );
}
`;
    } else {
      content = adaptCode(content, true);
    }

    fs.writeFileSync(path.join(compDir, file), content, 'utf8');
  }
}

// 5. Copy and adapt context & data
console.log('Copying context and data modules...');
const contextSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'context', 'NovaCartContext.tsx'), 'utf8');
fs.writeFileSync(path.join(contextDir, 'NovaCartContext.tsx'), adaptCode(contextSrc), 'utf8');

const dataSrc1 = fs.readFileSync(path.join(ROOT_DIR, 'src', 'data', 'novacart-data.ts'), 'utf8');
fs.writeFileSync(path.join(dataDir, 'novacart-data.ts'), dataSrc1, 'utf8');

const dataSrc2 = fs.readFileSync(path.join(ROOT_DIR, 'src', 'data', 'novacart-store-data.ts'), 'utf8');
fs.writeFileSync(path.join(dataDir, 'novacart-store-data.ts'), adaptCode(dataSrc2), 'utf8');

// 6. Copy and adapt App Router pages
console.log('Copying App Router pages...');
const appSource = path.join(ROOT_DIR, 'src', 'app', 'demo-projects', 'ecommerce', 'novacart');

function copyPages(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const sPath = path.join(src, entry.name);
    const dPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyPages(sPath, dPath);
    } else if (entry.name !== 'layout.tsx') {
      let content = fs.readFileSync(sPath, 'utf8');
      content = adaptCode(content);
      fs.writeFileSync(dPath, content, 'utf8');
    }
  }
}
copyPages(appSource, appDir);

// 7. Write Root layout.tsx for Standalone App
console.log('Writing standalone layout.tsx & globals.css...');
const standaloneLayout = `import type { Metadata } from "next";
import "./globals.css";
import { NovaCartProvider } from "@/context/NovaCartContext";
import NovaCartDemoStrip from "@/components/NovaCartDemoStrip";
import NovaCartHeader from "@/components/NovaCartHeader";
import NovaCartFooter from "@/components/NovaCartFooter";
import NovaCartToast from "@/components/NovaCartToast";

export const metadata: Metadata = {
  title: "NovaCart — Premium Lifestyle E-Commerce Application | Axivon Technologies",
  description:
    "A production-grade Next.js E-Commerce demonstration application crafted by Axivon Technologies. Features product discovery, category filtering, cart, wishlist, simulated checkout, order lifecycle tracking, and an isolated administrative console.",
  keywords: [
    "NovaCart",
    "Axivon Commerce",
    "E-Commerce App",
    "Next.js App Router",
    "Shopping Cart",
    "Admin Dashboard",
    "Axivon Technologies",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="h-full bg-[#F7F7F2] text-[#1C1D1A] font-sans antialiased selection:bg-[#D8F16A] selection:text-[#1C1D1A]">
        <NovaCartProvider>
          <div className="novacart-theme demo-light-theme min-h-screen flex flex-col">
            {/* Top Showcase Context Bar */}
            <NovaCartDemoStrip />

            {/* Store Header Navigation */}
            <NovaCartHeader />

            {/* Main Application Body */}
            <main className="flex-1">{children}</main>

            {/* Store Footer */}
            <NovaCartFooter />

            {/* Toast Notifications */}
            <NovaCartToast />
          </div>
        </NovaCartProvider>
      </body>
    </html>
  );
}
`;
fs.writeFileSync(path.join(appDir, 'layout.tsx'), standaloneLayout, 'utf8');

// 8. Write globals.css for Standalone App
const standaloneCss = `@import "tailwindcss";

:root {
  --novacart-background: #F7F7F2;
  --novacart-text: #1C1D1A;
  --novacart-accent: #D8F16A;
  --novacart-accent-hover: #c9e355;
  --novacart-surface: #FFFFFF;
  --novacart-secondary: #E8EBE3;
  --novacart-muted: #696D66;
  --novacart-border: #DCDDD5;
}

html {
  color-scheme: light;
}

body {
  background-color: var(--novacart-background);
  color: var(--novacart-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #F7F7F2;
}

::-webkit-scrollbar-thumb {
  background: #DCDDD5;
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #696D66;
}

/* Focus styles for accessibility */
:focus-visible {
  outline: 2px solid #1C1D1A;
  outline-offset: 2px;
}
`;
fs.writeFileSync(path.join(appDir, 'globals.css'), standaloneCss, 'utf8');

// 9. Copy public assets (all 52 images)
console.log('Copying images and public assets...');
const imagesSource = path.join(ROOT_DIR, 'public', 'images', 'demo-projects', 'novacart');
const imagesDest = path.join(publicDir, 'images', 'demo-projects', 'novacart');
copyDirRecursive(imagesSource, imagesDest);

// Copy favicon if available
const favSrc = path.join(ROOT_DIR, 'public', 'favicon.ico');
if (fs.existsSync(favSrc)) {
  fs.copyFileSync(favSrc, path.join(publicDir, 'favicon.ico'));
}

// 10. Write standalone package.json
console.log('Writing configuration files...');
const pkgJson = {
  name: "axivon-commerce-demo",
  version: "1.0.0",
  private: true,
  description: "Axivon Commerce — Fully Functional Standalone Next.js E-Commerce Demonstration Application with Customer Storefront and Isolated Store Admin Dashboard.",
  author: "Axivon Technologies (https://axivontech.in)",
  license: "MIT",
  scripts: {
    dev: "next dev -p 3000",
    build: "next build",
    start: "next start -p 3000",
    lint: "next lint"
  },
  dependencies: {
    "next": "^15.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^1.21.0",
    "framer-motion": "^12.4.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0"
  },
  devDependencies: {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0"
  }
};
fs.writeFileSync(path.join(STAGING_DIR, 'package.json'), JSON.stringify(pkgJson, null, 2) + '\n', 'utf8');

// 11. Write tsconfig.json
const tsConfig = {
  compilerOptions: {
    target: "ES2022",
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    plugins: [
      {
        name: "next"
      }
    ],
    paths: {
      "@/*": ["./src/*"]
    }
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"]
};
fs.writeFileSync(path.join(STAGING_DIR, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2) + '\n', 'utf8');

// 12. Write next.config.mjs
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
`;
fs.writeFileSync(path.join(STAGING_DIR, 'next.config.mjs'), nextConfig, 'utf8');

// 13. Write postcss.config.mjs
const postCssConfig = `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`;
fs.writeFileSync(path.join(STAGING_DIR, 'postcss.config.mjs'), postCssConfig, 'utf8');

// 14. Write .gitignore
const gitIgnore = `# Dependencies
/node_modules
/.pnp
.pnp.*

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Environment files
.env*.local
.env

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Misc
.DS_Store
*.log
`;
fs.writeFileSync(path.join(STAGING_DIR, '.gitignore'), gitIgnore, 'utf8');

// 15. Write .env.example
const envExample = `# AXIVON COMMERCE — STANDALONE DEMO ENVIRONMENT CONFIGURATION
# This demonstration application runs entirely locally with zero external database dependencies.
# All catalog updates, orders, cart state, and customer records persist securely in your browser's localStorage.

PORT=3000
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="NovaCart — Axivon Commerce"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;
fs.writeFileSync(path.join(STAGING_DIR, '.env.example'), envExample, 'utf8');

// 16. Write comprehensive README.md
const readme = `# Axivon Commerce (NovaCart Edition) — Standalone Demonstration Package

> **Engineered by [Axivon Technologies](https://axivontech.in)**  
> Production-Grade Next.js App Router E-Commerce Application Architecture

---

## 🛍️ Overview

**Axivon Commerce (NovaCart Edition)** is a complete, realistic, modern e-commerce application designed to demonstrate the frontend architecture, state management, checkout simulation, and back-office management capabilities engineered by Axivon Technologies.

This standalone package runs independently on your local machine with **zero database setup required**. All orders, cart states, wishlists, and product modifications persist seamlessly in your browser's local storage with a built-in one-click **Reset Demo Data** mechanism.

---

## ⚡ Quick Start (Run in 2 Minutes)

### Prerequisites
- **Node.js**: \`>= 18.18.0\` (Node 20+ LTS recommended)
- **Package Manager**: \`npm\` (or \`pnpm\` / \`yarn\`)

### Installation & Execution

\`\`\`bash
# 1. Unzip the downloaded package
unzip axivon-commerce-demo-v1.0.0.zip -d axivon-commerce-demo
cd axivon-commerce-demo

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
\`\`\`

Open your browser and navigate to:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🗺️ Application Routes

### Customer Storefront
| Route | Description |
|---|---|
| \`/\` | Hero showcase, category discovery, featured collection, and value pillars |
| \`/shop\` | Full catalog browsing, multi-category filters, sorting (price, newest, name) |
| \`/category/[slug]\` | Filtered category views (Fashion, Bags & Travel, Home & Living, Tech) |
| \`/products/[slug]\` | Product detail view, multi-angle gallery, color/variant selector, accordion specs |
| \`/cart\` | Interactive cart line items, quantity adjustment, promo code engine, free shipping bar |
| \`/wishlist\` | Saved items gallery with instant 'Move to Cart' action |
| \`/search\` | Real-time catalog search with instant keyboard navigation |
| \`/checkout\` | Multi-step demo checkout with billing/shipping address, shipping method, and card simulation |
| \`/order-confirmation\` | Dynamic receipt view with tracking code, order breakdown, and delivery estimate |
| \`/account\` | Customer profile, address book, and live order tracking history |

### Store Administration Console
| Route | Description |
|---|---|
| \`/admin\` | **Store Admin Dashboard** with 5 functional management tabs: |
| — *Overview* | Real-time KPI cards (Gross Revenue, Active Orders, Average Order Value, Total Customers) |
| — *Catalog* | Product inventory table, live search, stock toggling, add new product modal, product editing, deletion |
| — *Orders* | Live order stream, status lifecycle progression (\`PENDING\` ➔ \`PROCESSING\` ➔ \`SHIPPED\` ➔ \`DELIVERED\`), order inspector modal |
| — *Inventory* | Stock health alerts, Low Stock & Out of Stock indicators, quick stock level adjustments |
| — *Customers* | Customer directory, order counts, lifetime spend analytics |
| — *Reset Engine* | Confirmed **Reset Demo Data** action that restores seed state in 1 click |

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 15+ (App Router architecture)
- **UI Library**: React 19 (Server & Client Components)
- **Styling**: Tailwind CSS v4 (with custom porcelain/citrus lifestyle design system)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Context (\`NovaCartContext\`) + LocalStorage Persistence Engine
- **Image Assets**: 52 high-resolution, local lifestyle product photographs included directly in \`public/images/demo-projects/novacart/\`

---

## 🔒 Security & Isolation Note

- **Zero External Production Dependencies**: This demonstration package operates completely isolated from Axivon's live production database and CRM endpoints.
- **Mock Payment Safety**: The checkout simulation requires no real payment processing credentials. Test cards and addresses are purely illustrative.
- **Privacy by Design**: All customer accounts and orders created during testing exist strictly within your browser's local sandbox.

---

## 💼 Custom Software Development

Need a custom enterprise e-commerce platform, multi-vendor marketplace, headless Shopify setup, or high-performance Next.js application tailored to your business?

- **Website**: [https://axivontech.in](https://axivontech.in)
- **Consultation**: [https://axivontech.in/contact](https://axivontech.in/contact)
- **Email**: \`contact@axivontech.in\`

© ${new Date().getFullYear()} Axivon Technologies. All rights reserved.
`;
fs.writeFileSync(path.join(STAGING_DIR, 'README.md'), readme, 'utf8');

// 17. Count staged files
function countFiles(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) count += countFiles(path.join(dir, e.name));
    else count++;
  }
  return count;
}
const totalStaged = countFiles(STAGING_DIR);
console.log(`Successfully assembled ${totalStaged} files in staging directory.`);

// 18. Compress into ZIP archive using PowerShell
console.log(`Creating ZIP archive at: ${TARGET_ZIP}...`);
if (fs.existsSync(TARGET_ZIP)) {
  fs.unlinkSync(TARGET_ZIP);
}

const compressCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${STAGING_DIR}', '${TARGET_ZIP}')"`;
execSync(compressCmd, { stdio: 'inherit' });

const zipStats = fs.statSync(TARGET_ZIP);
console.log(`✓ Archive generated successfully! Size: ${(zipStats.size / (1024 * 1024)).toFixed(2)} MB (${zipStats.size} bytes)`);

// 19. Verify extraction integrity
console.log('Testing extraction integrity...');
if (fs.existsSync(EXTRACT_TEST_DIR)) {
  fs.rmSync(EXTRACT_TEST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(EXTRACT_TEST_DIR, { recursive: true });

const extractCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${TARGET_ZIP}', '${EXTRACT_TEST_DIR}')"`;
execSync(extractCmd, { stdio: 'inherit' });

const extractedCount = countFiles(EXTRACT_TEST_DIR);
console.log(`✓ Extracted ${extractedCount} files from archive.`);

// Check critical files
const criticalFiles = [
  'package.json',
  'README.md',
  'tsconfig.json',
  'next.config.mjs',
  'postcss.config.mjs',
  '.gitignore',
  '.env.example',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/shop/page.tsx',
  'src/app/cart/page.tsx',
  'src/app/checkout/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/account/page.tsx',
  'src/components/NovaCartHeader.tsx',
  'src/components/ProductCard.tsx',
  'src/context/NovaCartContext.tsx',
  'src/data/novacart-data.ts',
  'src/data/novacart-store-data.ts'
];

let allCriticalPresent = true;
for (const f of criticalFiles) {
  const p = path.join(EXTRACT_TEST_DIR, f);
  if (!fs.existsSync(p)) {
    console.error(`MISSING CRITICAL FILE in extraction: ${f}`);
    allCriticalPresent = false;
  }
}

if (allCriticalPresent) {
  console.log('✓ All critical files verified in archive extraction.');
} else {
  throw new Error('Extraction integrity verification failed!');
}

// Clean up staging & extraction directories
console.log('Cleaning temporary staging and test extraction directories...');
fs.rmSync(STAGING_DIR, { recursive: true, force: true });
fs.rmSync(EXTRACT_TEST_DIR, { recursive: true, force: true });

console.log('\n=== PACKAGING PROCESS COMPLETED SUCCESSFULLY! ===');
