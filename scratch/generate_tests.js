const fs = require('fs');
const path = require('path');
const baseDir = 'c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies';
function writeFile(relPath, content) {
    const fp = path.join(baseDir, relPath);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, content.trim() + '\n');
    console.log('Created: ' + relPath);
}

writeFile('tests/rbac.test.ts', `
import { describe, it, expect, vi } from "vitest";
import { hasPermission } from "../src/lib/auth/permissions";

// Mock the db
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.id === "user-with-perm") {
          return Promise.resolve({
            id: "user-with-perm",
            userRoles: [{
              role: {
                rolePermissions: [{
                  permission: { name: "tasks:read" }
                }]
              }
            }]
          });
        }
        if (where.id === "user-no-perm") {
          return Promise.resolve({
            id: "user-no-perm",
            userRoles: [{
              role: {
                rolePermissions: [{
                  permission: { name: "other:read" }
                }]
              }
            }]
          });
        }
        return Promise.resolve(null);
      })
    }
  }
}));

describe("RBAC Permissions", () => {
  it("should return true if user has required permission", async () => {
    const allowed = await hasPermission("user-with-perm", "tasks:read");
    expect(allowed).toBe(true);
  });

  it("should return false if user lacks permission", async () => {
    const allowed = await hasPermission("user-no-perm", "tasks:read");
    expect(allowed).toBe(false);
  });

  it("should return false if user not found", async () => {
    const allowed = await hasPermission("unknown-user", "tasks:read");
    expect(allowed).toBe(false);
  });
});
`);
