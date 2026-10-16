import type { Metadata } from "next";
import { AdminPortalClient } from "@/components/portal/AdminPortalClient";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin & CRM Portal — Axivon Technologies",
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

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || "");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("axivon_session")?.value;

  let isInactive = false;
  let userName = "Administrator";
  let userRole = "ADMIN";
  let userEmail = "";

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, secretKey, {
        algorithms: ["HS256"],
      });
      const userId = payload.userId as string;
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, status: true, userRoles: { include: { role: true } } },
      });

      if (user) {
        userName = user.name;
        userEmail = user.email;
        if (user.userRoles.length > 0) {
          userRole = user.userRoles[0].role.name;
        }
        if (user.status === "INACTIVE") {
          isInactive = true;
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  if (isInactive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0D10] text-[#F3F5F7] p-6 text-center">
        <div className="max-w-md space-y-6 bg-[#151A21] border border-[#29313B] rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-[#F3F5F7] tracking-tight">Account Inactive</h1>
          <p className="text-sm text-[#7E8997]">
            Your account is currently inactive. Please contact the administrator for further assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminPortalClient
      userName={userName}
      userRole={userRole}
      userEmail={userEmail}
    >
      {children}
    </AdminPortalClient>
  );
}
