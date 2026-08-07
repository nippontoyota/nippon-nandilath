"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText } from "lucide-react";
import { FlagBadge } from "./FlagBadge";

export const adminNavItems = [
  { href: "/admin/dashboard", label: "Draw", fullLabel: "Draw Winner", icon: LayoutDashboard, badge: null as "flags" | null },
  { href: "/admin/dashboard/entries", label: "Entries", fullLabel: "Entries", icon: FileText, badge: null as "flags" | null },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
}

export function AdminNav({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 overflow-x-hidden" aria-label="Admin">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            title={isCollapsed ? item.fullLabel : undefined}
            className={`relative flex items-center rounded-md transition-colors ${
              isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5 w-full"
            } ${
              isActive
                ? "bg-[var(--gmart-red)] text-white shadow-sm"
                : "text-[var(--gmart-muted)] hover:bg-[#fff5f6] hover:text-[var(--gmart-title)]"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[var(--gmart-muted)]"}`} />
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate text-sm font-medium">{item.fullLabel}</span>
                {item.badge === "flags" && <FlagBadge />}
              </>
            )}
            {isCollapsed && item.badge === "flags" && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gmart-red)]"></span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--gmart-border)] bg-[var(--gmart-surface)]/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      aria-label="Admin mobile"
    >
      <div className="grid grid-cols-2 h-14">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                isActive ? "text-[var(--gmart-red)]" : "text-[var(--gmart-muted)]"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-[var(--gmart-red)]" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? "text-[var(--gmart-red)]" : "text-[var(--gmart-muted)]"}`} />
              <span>{item.label}</span>
              {item.badge === "flags" && (
                <span className="absolute top-1 right-[calc(50%-18px)]">
                  <FlagBadge />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
