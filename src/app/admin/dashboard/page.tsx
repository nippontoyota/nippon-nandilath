import { prisma } from "@/lib/prisma";
import { BranchDrawCard } from "@/components/admin/BranchDrawCard";
import { Download, Trophy } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [branches, winners] = await Promise.all([
    prisma.branch.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.winner.findMany({
      select: {
        id: true,
        place: true,
        branchId: true,
        entry: {
          select: {
            id: true,
            name: true,
            phone: true,
            vin: true,
            model: { select: { name: true } },
            colour: { select: { name: true } },
          },
        },
      },
      orderBy: [
        { branch: { name: "asc" } },
        { place: "asc" },
      ],
    }),
  ]);

  const winnersByBranch = winners.reduce(
    (acc, winner) => {
      if (!acc[winner.branchId]) {
        acc[winner.branchId] = [];
      }
      acc[winner.branchId].push(winner);
      return acc;
    },
    {} as Record<string, typeof winners>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Draw Winners</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Draw 1st, 2nd, and 3rd place for each branch. Only active (non-excluded) entries are eligible.
          </p>
        </div>
        {winners.length > 0 && (
          <a
            href="/api/export?type=winners"
            className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg text-sm font-medium bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Export winners
          </a>
        )}
      </div>

      {branches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <Trophy className="mx-auto h-8 w-8 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-900">No branches yet</p>
          <p className="text-sm text-gray-600 mt-1 max-w-sm mx-auto">
            Create a branch first, then run the draw once entries come in.
          </p>
          <Link
            href="/admin/dashboard/branches"
            className="inline-flex mt-4 h-9 items-center px-3.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Go to Branches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {branches.map((branch) => (
            <BranchDrawCard
              key={branch.id}
              branch={branch}
              winners={winnersByBranch[branch.id] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
