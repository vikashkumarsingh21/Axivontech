import fs from "fs";
import path from "path";

// Verify we are not pointing to prod somehow
if (process.env.NODE_ENV === "production" && process.env.MIGRATION_SAFETY_OVERRIDE !== "true") {
  console.error("FATAL: Do not run ETL in production without safety overrides.");
  process.exit(1);
}

export const modelOwnership = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "migration", "model-ownership.json"), "utf8")
);

export const BATCH_SIZE = 500;
