import { prisma } from "@/lib/prisma";
import { BranchesClient } from "@/components/admin/BranchesClient";
import { UniversalQrCard } from "@/components/admin/UniversalQrCard";
import { ENTRY_FORM_URL } from "@/lib/entry-config";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Branches</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-xl">
          Manage dealership locations. Use the universal QR code below for all walk-in entries.
        </p>
      </div>

      <UniversalQrCard entryUrl={ENTRY_FORM_URL} />

      <BranchesClient branches={branches} />
    </div>
  );
}
