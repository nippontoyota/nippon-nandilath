"use client";

import { useSearchParams } from "next/navigation";

export function ExportButton() {
  const searchParams = useSearchParams();

  // Reconstruct the current URL query parameters to forward to the export API
  const query = searchParams ? searchParams.toString() : "";
  const href = `/api/export?type=entries${query ? `&${query}` : ""}`;

  return (
    <a
      href={href}
      className="hidden sm:inline-flex items-center justify-center gap-2 h-8 px-3 rounded-md text-xs font-medium bg-white border border-[var(--gmart-border)] text-[var(--gmart-title)] hover:bg-[#fafafa] hover:text-[var(--gmart-red)] transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </svg>
      Download Table in Excel
    </a>
  );
}
