import { NextRequest } from "next/server";
import { handleApkDownload } from "@/features/app-mode/apk-delivery";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleApkDownload(req);
}
