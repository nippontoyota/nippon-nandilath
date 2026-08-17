"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVisiblePages, pageHref } from "@/lib/pagination";

export function EntriesPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [optimisticPage, setOptimisticPage] = useOptimistic(currentPage);
  const query = searchParams.toString();
  const pages = getVisiblePages(optimisticPage, totalPages);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    if (page === optimisticPage || page < 1 || page > totalPages) return;
    startTransition(() => {
      setOptimisticPage(page);
      router.push(pageHref(query, page), { scroll: false });
    });
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center gap-1.5 bg-[var(--gmart-navy)] px-3 py-2.5"
    >
      {pages.map((token, i) =>
        token === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex h-9 min-w-6 items-center justify-center px-1 text-sm tracking-widest text-[#9aa3b2]"
            aria-hidden="true"
          >
            ..
          </span>
        ) : (
          <button
            key={token}
            type="button"
            aria-label={`Page ${token}`}
            aria-current={token === optimisticPage ? "page" : undefined}
            disabled={isPending && token !== optimisticPage}
            onClick={() => goTo(token)}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-[4px] px-2 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ba4d6]/80 active:scale-[0.98] disabled:cursor-wait",
              token === optimisticPage
                ? "border border-transparent bg-[#4a94c8] text-white"
                : "border border-[#9aa3b2] bg-transparent text-[#c5cad3] hover:border-[#c5cad3] hover:text-white",
            )}
          >
            {token}
          </button>
        ),
      )}

      <div className="relative ml-0.5 h-9 min-w-[3.25rem]">
        <select
          aria-label="Jump to page"
          value={optimisticPage}
          disabled={isPending}
          onChange={(e) => {
            const next = Number.parseInt(e.target.value, 10);
            if (!Number.isFinite(next)) return;
            goTo(next);
          }}
          className="h-9 w-full cursor-pointer appearance-none rounded-[4px] border border-[#9aa3b2] bg-transparent pl-2.5 pr-7 text-sm font-medium tabular-nums text-[#c5cad3] outline-none focus-visible:ring-2 focus-visible:ring-[#5ba4d6]/80 disabled:cursor-wait"
        >
          {pageNumbers.map((n) => (
            <option key={n} value={n} className="bg-[var(--gmart-navy)] text-white">
              {n}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9aa3b2]" />
      </div>

      {isPending && (
        <div className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-white px-5 py-3 rounded-md shadow-lg border border-[var(--gmart-border)] flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-[var(--gmart-red)] rounded-full animate-spin" />
            <span className="text-sm font-medium text-[var(--gmart-title)]">Loading page...</span>
          </div>
        </div>
      )}
    </nav>
  );
}
