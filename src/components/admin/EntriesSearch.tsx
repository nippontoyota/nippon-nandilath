"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";

export function EntriesSearch({
  initialSearch,
  initialStatus,
}: {
  initialSearch: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const [statusValue, setStatusValue] = useState(initialStatus);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    const currentQuery = searchParams.toString();
    const params = new URLSearchParams(currentQuery);

    let changed = false;

    if (debouncedSearch !== (params.get("search") || "")) {
      if (debouncedSearch) params.set("search", debouncedSearch);
      else params.delete("search");
      changed = true;
    }

    if (statusValue !== (params.get("status") || "all")) {
      if (statusValue !== "all") params.set("status", statusValue);
      else params.delete("status");
      changed = true;
    }

    if (changed) {
      params.delete("page");
      startTransition(() => {
        router.replace(`?${params.toString()}`);
      });
    }
  }, [debouncedSearch, statusValue, router, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full pl-10 pr-10 py-2.5 border border-[var(--gmart-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gmart-red)]/20 focus:border-[var(--gmart-red)] bg-white text-[var(--gmart-title)] placeholder:text-[var(--gmart-muted)] shadow-sm"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => setSearchValue("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isPending && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        )}
      </div>

      <div className="relative shrink-0 sm:w-[180px]">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Filter className="w-4 h-4 text-gray-400" />
        </div>
        <select
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 appearance-none border border-[var(--gmart-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gmart-red)]/20 focus:border-[var(--gmart-red)] bg-white text-[var(--gmart-title)] cursor-pointer shadow-sm"
        >
          <option value="all">All Call Status</option>
          <option value="connected">Connected</option>
          <option value="not_connected">Not Connected</option>
          <option value="pending">Pending</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" />
          </svg>
        </div>
      </div>
    </div>
  );
}
