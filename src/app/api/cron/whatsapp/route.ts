import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, DOUBLETICK_CONFIRM_TEMPLATE } from "@/lib/doubletick";

const CRON_SECRET = process.env.CRON_SECRET || "local_dev_cron_secret";


export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messagesToProcess = await prisma.whatsAppLog.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { status: "FAILED", retries: { lt: 3 } },
        ],
      },
      take: 20,
    });

    if (messagesToProcess.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: "No messages to process." });
    }

    const entryIds = messagesToProcess.map((m) => m.entryId);
    const entries = await prisma.entry.findMany({
      where: { id: { in: entryIds } },

    });
    const entryMap = new Map(entries.map((e) => [e.id, e]));

    let successCount = 0;
    let failCount = 0;

    for (const log of messagesToProcess) {
      try {
        const entry = entryMap.get(log.entryId);
        if (!entry) throw new Error("Associated entry not found");

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        // Template placeholders: {{1}} name, {{2}} confirmation URL
        const variables = {
          name: entry.name,
          confirmationUrl: `${appUrl}/confirmation/${entry.id}`,
        };
        await sendWhatsAppMessage(entry.phone, DOUBLETICK_CONFIRM_TEMPLATE, variables);

        await prisma.whatsAppLog.update({
          where: { id: log.id },
          data: { status: "SENT", error: null },
        });
        successCount++;

        await new Promise((r) => setTimeout(r, 200));
      } catch (error: unknown) {
        await prisma.whatsAppLog.update({
          where: { id: log.id },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Unknown error",
            retries: { increment: 1 },
          },
        });
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: messagesToProcess.length,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error("WhatsApp Cron Error:", error);
    return NextResponse.json({ error: "Failed to process WhatsApp queue." }, { status: 500 });
  }
}
