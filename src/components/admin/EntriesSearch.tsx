"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { CustomSelect, OUTCOMES, STATUS_COLORS } from "@/components/admin/CallStatusSelect";

export function EntriesSearch({
  initialSearch,
  initialStatus,
  initialOutcome,
  initialDate,
}: {
  initialSearch: string;
  initialStatus: string;
  initialOutcome: string;
  initialDate: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const [statusValue, setStatusValue] = useState(initialStatus === "all" ? null : initialStatus);
  const [outcomeValue, setOutcomeValue] = useState(initialOutcome === "all" ? null : initialOutcome);
  const [dateValue, setDateValue] = useState(initialDate);

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

    const currentStatusUrl = params.get("status") || "all";
    const targetStatusUrl = statusValue || "all";
    if (currentStatusUrl !== targetStatusUrl) {
      if (targetStatusUrl !== "all") params.set("status", targetStatusUrl);
      else params.delete("status");
      changed = true;
    }

    const currentOutcomeUrl = params.get("outcome") || "all";
    const targetOutcomeUrl = outcomeValue || "all";
    if (currentOutcomeUrl !== targetOutcomeUrl) {
      if (targetOutcomeUrl !== "all") params.set("outcome", targetOutcomeUrl);
      else params.delete("outcome");
      changed = true;
    }

    if (dateValue !== (params.get("date") || "")) {
      if (dateValue) params.set("date", dateValue);
      else params.delete("date");
      changed = true;
    }

    if (changed) {
      startTransition(() => {
        router.replace(`?${params.toString()}`);
      });
    }
  }, [debouncedSearch, statusValue, outcomeValue, dateValue, router, searchParams]);

  const handleStatusChange = (val: string | null) => {
    setStatusValue(val);
    if (!val || val === "Pending") {
      setOutcomeValue(null);
    } else {
      const validOutcomes = OUTCOMES[val as keyof typeof OUTCOMES] || [];
      if (outcomeValue && !validOutcomes.includes(outcomeValue)) {
        setOutcomeValue(null);
      }
    }
  };

  const availableOutcomes = statusValue && statusValue !== "Pending" 
    ? OUTCOMES[statusValue as keyof typeof OUTCOMES] || [] 
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-3 w-full">
      <div className="min-w-[130px] relative shrink-0">
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          onClick={(e) => {
            try {
              if (e.currentTarget.showPicker) {
                e.currentTarget.showPicker();
              }
            } catch (err) {
              // ignore if not supported or already open
            }
          }}
          className="w-full h-[42px] px-3 border border-[var(--gmart-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gmart-red)]/20 focus:border-[var(--gmart-red)] bg-white text-[var(--gmart-title)] shadow-sm cursor-pointer"
        />
        {!dateValue && (
          <div className="absolute inset-0 bg-white pointer-events-none flex items-center px-3 border border-[var(--gmart-border)] rounded-md shadow-sm">
            <span className="text-sm text-[var(--gmart-muted)]">Date Filter</span>
          </div>
        )}
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gmart-muted)] pointer-events-none" />
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gmart-muted)] hover:text-[var(--gmart-red)]"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isPending && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[var(--gmart-border)] border-t-[var(--gmart-red)] rounded-full animate-spin" />
        )}
      </div>

      <div className="flex flex-wrap gap-2 shrink-0 pb-1 sm:pb-0 items-center relative z-10">
        <div className="min-w-[180px]">
          <CustomSelect
            value={statusValue}
            options={["All Status", "Connected", "Not Connected", "Pending"]}
            placeholder="All Status"
            onChange={(val) => handleStatusChange(val === "All Status" ? null : val)}
            disabled={false}
            colorMap={STATUS_COLORS}
          />
        </div>
        <div className="min-w-[180px]">
          <CustomSelect
            value={outcomeValue}
            options={availableOutcomes.length > 0 ? ["All Outcomes", ...availableOutcomes] : ["All Outcomes"]}
            placeholder="All Outcomes"
            onChange={(val) => setOutcomeValue(val === "All Outcomes" ? null : val)}
            disabled={availableOutcomes.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
