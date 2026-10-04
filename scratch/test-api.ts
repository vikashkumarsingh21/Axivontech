import { NextResponse } from "next/server";
import { POST } from "../src/app/api/v1/public/business-partner/applications/route";

async function runTest() {
  const payload = {
    fullName: "Integration Test User",
    email: "integration_test@example.com",
    phone: "1234567890",
    country: "US",
    state: "NY",
    city: "New York",
    occupation: "Tester",
    currentWork: "Test Inc",
    yearsOfExperience: null,
    relevantExperience: "None",
    clientNetwork: "None",
    education10th: {
      school: "Test High School",
      board: "State Board",
      passingYear: "2010",
      percentage: "90%"
    },
    education12th: null,
    educationUndergrad: null,
    motivation: "I love testing",
    contribution: "I will test",
    additionalInfo: ""
  };

  const req = new Request("http://localhost/api/v1/public/business-partner/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const res = await POST(req);
  console.log("Status:", res.status);
  console.log("Body:", await res.json());

  // Test duplicate
  const req2 = new Request("http://localhost/api/v1/public/business-partner/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const res2 = await POST(req2);
  console.log("Duplicate Status:", res2.status);
  console.log("Duplicate Body:", await res2.json());
}

runTest().catch(console.error);
