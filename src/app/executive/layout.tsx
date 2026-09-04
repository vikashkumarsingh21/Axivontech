import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Portal",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || "");

export default async function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("axivon_session")?.value;

  let isInactive = false;
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, secretKey, {
        algorithms: ["HS256"],
      });
      const userId = payload.userId as string;
      const user = await db.user.findUnique({ where: { id: userId }, select: { status: true } });
      if (user?.status === "INACTIVE") {
        isInactive = true;
      }
    } catch (error) {
      // Ignore
    }
  }

  if (isInactive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-gray-200 p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ACCOUNT INACTIVE</h1>
          <p className="text-gray-400">
            Your account is currently inactive. Please contact the administrator for further assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {children}
    </div>
  );
}
