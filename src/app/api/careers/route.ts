import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwk0wNZz3agHASmWb3PUXfYRvijng6rN7SLPf2AoiHnLdpo-gxEKSnCqKOT25rht-Mg/exec";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      phone,
      position,
      location,
      linkedin,
      github,
      portfolio,
      resumeUrl,
      coverLetter,
    } = body;

    // Basic Validation
    if (
      !fullName ||
      !email ||
      !position ||
      !location ||
      !resumeUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields missing",
        },
        { status: 400 }
      );
    }

    // Send Data To Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        position,
        location,
        linkedin,
        github,
        portfolio,
        resumeUrl,
        coverLetter,
      }),
    });

    const text = await response.text();

console.log("========== GOOGLE APPS SCRIPT RESPONSE ==========");
console.log(text);
console.log("===============================================");

return NextResponse.json({
  success: true,
  response: text,
});

console.log("Apps Script Response:", text);

let result;

try {
  result = JSON.parse(text);
} catch {
  result = {
    success: false,
    raw: text,
  };
}

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Career API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}