"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { CustomSelect, OUTCOMES, STATUS_COLORS } from "@/components/admin/CallStatusSelect";

export function EntriesSearch({
  initialSearch,
  initialStatus,
  initialOutcome,
  initialFromDate,
  initialToDate,
  isCallCenter = false,
}: {
  initialSearch: string;
  initialStatus: string;
  initialOutcome: string;
  initialFromDate: string;
  initialToDate: string;
  isCallCenter?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  
  const [statusValue, setStatusValue] = useState(initialStatus === "all" ? null : initialStatus);
  const [outcomeValue, setOutcomeValue] = useState(initialOutcome === "all" ? null : initialOutcome);
  const [fromDateValue, setFromDateValue] = useState(initialFromDate);
  const [toDateValue, setToDateValue] = useState(initialToDate);

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

    if (fromDateValue !== (params.get("fromDate") || "")) {
      if (fromDateValue) params.set("fromDate", fromDateValue);
      else params.delete("fromDate");
      changed = true;
    }

    if (toDateValue !== (params.get("toDate") || "")) {
      if (toDateValue) params.set("toDate", toDateValue);
      else params.delete("toDate");
      changed = true;
    }

    if (changed) {
      startTransition(() => {
        router.replace(`?${params.toString()}`);
      });
    }
  }, [debouncedSearch, statusValue, outcomeValue, fromDateValue, toDateValue, router, searchParams]);

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
      {isCallCenter && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="min-w-[130px] relative">
            <input
              type="date"
              value={fromDateValue}
              onChange={(e) => setFromDateValue(e.target.value)}
              onClick={(e) => {
                try {
                  if (e.currentTarget.showPicker) e.currentTarget.showPicker();
                } catch (err) {}
              }}
              className="w-full h-[42px] px-3 border border-[var(--gmart-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gmart-red)]/20 focus:border-[var(--gmart-red)] bg-white text-[var(--gmart-title)] cursor-pointer"
            />
            {!fromDateValue && (
              <div className="absolute inset-0 bg-white pointer-events-none flex items-center px-3 border border-[var(--gmart-border)] rounded-md">
                <span className="text-sm text-[var(--gmart-muted)]">From Date</span>
              </div>
            )}
          </div>
          <span className="text-[var(--gmart-muted)] text-sm font-medium">-</span>
          <div className="min-w-[130px] relative">
            <input
              type="date"
              value={toDateValue}
              onChange={(e) => setToDateValue(e.target.value)}
              onClick={(e) => {
                try {
                  if (e.currentTarget.showPicker) e.currentTarget.showPicker();
                } catch (err) {}
              }}
              className="w-full h-[42px] px-3 border border-[var(--gmart-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gmart-red)]/20 focus:border-[var(--gmart-red)] bg-white text-[var(--gmart-title)] cursor-pointer"
            />
            {!toDateValue && (
              <div className="absolute inset-0 bg-white pointer-events-none flex items-center px-3 border border-[var(--gmart-border)] rounded-md">
                <span className="text-sm text-[var(--gmart-muted)]">To Date</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative flex-1 min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-[var(--gmart-muted)]" />
        </div>
        <input
          type="text"
          placeholder="Search by name, phone, email or ticket id..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-[var(--gmart-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gmart-red)]/20 focus:border-[var(--gmart-red)] bg-white text-[var(--gmart-title)] placeholder:text-[var(--gmart-muted)]"
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

      {isPending && (
        <div className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-200">
           <div className="bg-white px-5 py-3 rounded-md shadow-lg border border-[var(--gmart-border)] flex items-center gap-3 animate-in fade-in zoom-in-95">
             <div className="w-5 h-5 border-2 border-gray-200 border-t-[var(--gmart-red)] rounded-full animate-spin" />
             <span className="text-sm font-medium text-[var(--gmart-title)]">Updating data...</span>
           </div>
        </div>
      )}

      {isCallCenter && (
        <div className="flex flex-wrap gap-2 shrink-0 pb-1 sm:pb-0 items-center relative z-10">
          <div className="w-[200px]">
            <CustomSelect
              value={statusValue}
              options={["All Status", "Connected", "Not Connected", "Pending"]}
              placeholder="All Status"
              onChange={(val) => handleStatusChange(val === "All Status" ? null : val)}
              disabled={false}
              colorMap={STATUS_COLORS}
              size="md"
            />
          </div>
          <div className="w-[200px]">
            <CustomSelect
              value={outcomeValue}
              options={availableOutcomes.length > 0 ? ["All Outcomes", ...availableOutcomes] : ["All Outcomes"]}
              placeholder="All Outcomes"
              onChange={(val) => setOutcomeValue(val === "All Outcomes" ? null : val)}
              disabled={availableOutcomes.length === 0}
              size="md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
