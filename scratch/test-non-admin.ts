import { NextRequest } from "next/server";
import { POST } from "../src/app/api/v1/admin/login-posters/route";

async function testWithNonAdmin() {
  // Vivek Kumar (BROKER)
  const req1 = new NextRequest("http://localhost:3000/api/v1/admin/login-posters", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": "cmueh304q00058cbrbhixh676" },
    body: JSON.stringify({ title: "Test", imageUrl: "https://example.com/test.jpg" }),
  });
  const res1 = await POST(req1);
  console.log("Broker status:", res1.status, await res1.json());

  // Non-existent user
  const req2 = new NextRequest("http://localhost:3000/api/v1/admin/login-posters", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": "non-existent-user-id" },
    body: JSON.stringify({ title: "Test", imageUrl: "https://example.com/test.jpg" }),
  });
  const res2 = await POST(req2);
  console.log("Non-existent user status:", res2.status, await res2.json());

  // Missing x-user-id (if middleware did not set it or failed)
  const req3 = new NextRequest("http://localhost:3000/api/v1/admin/login-posters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Test", imageUrl: "https://example.com/test.jpg" }),
  });
  const res3 = await POST(req3);
  console.log("Missing x-user-id status:", res3.status, await res3.json());
}

testWithNonAdmin();
