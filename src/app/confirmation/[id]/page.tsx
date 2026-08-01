import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfirmationScreen } from "@/components/forms/ConfirmationScreen";

export default async function ConfirmationPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  const entry = await prisma.entry.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      vin: true,
      branch: { select: { name: true } },
      model: { select: { name: true } },
      colour: { select: { name: true } },
    },
  });

  if (!entry) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fbf9f8]">
      <ConfirmationScreen
        entryId={entry.id}
        name={entry.name}
        branchName={entry.branch.name}
        modelName={entry.model.name}
        colourName={entry.colour.name}
        vin={entry.vin}
      />
    </main>
  );
}
