import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSession } from "@/app/actions/auth";
import { EntriesSearch } from "@/components/admin/EntriesSearch";
import { EntriesTable } from "@/components/admin/EntriesTable";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function EntriesPage(props: {
  searchParams?: Promise<{ search?: string; page?: string; status?: string; outcome?: string }>;
}) {
  const session = await getSession();
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const statusFilter = searchParams?.status || "all";
  const outcomeFilter = searchParams?.outcome || "all";
  const dateFilter = searchParams?.date || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

  const whereClause: Prisma.EntryWhereInput = search
    ? {
        OR: [
          { id: { startsWith: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { customerLocation: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  if (statusFilter === "connected") {
    whereClause.callStatus = "Connected";
  } else if (statusFilter === "not_connected") {
    whereClause.callStatus = "Not Connected";
  } else if (statusFilter === "pending") {
    whereClause.callStatus = null;
  }

  if (outcomeFilter !== "all" && statusFilter !== "pending") {
    whereClause.callOutcome = outcomeFilter;
  }

  if (dateFilter) {
    // Treat the selected date as local time block for IST filtering
    const startDate = new Date(`${dateFilter}T00:00:00.000+05:30`);
    const endDate = new Date(`${dateFilter}T23:59:59.999+05:30`);
    whereClause.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  const [entries, totalEntries, flaggedCount, connectedCount, notConnectedCount] = await Promise.all([
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
        callRemark: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.entry.count({ where: whereClause }),
    prisma.entry.count({ where: { flag: { not: null } } }),
    prisma.entry.count({ where: { ...whereClause, callStatus: "Connected" } }),
    prisma.entry.count({ where: { ...whereClause, callStatus: "Not Connected" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", p.toString());
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (outcomeFilter !== "all") params.set("outcome", outcomeFilter);
    if (dateFilter) params.set("date", dateFilter);
    return `?${params.toString()}`;
  };

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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--gmart-border)] rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-[var(--gmart-muted)]">Total Leads</p>
          <p className="text-3xl font-bold text-[var(--gmart-title)] mt-1">{totalEntries}</p>
        </div>
        <div className="bg-[#f0faf4] border border-[#b7e4c7] rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-[var(--gmart-success)]">Connected</p>
          <p className="text-3xl font-bold text-[var(--gmart-success)] mt-1">{connectedCount}</p>
        </div>
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-amber-700">Not Connected</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{notConnectedCount}</p>
        </div>
        <div className="bg-gray-50 border border-[var(--gmart-border)] rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-gray-700 mt-1">{totalEntries - connectedCount - notConnectedCount}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center relative z-20">
        <div className="flex-1 w-full min-w-0">
          <EntriesSearch 
            initialSearch={search} 
            initialStatus={statusFilter} 
            initialOutcome={outcomeFilter} 
            initialDate={dateFilter} 
          />
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

      {entries.length > 0 && <EntriesTable entries={tableEntries} userRole={session?.role as string | undefined} offset={(page - 1) * PAGE_SIZE} />}

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
