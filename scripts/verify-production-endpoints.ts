import "dotenv/config";
import http from "node:http";
import { signSession } from "../src/lib/auth/session";

async function createAuthCookie(payload: {
  userId: string;
  role: string;
  sessionId: string;
}) {
  const token = await signSession(payload);
  return `axivon_session=${token}`;
}

function fetchUrl(url: string, cookie?: string): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 3000,
        path: parsed.pathname + parsed.search,
        method: "GET",
        headers: cookie ? { Cookie: cookie } : {},
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 0, text: body }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function run() {
  console.log("=== VERIFYING PRODUCTION LOCALHOST SERVER ===");

  const adminId = "cmtkh2m0w000vrwjdwm7jwmdu";

  // 1. Public pages
  const p1 = await fetchUrl("http://localhost:3000/business-partner/apply");
  console.log(`[Public] /business-partner/apply -> HTTP ${p1.status}`);

  const p2 = await fetchUrl("http://localhost:3000/login?error=account_suspended");
  console.log(`[Public] /login?error=account_suspended -> HTTP ${p2.status}`);

  const p3 = await fetchUrl("http://localhost:3000/lead/AXP-QA-475B0E");
  console.log(`[Public] /lead/AXP-QA-475B0E -> HTTP ${p3.status}`);

  const p4 = await fetchUrl("http://localhost:3000/project/start/AXP-QA-475B0E");
  console.log(`[Public] /project/start/AXP-QA-475B0E -> HTTP ${p4.status}`);

  // 2. Admin Auth session
  const adminCookie = await createAuthCookie({
    userId: adminId,
    role: "ADMIN",
    sessionId: "admin-sess-prod-1",
  });

  const a1 = await fetchUrl("http://localhost:3000/admin/crm/brokers", adminCookie);
  console.log(`[Admin] /admin/crm/brokers -> HTTP ${a1.status}`);

  const a2 = await fetchUrl(
    "http://localhost:3000/admin/crm/brokers/cmvm28r3v000sua9kxitrwvys",
    adminCookie
  );
  console.log(`[Admin] /admin/crm/brokers/cmvm28r3v000sua9kxitrwvys (Dossier) -> HTTP ${a2.status}`);

  const a3 = await fetchUrl("http://localhost:3000/admin/crm/support", adminCookie);
  console.log(`[Admin] /admin/crm/support (Partner Support Desk) -> HTTP ${a3.status}`);

  const a4 = await fetchUrl("http://localhost:3000/api/v1/admin/support/brokers", adminCookie);
  console.log(`[Admin API] /api/v1/admin/support/brokers -> HTTP ${a4.status}`);

  // 3. Broker Auth session
  const brokerCookie = await createAuthCookie({
    userId: "cmvm28r3v000sua9kxitrwvys",
    role: "BUSINESS_PARTNER",
    sessionId: "broker-sess-prod-1",
  });

  const b1 = await fetchUrl("http://localhost:3000/broker/dashboard", brokerCookie);
  console.log(`[Broker] /broker/dashboard -> HTTP ${b1.status}`);

  const b2 = await fetchUrl("http://localhost:3000/broker/profile", brokerCookie);
  console.log(`[Broker] /broker/profile -> HTTP ${b2.status}`);

  const b3 = await fetchUrl("http://localhost:3000/broker/support", brokerCookie);
  console.log(`[Broker] /broker/support -> HTTP ${b3.status}`);

  console.log("\n=== PRODUCTION VERIFICATION COMPLETE ===");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
