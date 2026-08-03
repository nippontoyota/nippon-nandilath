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
      customerLocation: true,
      interestedInPurchase: true,
      model: { select: { name: true } },
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
        modelName={entry.model?.name || "None"}
        customerLocation={entry.customerLocation}
        interestedInPurchase={entry.interestedInPurchase}
      />
    </main>
  );
}
