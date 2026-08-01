import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { DeleteEntryButton } from "@/components/admin/DeleteEntryButton";
import { ExcludeEntryButton } from "@/components/admin/ExcludeEntryButton";
import { EntriesSearch } from "@/components/admin/EntriesSearch";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

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
          { vin: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [branches, entries, totalEntries, flaggedCount] = await Promise.all([
    prisma.branch.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.entry.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        phone: true,
        vin: true,
        flag: true,
        excluded: true,
        createdAt: true,
        branchId: true,
        model: { select: { name: true } },
        colour: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.entry.count({ where: whereClause }),
    prisma.entry.count({ where: { flag: { not: null } } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));

  const groups = branches
    .map((branch) => ({
      branch,
      entries: entries.filter((e) => e.branchId === branch.id),
    }))
    .filter((group) => group.entries.length > 0);

  const pageHref = (p: number) =>
    `?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Entries</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Review submissions, exclude fraud suspects from the draw, or delete invalid entries.
            {flaggedCount > 0 && (
              <span className="text-red-700 font-medium">
                {" "}
                {flaggedCount} flagged for review.
              </span>
            )}
          </p>
        </div>
        <a
          href="/api/export?type=entries"
          className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 text-sm font-medium transition-colors shrink-0 self-start"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1 sm:max-w-md min-w-0">
          <EntriesSearch initialSearch={search} />
        </div>
        <p className="text-sm text-gray-500 shrink-0">
          {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
          {search ? " matching" : ""}
        </p>
      </div>

      {groups.length === 0 && search && (
        <div className="text-center py-14 text-sm text-gray-600 bg-white rounded-xl border border-dashed border-gray-300">
          No entries match &quot;{search}&quot;.
        </div>
      )}

      {groups.length === 0 && !search && (
        <div className="text-center py-14 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-sm font-medium text-gray-900">No entries yet</p>
          <p className="text-sm text-gray-600 mt-1">
            Entries appear here when customers submit the lucky draw form.
          </p>
        </div>
      )}

      {groups.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">Participant</th>
                  <th className="px-4 py-3 font-medium">Ticket</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Flags</th>
                  <th className="px-4 py-3 font-medium">Draw status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              {groups.map((group) => (
                <tbody key={group.branch.id} className="group/branch divide-y divide-gray-100">
                  <tr className="bg-gray-50">
                    <td
                      colSpan={6}
                      className="px-4 py-2 text-xs font-semibold text-gray-900 border-t border-gray-200 group-first/branch:border-t-0"
                    >
                      <span className="truncate inline-block max-w-full align-bottom">
                        {group.branch.name}
                      </span>
                      <span className="text-gray-500 font-normal ml-2">
                        {group.entries.length} on this page
                      </span>
                    </td>
                  </tr>
                  {group.entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                        No entries for this branch yet.
                      </td>
                    </tr>
                  ) : (
                    group.entries.map((entry) => {
                      const flags = parseFlags(entry.flag);
                      return (
                        <tr
                          key={entry.id}
                          className={`transition-colors hover:bg-gray-50/80 ${
                            entry.excluded ? "bg-gray-50/60" : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-3 min-w-0 max-w-[180px]">
                            <div
                              className={`font-medium truncate ${entry.excluded ? "text-gray-500" : "text-gray-900"}`}
                              title={entry.name}
                            >
                              {entry.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 truncate">{entry.phone}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-mono text-xs text-gray-900">
                              {entry.id.slice(0, 8).toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {format(entry.createdAt, "MMM d, h:mm a")}
                            </div>
                          </td>
                          <td className="px-4 py-3 min-w-0 max-w-[200px]">
                            <div
                              className="text-gray-900 truncate"
                              title={`${entry.model.name} · ${entry.colour.name}`}
                            >
                              {entry.model.name}
                              <span className="text-gray-400 mx-1">·</span>
                              {entry.colour.name}
                            </div>
                            <div className="font-mono text-xs text-gray-500 mt-0.5 truncate" title={entry.vin}>
                              {entry.vin}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {flags.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[160px]">
                                {flags.map((f) => (
                                  <span
                                    key={f}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100 capitalize"
                                    title={f.replace(/_/g, " ")}
                                  >
                                    {f.replace(/_/g, " ")}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {entry.excluded ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                Excluded
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
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
                    })
                  )}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {page > 1 ? (
            <a
              href={pageHref(page - 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-100 rounded-lg cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </span>
          )}
          <span className="text-sm text-gray-600 px-2">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <a
              href={pageHref(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-100 rounded-lg cursor-not-allowed">
              Next
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
