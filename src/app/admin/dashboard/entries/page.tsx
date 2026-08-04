import { prisma } from "@/lib/prisma";
import { DeleteEntryButton } from "@/components/admin/DeleteEntryButton";
import { ExcludeEntryButton } from "@/components/admin/ExcludeEntryButton";
import { EntriesSearch } from "@/components/admin/EntriesSearch";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

function parseFlags(flag: string | null): string[] {
  if (!flag) return [];
  try {
    const parsed = JSON.parse(flag);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return [flag];
  }
}

export default async function EntriesPage(props: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

  const whereClause = search
    ? {
        OR: [
          { id: { startsWith: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { customerLocation: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [entries, totalEntries, flaggedCount] = await Promise.all([
    prisma.entry.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        customerLocation: true,

        flag: true,
        excluded: true,
        createdAt: true,

      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.entry.count({ where: whereClause }),
    prisma.entry.count({ where: { flag: { not: null } } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));

  const pageHref = (p: number) =>
    `?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="admin-section-rail min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--gmart-title)]">Entries</h1>
          <p className="text-sm text-[var(--gmart-muted)] mt-1 max-w-xl">
            Review submissions, exclude fraud suspects from the draw, or delete invalid entries.
            {flaggedCount > 0 && (
              <span className="text-[var(--gmart-red)] font-semibold">
                {" "}
                {flaggedCount} flagged for review.
              </span>
            )}
          </p>
        </div>
        <a
          href="/api/export?type=entries"
          className="admin-btn-secondary inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-md text-sm font-medium shrink-0 self-start"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1 sm:max-w-md min-w-0">
          <EntriesSearch initialSearch={search} />
        </div>
        <p className="text-sm text-[var(--gmart-muted)] shrink-0">
          {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
          {search ? " matching" : ""}
        </p>
      </div>

      {entries.length === 0 && search && (
        <div className="text-center py-14 text-sm text-[var(--gmart-muted)] admin-product-card border-dashed">
          No entries match &quot;{search}&quot;.
        </div>
      )}

      {entries.length === 0 && !search && (
        <div className="text-center py-14 admin-product-card border-dashed">
          <p className="text-sm font-medium text-[var(--gmart-title)]">No entries yet</p>
          <p className="text-sm text-[var(--gmart-muted)] mt-1">
            Entries appear here when customers submit the lucky draw form.
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="admin-product-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead className="bg-[var(--gmart-navy)] text-[var(--gmart-cream)] text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px]">Participant</th>
                  <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px]">Ticket</th>
                  <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px]">Address</th>
                  <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px]">Flags</th>
                  <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px]">Draw status</th>
                  <th className="px-4 py-3 font-semibold tracking-wide uppercase text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gmart-border)]">
                {entries.map((entry) => {
                  const flags = parseFlags(entry.flag);
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors hover:bg-[#fff5f6]/50 ${
                        entry.excluded ? "bg-[#fafafa]" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 min-w-0 max-w-[180px]">
                        <div
                          className={`font-medium truncate ${entry.excluded ? "text-[var(--gmart-muted)]" : "text-[var(--gmart-title)]"}`}
                          title={entry.name}
                        >
                          {entry.name}
                        </div>
                        <div className="text-xs text-[var(--gmart-muted)] mt-0.5 truncate">{entry.phone}</div>
                        {entry.email && (
                          <div className="text-xs text-[var(--gmart-muted)]/80 mt-0.5 truncate">{entry.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono text-xs text-[var(--gmart-title)]">
                          {entry.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-xs text-[var(--gmart-muted)] mt-0.5">
                          {dateFormatter.format(entry.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 min-w-0 max-w-[200px]">
                        <div
                          className="text-[var(--gmart-title)] truncate"
                          title={entry.customerLocation}
                        >
                          {entry.customerLocation}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {flags.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {flags.map((f) => (
                              <span
                                key={f}
                                className="admin-sale-badge capitalize"
                                title={f.replace(/_/g, " ")}
                              >
                                {f.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--gmart-border)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {entry.excluded ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-[#f3f3f3] text-[var(--gmart-muted)] border border-[var(--gmart-border)]">
                            Excluded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-[#f0faf4] text-[var(--gmart-success)] border border-[#b7e4c7]">
                            In draw
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <ExcludeEntryButton id={entry.id} excluded={entry.excluded} />
                          <DeleteEntryButton id={entry.id} name={entry.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {page > 1 ? (
            <a
              href={pageHref(page - 1)}
              className="admin-btn-secondary inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--gmart-border)] bg-white border border-[var(--gmart-border)] rounded-md cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </span>
          )}
          <span className="text-sm text-[var(--gmart-muted)] px-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <a
              href={pageHref(page + 1)}
              className="admin-btn-secondary inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--gmart-border)] bg-white border border-[var(--gmart-border)] rounded-md cursor-not-allowed">
              Next
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
