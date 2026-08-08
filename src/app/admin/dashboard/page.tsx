import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { DrawCard } from "@/components/admin/DrawCard";
import { UniversalQrCard } from "@/components/admin/UniversalQrCard";
import { ENTRY_FORM_URL } from "@/lib/entry-config";
import { Download } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (session?.role === "call_center") {
    redirect("/admin/dashboard/entries");
  }

  const [winner, eligibleCount] = await Promise.all([
    prisma.winner.findFirst({
      select: {
        id: true,
        place: true,
        entry: {
          select: {
            id: true,
            name: true,
            phone: true,
            customerLocation: true,

          },
        },
      },
      orderBy: { place: "asc" },
    }),
    prisma.entry.count({
      where: { excluded: false, winner: null },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="admin-section-rail min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--gmart-title)]">Draw Winner</h1>
          <p className="text-sm text-[var(--gmart-muted)] mt-1 max-w-xl">
            Draw one winner for Nippon Toyota. Only active (non-excluded) entries are eligible.
          </p>
        </div>
        {winner && (
          <a
            href="/api/export?type=winners"
            className="admin-btn-secondary inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-md text-sm font-medium shrink-0"
          >
            <Download className="w-4 h-4" />
            Export winner
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
        <DrawCard winner={winner} eligibleCount={eligibleCount} />
        <UniversalQrCard entryUrl={ENTRY_FORM_URL} />
      </div>
    </div>
  );
}
