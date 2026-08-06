import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { EntriesSearch } from "@/components/admin/EntriesSearch";
import { EntriesTable } from "@/components/admin/EntriesTable";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function EntriesPage(props: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  const session = await getSession();
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
        flagReason: true,
        excluded: true,
        callStatus: true,
        callOutcome: true,
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

  const tableEntries = entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  }));

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

      {entries.length > 0 && <EntriesTable entries={tableEntries} userRole={session?.role} />}

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
