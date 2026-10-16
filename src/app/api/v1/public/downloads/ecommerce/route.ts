import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const infoOnly = searchParams.get("info") === "true";

    const zipFilename = "axivon-commerce-demo-v1.0.0.zip";
    const zipPath = path.join(process.cwd(), "public", "downloads", zipFilename);

    let fileExists = false;
    let stats: fs.Stats | null = null;

    try {
      if (fs.existsSync(zipPath)) {
        fileExists = true;
        stats = fs.statSync(zipPath);
      }
    } catch {
      // Ignore stat error
    }

    // Metadata JSON response
    if (infoOnly) {
      return NextResponse.json({
        name: "Axivon Commerce Standalone Demo",
        version: "1.0.0",
        filename: zipFilename,
        format: "application/zip",
        available: fileExists,
        sizeBytes: stats ? stats.size : 0,
        releaseDate: "2026-10-16",
        framework: "Next.js 16 (App Router) + React 19 + Tailwind CSS",
        requirements: {
          node: ">=18.18.0",
          npm: ">=9.0.0",
          memory: "2GB RAM",
        },
        features: [
          "Customer Lifestyle Storefront",
          "Product Catalog & Multi-attribute Variants",
          "Cart & Wishlist with Local Persistence",
          "Simulated Checkout Flow",
          "Order Confirmation & Account History",
          "Isolated Store Admin Console",
          "Product CRUD & Stock Level Controls",
          "Demo State Reset Engine",
        ],
      });
    }

    if (!fileExists) {
      return NextResponse.json(
        {
          error: "Download package is being prepared or is temporarily unavailable.",
          status: "PREPARING",
        },
        { status: 404 }
      );
    }

    const fileBuffer = await fs.promises.readFile(zipPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": stats?.size ? stats.size.toString() : fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process download request", details: err?.message },
      { status: 500 }
    );
  }
}
