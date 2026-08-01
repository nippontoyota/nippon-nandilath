import { prisma } from "@/lib/prisma";
import { ModelsClient } from "@/components/admin/ModelsClient";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await prisma.model.findMany({
    include: { colours: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Models & colours</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-xl">
          These options appear on the customer entry form. Expand a model to manage its colours.
        </p>
      </div>

      <ModelsClient initialModels={models} />
    </div>
  );
}
