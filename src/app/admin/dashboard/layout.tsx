import { redirect } from "next/navigation";
import { getSession, logout } from "@/app/actions/auth";
import { LogOut, Headset } from "lucide-react";

import { AdminMobileNav } from "@/components/admin/AdminNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SupabaseRealtime } from "@/components/admin/SupabaseRealtime";
import { CAMPAIGN_NAME } from "@/lib/brand";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  
  const isCallCenter = session.role === "call_center";

  return (
    <div className="admin-shell h-dvh overflow-hidden flex">
      <SupabaseRealtime />

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[var(--gmart-surface)] border-b border-[var(--gmart-border)] shrink-0">
          <div className="h-1 w-full bg-[var(--gmart-red)] md:hidden" />
          <div className="h-14 flex items-center px-4 sm:px-6 justify-between">
            <div className="md:hidden flex items-center gap-2 min-w-0">
              <img
                src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
                alt=""
                className="w-5 h-5 shrink-0"
              />
              <span className="text-sm font-semibold text-[var(--gmart-title)] truncate">
                {CAMPAIGN_NAME}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <span className="admin-sale-badge">Live</span>
              <span className="text-sm text-[var(--gmart-muted)] truncate">Draw operations</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/api/export?type=entries"
                className="hidden sm:inline-flex items-center justify-center gap-2 h-8 px-3 rounded-md text-xs font-medium bg-white border border-[var(--gmart-border)] text-[var(--gmart-title)] hover:bg-[#fafafa] hover:text-[var(--gmart-red)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download Table in Excel
              </a>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#fafafa] border border-[var(--gmart-border)]">
                <Headset className="w-4 h-4 text-[var(--gmart-muted)]" />
                <span className="text-xs font-medium text-[var(--gmart-title)]">
                  {session?.role === "call_center" ? "Call Center Team" : "Administrator"}
                </span>
              </div>
              <form action={logout} className="md:hidden">
                <button
                  type="submit"
                  className="ml-1 p-2 rounded-md text-[var(--gmart-muted)] hover:bg-[#fff5f6] hover:text-[var(--gmart-red)] transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto pb-20 md:pb-8 bg-[var(--gmart-page)]">
          <div className="w-full min-w-0">{children}</div>
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
