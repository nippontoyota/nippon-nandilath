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
    }
  });

  const allOutcomes = Array.from(new Set([
    ...Object.keys(connectedBreakdown),
    ...Object.keys(disconnectedBreakdown)
  ])).sort();

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
          Nippon-Nandilath Lucky Draw Pivot - {dateStr}
        </h2>
        
        <div className="overflow-x-auto flex justify-center">
          <table className="w-full max-w-2xl border-collapse text-sm text-left text-gray-700 bg-white">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-[#eef6ff] px-4 py-3 font-semibold text-gray-900 w-1/3 text-center">
                  Call Outcome
                </th>
                <th className="border border-gray-300 bg-[#eef6ff] px-4 py-3 font-semibold text-gray-900 text-center">
                  Connected
                </th>
                <th className="border border-gray-300 bg-[#eef6ff] px-4 py-3 font-semibold text-gray-900 text-center">
                  Not Connected
                </th>
                <th className="border border-gray-300 bg-[#eef6ff] px-4 py-3 font-semibold text-gray-900 text-center">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {allOutcomes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500 italic">
                    No call outcomes recorded for this date.
                  </td>
                </tr>
              ) : (
                allOutcomes.map((outcome) => {
                  const conn = connectedBreakdown[outcome] || 0;
                  const notConn = disconnectedBreakdown[outcome] || 0;
                  return (
                    <tr key={outcome}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {outcome}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {conn}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {notConn}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                        {conn + notConn}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {allOutcomes.length > 0 && (
              <tfoot>
                <tr className="bg-white font-bold text-gray-900">
                  <td className="border border-gray-300 px-4 py-3">
                    Grand Total
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {totalConnected}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {totalDisconnected}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {totalConnected + totalDisconnected}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
