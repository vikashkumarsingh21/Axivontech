import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwXF63WF4xQAMDJbv2yLiJSXamBxC47Ndu3M921vKteL3WsHYPnaEih-otyWSf6Xdg6/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.text();

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error("Contact API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit form",
      },
      { status: 500 }
    );
  }
}