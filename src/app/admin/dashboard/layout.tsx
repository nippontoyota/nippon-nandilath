import { redirect } from "next/navigation";
import { isAuthenticated, logout } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

import { AdminNav, AdminMobileNav } from "@/components/admin/AdminNav";
import { SupabaseRealtime } from "@/components/admin/SupabaseRealtime";
import { CAMPAIGN_NAME } from "@/lib/brand";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/admin/login");
  }

  return (
    <div className="h-dvh overflow-hidden flex text-gray-900 font-sans bg-gray-50">
      <SupabaseRealtime />

      <aside className="w-60 bg-white border-r border-gray-200 flex-col hidden md:flex shrink-0">
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-200">
          <img
            src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
            alt=""
            className="w-5 h-5"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">Nippon Toyota</p>
            <p className="text-[11px] text-gray-500 leading-tight">{CAMPAIGN_NAME} Admin</p>
          </div>
        </div>
        <AdminNav />
        <div className="p-3 border-t border-gray-200">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 w-full text-left transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0 opacity-70" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 justify-between shrink-0">
          <div className="md:hidden flex items-center gap-2 min-w-0">
            <img
              src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
              alt=""
              className="w-5 h-5 shrink-0"
            />
            <span className="text-sm font-semibold text-gray-900 truncate">{CAMPAIGN_NAME} Admin</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold bg-gray-900 text-white">
              A
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin</span>
            <form action={logout} className="md:hidden">
              <button
                type="submit"
                className="ml-1 p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto w-full min-w-0">{children}</div>
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
