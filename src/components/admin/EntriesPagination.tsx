"use client";

import Link from "next/link";
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
  const query = searchParams.toString();
  const pages = getVisiblePages(currentPage, totalPages);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

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
          <Link
            key={token}
            href={pageHref(query, token)}
            aria-label={`Page ${token}`}
            aria-current={token === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-[4px] px-2 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ba4d6]/80 active:scale-[0.98]",
              token === currentPage
                ? "border border-transparent bg-[#4a94c8] text-white"
                : "border border-[#9aa3b2] bg-transparent text-[#c5cad3] hover:border-[#c5cad3] hover:text-white",
            )}
          >
            {token}
          </Link>
        ),
      )}

      <div className="relative ml-0.5 h-9 min-w-[3.25rem]">
        <select
          aria-label="Jump to page"
          value={currentPage}
          onChange={(e) => {
            const next = Number.parseInt(e.target.value, 10);
            if (!Number.isFinite(next)) return;
            router.push(pageHref(query, next));
          }}
          className="h-9 w-full cursor-pointer appearance-none rounded-[4px] border border-[#9aa3b2] bg-transparent pl-2.5 pr-7 text-sm font-medium tabular-nums text-[#c5cad3] outline-none focus-visible:ring-2 focus-visible:ring-[#5ba4d6]/80"
        >
          {pageNumbers.map((n) => (
            <option key={n} value={n} className="bg-[var(--gmart-navy)] text-white">
              {n}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9aa3b2]" />
      </div>
    </nav>
  );
}
