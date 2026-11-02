import { handleAppVersion } from "@/features/app-mode/version";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleAppVersion();
}
