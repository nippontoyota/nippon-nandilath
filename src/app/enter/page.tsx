import { prisma } from "@/lib/prisma";
import { EntryForm } from "@/components/forms/EntryForm";
import { DEFAULT_ENTRY_BRANCH_ID } from "@/lib/entry-config";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function EnterPage() {
  const modelsData = await prisma.model.findMany({
    select: {
      id: true,
      name: true,
      colours: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  const models = modelsData.map((m) => ({
    id: m.id,
    name: m.name,
    colours: m.colours,
  }));

  return (
    <main className="min-h-screen bg-[#fbf9f8]">
      <EntryForm branchId={DEFAULT_ENTRY_BRANCH_ID} models={models} />
    </main>
  );
}
