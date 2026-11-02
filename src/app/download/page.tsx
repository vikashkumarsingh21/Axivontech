import { notFound } from "next/navigation";
import { isAppModeEnabled } from "@/features/app-mode";

export const dynamic = "force-dynamic";

export default function DownloadPage() {
  // Kill switch check: if App Mode is disabled, strictly return 404
  if (!isAppModeEnabled()) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="max-w-md p-8 rounded-xl bg-surface border border-white/10">
        <h1 className="text-2xl font-bold mb-4">Axivon Mobile App</h1>
        <p className="text-neutral-400 mb-6">
          The Axivon mobile application download portal is active.
        </p>
      </div>
    </div>
  );
}
