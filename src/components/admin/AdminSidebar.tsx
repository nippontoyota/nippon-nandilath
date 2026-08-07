"use client";

import { useState } from "react";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { CAMPAIGN_NAME } from "@/lib/brand";
import { logout } from "@/app/actions/auth";

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`bg-[var(--gmart-surface)] border-r border-[var(--gmart-border)] flex-col hidden md:flex shrink-0 transition-all duration-300 ease-in-out relative ${isCollapsed ? "w-16" : "w-60"}`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 z-10 w-6 h-6 bg-white border border-[var(--gmart-border)] rounded-full flex items-center justify-center text-[var(--gmart-muted)] hover:text-[var(--gmart-red)] hover:border-[var(--gmart-red)] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gmart-red)]/20"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
      </button>

      <div className="border-b border-[var(--gmart-border)] overflow-hidden">
        <div className="h-1 w-full bg-[var(--gmart-red)]" />
        <div className={`h-14 flex items-center px-4 transition-all ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
          <img
            src="https://dealer.toyotabharat.com/dealerV11/images/common/favicon.ico"
            alt=""
            className="w-5 h-5 shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-300">
              <p className="text-sm font-semibold text-[var(--gmart-title)] truncate leading-tight">
                Nippon Toyota
              </p>
              <p className="text-[11px] text-[var(--gmart-muted)] leading-tight truncate">
                {CAMPAIGN_NAME}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className={`bg-[var(--gmart-navy)] py-2 transition-all overflow-hidden ${isCollapsed ? "px-0 text-center" : "px-5"}`}>
        {!isCollapsed ? (
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[var(--gmart-cream)] whitespace-nowrap">
            Admin menu
          </p>
        ) : (
          <div className="h-[15px]" /> /* Spacer to match height */
        )}
      </div>
      
      <AdminNav isCollapsed={isCollapsed} />
      
      <div className="p-3 border-t border-[var(--gmart-border)] overflow-hidden flex-shrink-0">
        <form action={logout}>
          <button
            type="submit"
            className={`flex items-center rounded-md text-sm font-medium text-[var(--gmart-muted)] hover:bg-[#fff5f6] hover:text-[var(--gmart-red)] transition-colors ${
              isCollapsed ? "justify-center w-10 h-10 mx-auto p-0" : "gap-2.5 px-3 py-2 w-full text-left"
            }`}
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0 opacity-70" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
