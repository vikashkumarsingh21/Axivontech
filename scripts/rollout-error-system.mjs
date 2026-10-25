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

const allFiles = walk("./src");
let modifiedFilesCount = 0;

for (const file of allFiles) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
  let content = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  let original = content;

  // Check if file contains alert or unsafe error handling
  const hasAlert = /\balert\s*\(/.test(content);
  const hasUnsafeErrorThrow = /throw\s+new\s+Error\s*\(\s*(?:data|res|json|result)\.error/.test(content);
  const hasUnsafeSetError = /setError\s*\(\s*(?:data|res|json|result)\.error/.test(content);

  if (!hasAlert && !hasUnsafeErrorThrow && !hasUnsafeSetError) {
    continue;
  }

  // 1. Ensure imports
  const needsToast = hasAlert;
  const needsErrorHelper = hasUnsafeErrorThrow || hasUnsafeSetError || hasAlert;

  let importsToAdd = [];
  if (needsToast && !content.includes("from \"@/lib/notifications/toast\"") && !content.includes("from '@/lib/notifications/toast'")) {
    importsToAdd.push('import { toast } from "@/lib/notifications/toast";');
  }
  if (needsErrorHelper && !content.includes("from \"@/lib/errors/client\"") && !content.includes("from '@/lib/errors/client'")) {
    importsToAdd.push('import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";');
  }

  if (importsToAdd.length > 0) {
    // Add imports after "use client" or top import
    if (content.startsWith('"use client";') || content.startsWith("'use client';")) {
      const firstLineEnd = content.indexOf("\n");
      content = content.slice(0, firstLineEnd + 1) + "\n" + importsToAdd.join("\n") + "\n" + content.slice(firstLineEnd + 1);
    } else {
      content = importsToAdd.join("\n") + "\n" + content;
    }
  }

  // 2. Replace alert(...) patterns
  // Success alerts
  content = content.replace(/alert\s*\(\s*`Partner Account created successfully![\s\S]*?`\s*\);?/g, 
    'toast.success(`Partner Account created successfully!\\nPartner ID: ${data.partnerId}\\nReferral Code: ${data.referralCode}`);');
  content = content.replace(/alert\s*\(\s*["']Template copied to clipboard!?["']\s*\);?/g, 
    'toast.success("Template copied to clipboard!");');

  // Warning alerts
  content = content.replace(/alert\s*\(\s*["'](Please [^"']+)["']\s*\);?/g, 'toast.warning("$1");');
  content = content.replace(/alert\s*\(\s*["'](Reason\/message is required[^"']+)["']\s*\);?/g, 'toast.warning("$1");');
  content = content.replace(/alert\s*\(\s*["'](Title and [^"']+)["']\s*\);?/g, 'toast.warning("$1");');
  content = content.replace(/alert\s*\(\s*["'](Question and [^"']+)["']\s*\);?/g, 'toast.warning("$1");');
  content = content.replace(/alert\s*\(\s*["'](Filename and [^"']+)["']\s*\);?/g, 'toast.warning("$1");');
  content = content.replace(/alert\s*\(\s*["'](Contract document not yet uploaded[^"']+)["']\s*\);?/g, 'toast.warning("$1");');

  // Error alerts
  content = content.replace(/alert\s*\(\s*\(err as Error\)\.message\s*\);?/g, 'toast.error(getErrorMessage(err));');
  content = content.replace(/alert\s*\(\s*\(e as Error\)\.message\s*\);?/g, 'toast.error(getErrorMessage(e));');
  content = content.replace(/alert\s*\(\s*(?:err|error)\.message\s*\|\|\s*["']([^"']+)["']\s*\);?/g, 'toast.error(getErrorMessage(err));');
  content = content.replace(/alert\s*\(\s*(?:e)\.message\s*\|\|\s*["']([^"']+)["']\s*\);?/g, 'toast.error(getErrorMessage(e));');
  content = content.replace(/alert\s*\(\s*(?:err|error)\.message\s*\);?/g, 'toast.error(getErrorMessage(err));');
  content = content.replace(/alert\s*\(\s*(?:e)\.message\s*\);?/g, 'toast.error(getErrorMessage(e));');
  content = content.replace(/alert\s*\(\s*["']Failed: ["']\s*\+\s*e\.message\s*\);?/g, 'toast.error("Failed: " + getErrorMessage(e));');
  content = content.replace(/alert\s*\(\s*["']Delete failed: ["']\s*\+\s*e\.message\s*\);?/g, 'toast.error("Delete failed: " + getErrorMessage(e));');
  content = content.replace(/alert\s*\(\s*["']Failed to delete application: ["']\s*\+\s*e\.message\s*\);?/g, 'toast.error("Failed to delete application: " + getErrorMessage(e));');
  content = content.replace(/alert\s*\(\s*([^);]+)\s*\);?/g, 'toast.error(getErrorMessage($1));');

  // 3. Fix unsafe new Error(data.error)
  content = content.replace(/throw\s+new\s+Error\s*\(\s*(data|res|json|result)\.error\s*\?\.\s*message\s*\|\|\s*(?:(data|res|json|result)\.message\s*\|\|\s*)?["']([^"']+)["']\s*\)/g,
    'throw new Error(getErrorMessage($1) || "$3")');
  content = content.replace(/throw\s+new\s+Error\s*\(\s*(data|res|json|result)\.error\s*\|\|\s*(?:(data|res|json|result)\.message\s*\|\|\s*)?["']([^"']+)["']\s*\)/g,
    'throw new Error(getErrorMessage($1) || "$3")');
  content = content.replace(/throw\s+new\s+Error\s*\(\s*(data|res|json|result)\.error\s*\?\.\s*message\s*\|\|\s*["']([^"']+)["']\s*\)/g,
    'throw new Error(getErrorMessage($1) || "$2")');
  content = content.replace(/throw\s+new\s+Error\s*\(\s*(data|res|json|result)\.error\s*\)/g,
    'throw new Error(getErrorMessage($1))');
  content = content.replace(/new\s+Error\s*\(\s*(data|res|json|result)\.error\s*\|\|\s*["']([^"']+)["']\s*\)/g,
    'new Error(getErrorMessage($1) || "$2")');

  // 4. Fix unsafe setError(data.error)
  content = content.replace(/setError\s*\(\s*(data|res|json|result)\.error\s*\|\|\s*["']([^"']+)["']\s*\)/g,
    'setError(getErrorMessage($1) || "$2")');
  content = content.replace(/setError\s*\(\s*(data|res|json|result)\.error\s*\)/g,
    'setError(getErrorMessage($1))');

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    modifiedFilesCount++;
    console.log(`Updated: ${rel}`);
  }
}

console.log(`Successfully updated ${modifiedFilesCount} files!`);
