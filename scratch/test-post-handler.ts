import { NextRequest } from "next/server";
import { POST } from "../src/app/api/v1/admin/login-posters/route";

async function testPostHandler() {
  try {
    // Admin user from database: admin@axivon.dev -> cmtkh2m0w000vrwjdwm7jwmdu
    const userId = "cmtkh2m0w000vrwjdwm7jwmdu";
    
    const request = new NextRequest("http://localhost:3000/api/v1/admin/login-posters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({
        title: "Our Fronted Inter",
        subtitle: null,
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjWFJxur5FAz8H7mwa7vTF",
        altText: null,
        ctaLabel: null,
        ctaUrl: null,
        displayOrder: 0,
        status: "DRAFT",
        startsAt: null,
        endsAt: null,
        internalNotes: null,
      }),
    });

    console.log("Calling POST handler...");
    const response = await POST(request);
    const status = response.status;
    const body = await response.json();
    console.log("POST Response status:", status);
    console.log("POST Response body:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("Unhandled error in test:", err);
  }
}

testPostHandler();
