"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText } from "lucide-react";
import { FlagBadge } from "./FlagBadge";

export const adminNavItems = [
  { href: "/admin/dashboard", label: "Draw", fullLabel: "Draw Winner", icon: LayoutDashboard, badge: null as "flags" | null },
  { href: "/admin/dashboard/entries", label: "Entries", fullLabel: "Entries", icon: FileText, badge: "flags" as const },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Admin">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? "bg-[var(--gmart-red)] text-white shadow-sm"
                : "text-[var(--gmart-muted)] hover:bg-[#fff5f6] hover:text-[var(--gmart-title)]"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[var(--gmart-muted)]"}`} />
            <span className="flex-1 truncate">{item.fullLabel}</span>
            {item.badge === "flags" && <FlagBadge />}
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
