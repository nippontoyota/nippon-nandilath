import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSession } from "@/app/actions/auth";
import { EntriesSearch } from "@/components/admin/EntriesSearch";
import { EntriesTable } from "@/components/admin/EntriesTable";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EntriesPage(props: {
  searchParams?: Promise<{ search?: string; page?: string; status?: string; outcome?: string }>;
}) {
  const session = await getSession();
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const statusFilter = searchParams?.status || "all";
  const outcomeFilter = searchParams?.outcome || "all";
  const dateFilter = searchParams?.date || "";

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

  const [entries, totalEntries, connectedCount, notConnectedCount] = await Promise.all([
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
    }),
    prisma.entry.count({ where: whereClause }),
    prisma.entry.count({ where: { ...whereClause, callStatus: "Connected" } }),
    prisma.entry.count({ where: { ...whereClause, callStatus: "Not Connected" } }),
  ]);

  const tableEntries = entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--gmart-border)] rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-[var(--gmart-muted)]">Total Leads</p>
          <p className="text-3xl font-bold text-[var(--gmart-title)] mt-1">{totalEntries}</p>
        </div>
        <div className="bg-green-100 border border-green-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-green-800">Connected</p>
          <p className="text-3xl font-bold text-green-800 mt-1">{connectedCount}</p>
        </div>
        <div className="bg-amber-100 border border-amber-200 rounded-xl p-5 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-amber-800">Not Connected</p>
          <p className="text-3xl font-bold text-amber-800 mt-1">{notConnectedCount}</p>
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

      {entries.length > 0 && <EntriesTable entries={tableEntries} userRole={session?.role as string | undefined} offset={0} />}
    </div>
  );
}
