import { prisma } from "@/lib/prisma";
import { EntryForm } from "@/components/forms/EntryForm";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function EnterPage() {
  const modelsData = await prisma.model.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  const models = modelsData.map((m) => ({
    id: m.id,
    name: m.name,
  }));

  return (
    <main className="min-h-screen bg-[#fbf9f8]">
      <EntryForm models={models} />
    </main>
  );
}
