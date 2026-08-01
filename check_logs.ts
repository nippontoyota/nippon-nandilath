import { prisma } from './src/lib/prisma';
import { sendWhatsAppMessage, DOUBLETICK_CONFIRM_TEMPLATE } from "./src/lib/doubletick";

async function main() {
  const messagesToProcess = await prisma.whatsAppLog.findMany({
    where: {
      OR: [
        { status: "PENDING" },
        { status: "FAILED", retries: { lt: 3 } },
      ],
    },
    take: 20,
  });

  console.log("Messages to process:", messagesToProcess.length);
  if (messagesToProcess.length === 0) return;

  const entryIds = messagesToProcess.map((m) => m.entryId);
  const entries = await prisma.entry.findMany({
    where: { id: { in: entryIds } },
    include: { branch: true, model: true, colour: true },
  });
  const entryMap = new Map(entries.map((e) => [e.id, e]));

  for (const log of messagesToProcess) {
    try {
      const entry = entryMap.get(log.entryId);
      if (!entry) throw new Error("Associated entry not found");

      const variables = {
        name: entry.name,
        branchName: entry.branch.name,
        vehicle: `${entry.model.name} (${entry.colour.name})`,
        vin: entry.vin,
        confirmationUrl: `http://localhost:3000/confirmation/${entry.id}`,
      };
      
      console.log(`Sending to ${entry.phone}...`);
      const res = await sendWhatsAppMessage(entry.phone, DOUBLETICK_CONFIRM_TEMPLATE, variables);
      console.log("Response:", res);

      await prisma.whatsAppLog.update({
        where: { id: log.id },
        data: { status: "SENT", error: null },
      });
      console.log("Updated to SENT");
    } catch (error: any) {
      console.error("Error for log", log.id, error.message);
      await prisma.whatsAppLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          error: error.message,
          retries: { increment: 1 },
        },
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
