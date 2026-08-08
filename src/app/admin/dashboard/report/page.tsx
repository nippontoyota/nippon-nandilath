import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const sp = await searchParams;
  const fromDateParam = typeof sp.fromDate === "string" ? sp.fromDate : null;
  const toDateParam = typeof sp.toDate === "string" ? sp.toDate : null;

  const whereClause: any = {};
  let dateTitle = "All Time";

  if (fromDateParam || toDateParam) {
    whereClause.createdAt = {};
    const fromStr = fromDateParam ? new Date(fromDateParam).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
    const toStr = toDateParam ? new Date(toDateParam).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

    if (fromDateParam && toDateParam) {
      if (fromDateParam === toDateParam) {
        dateTitle = fromStr;
      } else {
        dateTitle = `${fromStr} to ${toStr}`;
      }
    } else if (fromDateParam) {
      dateTitle = `From ${fromStr}`;
    } else if (toDateParam) {
      dateTitle = `Up to ${toStr}`;
    }

    if (fromDateParam) {
      whereClause.createdAt.gte = new Date(`${fromDateParam}T00:00:00.000+05:30`);
    }
    if (toDateParam) {
      whereClause.createdAt.lte = new Date(`${toDateParam}T23:59:59.999+05:30`);
    }
  }

  const groupedOutcomes = await prisma.entry.groupBy({
    by: ['callStatus', 'callOutcome'],
    where: whereClause,
    _count: { id: true },
  });

  let totalConnected = 0;
  let totalDisconnected = 0;
  let totalPending = 0;

  const connectedBreakdown: Record<string, number> = {};
  const disconnectedBreakdown: Record<string, number> = {};

  groupedOutcomes.forEach((group) => {
    const count = group._count.id;
    if (group.callStatus === 'Connected') {
      totalConnected += count;
      if (group.callOutcome) {
        connectedBreakdown[group.callOutcome] = count;
      }
    } else if (group.callStatus === 'Not Connected') {
      totalDisconnected += count;
      if (group.callOutcome) {
        disconnectedBreakdown[group.callOutcome] = count;
      }
    } else {
      totalPending += count;
    }
  });

  // Build rows array for the grouped table layout
  const rows: { status: string; outcome: string; count: number; isSubtotal?: boolean; isTotal?: boolean; colorClass?: string }[] = [];

  // Connected Rows
  if (totalConnected > 0) {
    Object.keys(connectedBreakdown).sort().forEach(outcome => {
      rows.push({ status: "Connected", outcome, count: connectedBreakdown[outcome] });
    });
  }
  rows.push({ status: "Total Connected", outcome: "", count: totalConnected, isSubtotal: true, colorClass: "text-green-700 bg-green-50/50" });

  // Not Connected Rows
  if (totalDisconnected > 0) {
    Object.keys(disconnectedBreakdown).sort().forEach(outcome => {
      rows.push({ status: "Not Connected", outcome, count: disconnectedBreakdown[outcome] });
    });
  }
  rows.push({ status: "Total Not Connected", outcome: "", count: totalDisconnected, isSubtotal: true, colorClass: "text-red-700 bg-red-50/50" });

  // Pending Rows
  if (totalPending > 0) {
    rows.push({ status: "Pending", outcome: "Not Called Yet", count: totalPending });
  }
  rows.push({ status: "Total Pending", outcome: "", count: totalPending, isSubtotal: true, colorClass: "text-yellow-700 bg-yellow-50/50" });

  const grandTotal = totalConnected + totalDisconnected + totalPending;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white -m-4 sm:-m-6 md:-m-8 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Daily Report Overview
        </h1>
        <a 
          href={`/admin/dashboard${session.role === "call_center" ? "/entries" : ""}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--gmart-title)] bg-white border border-[var(--gmart-border)] rounded-md hover:bg-[#fafafa]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          {dateTitle}
        </h2>
        
        <div className="overflow-x-auto flex justify-center">
          <table className="w-full max-w-2xl border-collapse text-sm text-left text-gray-700 bg-white">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-[#eef6ff] px-4 py-3 font-semibold text-gray-900 w-1/3">
                  Call Status
                </th>
                <th className="border border-gray-300 bg-[#eef6ff] px-4 py-3 font-semibold text-gray-900">
                  Breakdown (Outcome)
                </th>
                <th className="border border-gray-300 bg-[#eef6ff] px-4 py-3 font-semibold text-gray-900 text-right w-32">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                if (row.isSubtotal) {
                  return (
                    <tr key={`subtotal-${i}`} className={`font-semibold ${row.colorClass || "bg-gray-50 text-gray-900"}`}>
                      <td className="border border-gray-300 px-4 py-2" colSpan={2}>
                        {row.status}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        {row.count}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={`row-${i}`}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {row.status}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-600">
                      {row.outcome}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                      {row.count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-white font-bold text-gray-900 text-base">
                <td className="border border-gray-400 border-t-2 px-4 py-3" colSpan={2}>
                  TOTAL
                </td>
                <td className="border border-gray-400 border-t-2 px-4 py-3 text-right">
                  {grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
