import { prisma } from "@/lib/prisma";
import { ModelsClient } from "@/components/admin/ModelsClient";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await prisma.model.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Models</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-xl">
          These vehicle options appear on the customer entry form.
        </p>
      </div>

      <ModelsClient initialModels={models} />
    </div>
  );
}
