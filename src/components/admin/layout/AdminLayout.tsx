import { PropsWithChildren } from "react";
import Sidebar from "@/components/admin/sidebar/Sidebar";
import Navbar from "@/components/admin/navbar/Navbar";

/**
 * Props accepted by AdminLayout.
 *
 * `isSidebarCollapsed` is reserved for future use — actual collapse state
 * will be managed by a parent client component/context. AdminLayout only
 * reacts to the value; it never owns or mutates it.
 */
interface AdminLayoutProps extends PropsWithChildren {
  isSidebarCollapsed?: boolean;
}

/**
 * AdminLayout
 * ----------------------------------------------------------------------
 * Structural shell for the Axivon Technologies Admin Panel.
 *
 * Arranges Sidebar, Navbar, and page content into a full-viewport
 * Flexbox layout. Contains no business logic, no data fetching, and no
 * implementation details of Sidebar or Navbar — those are imported as
 * independent, reusable components.
 * ----------------------------------------------------------------------
 */
export default function AdminLayout({
  children,
  isSidebarCollapsed = false,
}: AdminLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0F1115] text-white">
      {/* ------------------------------------------------------------
          SIDEBAR REGION
          Fixed-width column, full viewport height, scrolls independently.
          Width reacts to `isSidebarCollapsed` — no internal Sidebar
          state is required for this to work.
      ------------------------------------------------------------- */}
      <aside
        className={`h-full shrink-0 overflow-y-auto border-r border-[#2B323D] bg-[#151A21] transition-[width] duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar />
      </aside>

      {/* ------------------------------------------------------------
          RIGHT REGION
          Vertical stack: Navbar (fixed height) + Main Content (flex-1).
          `min-w-0` prevents flex children from overflowing the row.
      ------------------------------------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* NAVBAR REGION — fixed height, full width, no internal scroll */}
        <header className="h-16 shrink-0 border-b border-[#2B323D] bg-background">
          <Navbar />
        </header>

        {/* MAIN CONTENT REGION
            - flex-1: consumes all remaining vertical space
            - min-h-0: required so overflow-y-auto works inside a flex column
            - overflow-y-auto: scrolls independently of Sidebar and Navbar
        */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#0F1115] px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}