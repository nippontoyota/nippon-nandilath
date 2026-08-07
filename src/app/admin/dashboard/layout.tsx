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
            <div className="flex items-center gap-2">
              {isCallCenter ? (
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--gmart-red)] text-white">
                  <Headset className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold bg-[var(--gmart-red)] text-white">
                  A
                </div>
              )}
              <span className="text-sm font-medium text-[var(--gmart-title)] hidden sm:inline">
                {isCallCenter ? "Call Center" : "Admin"}
              </span>
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
          <div className="max-w-6xl mx-auto w-full min-w-0">{children}</div>
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
