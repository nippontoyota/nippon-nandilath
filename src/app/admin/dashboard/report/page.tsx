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

  // Await searchParams as required in Next.js 15
  const sp = await searchParams;
  const dateParam = typeof sp.date === "string" ? sp.date : null;
  
  const reportDate = dateParam ? new Date(dateParam) : new Date();
  
  // Format for display
  const dateStr = reportDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Calculate local timezone bounds to ensure accurate filtering
  const localIsoDate = new Date(reportDate.getTime() - (reportDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
  const startDate = new Date(`${localIsoDate}T00:00:00.000+05:30`);
  const endDate = new Date(`${localIsoDate}T23:59:59.999+05:30`);

  const whereClause = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

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
  rows.push({ status: "Connected Subtotal", outcome: "", count: totalConnected, isSubtotal: true, colorClass: "text-green-700 bg-green-50/50" });

  // Not Connected Rows
  if (totalDisconnected > 0) {
    Object.keys(disconnectedBreakdown).sort().forEach(outcome => {
      rows.push({ status: "Not Connected", outcome, count: disconnectedBreakdown[outcome] });
    });
  }
  rows.push({ status: "Not Connected Subtotal", outcome: "", count: totalDisconnected, isSubtotal: true, colorClass: "text-red-700 bg-red-50/50" });

  // Pending Rows
  if (totalPending > 0) {
    rows.push({ status: "Pending", outcome: "Not Called Yet", count: totalPending });
  }
  rows.push({ status: "Pending Subtotal", outcome: "", count: totalPending, isSubtotal: true, colorClass: "text-yellow-700 bg-yellow-50/50" });

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
          {dateStr}
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
                  GRAND TOTAL
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
