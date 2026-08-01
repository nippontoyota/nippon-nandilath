"use server";

import { after } from "next/server";
import { entrySchema, type EntryInput } from "@/schemas/entry";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { assessEntrySync, assessEntryDb } from "@/lib/fraud";
import { DEFAULT_ENTRY_BRANCH_ID } from "@/lib/entry-config";
import { sendWhatsAppMessage, DOUBLETICK_CONFIRM_TEMPLATE } from "@/lib/doubletick";

export async function submitEntry(data: EntryInput) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
  const userAgent = reqHeaders.get("user-agent") || "unknown";

  const validated = entrySchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid data provided." };
  }

  const { name, phone, modelId, colourId, vin, honeypot } = validated.data;
  const branchId = validated.data.branchId ?? DEFAULT_ENTRY_BRANCH_ID;
  const normalizedPhone = `+91${phone}`;

  if (honeypot) {
    return { error: "Spam detected." };
  }

  const syncFlags = assessEntrySync(validated.data);

  try {
    // One DB round-trip: uniqueness + branch/model/colour names + fraud
    const [branch, existingEntry, model, colour, dbFlags] = await Promise.all([
      prisma.branch.findUnique({
        where: { id: branchId },
        select: { id: true, name: true },
      }),
      prisma.entry.findFirst({
        where: { OR: [{ phone: normalizedPhone }, { vin }] },
        select: { phone: true, vin: true },
      }),
      prisma.model.findUnique({ where: { id: modelId }, select: { name: true } }),
      prisma.colour.findUnique({ where: { id: colourId }, select: { name: true } }),
      assessEntryDb(normalizedPhone, ip, branchId),
    ]);

    if (!branch) return { error: "Invalid branch selected." };
    if (!model || !colour) return { error: "Invalid vehicle selection." };

    if (existingEntry) {
      if (existingEntry.phone === normalizedPhone) {
        return { error: "This mobile number has already been registered." };
      }
      if (existingEntry.vin === vin) {
        return { error: "This VIN has already been registered." };
      }
    }

    const fraudFlags = [...syncFlags, ...dbFlags];

    // Single write on the critical path — WhatsApp log + send happen after response
    const entry = await prisma.entry.create({
      data: {
        name,
        phone: normalizedPhone,
        phoneRaw: phone,
        modelId,
        colourId,
        vin,
        branchId: branch.id,
        ip,
        userAgent,
        flag: fraudFlags.length > 0 ? JSON.stringify(fraudFlags) : null,
      },
      select: { id: true },
    });

    after(async () => {
      const log = await prisma.whatsAppLog.create({
        data: { status: "PENDING", entryId: entry.id },
        select: { id: true },
      });
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        await sendWhatsAppMessage(normalizedPhone, DOUBLETICK_CONFIRM_TEMPLATE, {
          name,
          branchName: branch.name,
          vehicle: `${model.name} (${colour.name})`,
          vin,
          confirmationUrl: `${appUrl}/confirmation/${entry.id}`,
        });
        await prisma.whatsAppLog.update({
          where: { id: log.id },
          data: { status: "SENT", error: null },
        });
      } catch (e) {
        console.error("Failed to send WhatsApp confirmation:", e);
        await prisma.whatsAppLog
          .update({
            where: { id: log.id },
            data: {
              status: "FAILED",
              error: e instanceof Error ? e.message : "Unknown error",
              retries: { increment: 1 },
            },
          })
          .catch(() => {});
      }
    });

    return { id: entry.id };
  } catch (error) {
    console.error("Submission error:", error);
    return { error: "Failed to submit entry. Please try again later." };
  }
}

export async function deleteEntry(id: string) {
  try {
    await prisma.$transaction([
      prisma.winner.deleteMany({ where: { entryId: id } }),
      prisma.whatsAppLog.deleteMany({ where: { entryId: id } }),
      prisma.entry.delete({ where: { id } }),
    ]);

    revalidatePath("/admin/dashboard/entries");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return { error: "Failed to delete entry. It might have related records." };
  }
}

export async function toggleExclude(entryId: string) {
  try {
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { excluded: true },
    });
    if (!entry) return { error: "Entry not found" };

    await prisma.entry.update({
      where: { id: entryId },
      data: { excluded: !entry.excluded },
    });

    revalidatePath("/admin/dashboard/entries");
    return { success: true, excluded: !entry.excluded };
  } catch (error) {
    console.error("Failed to toggle exclude:", error);
    return { error: "Failed to update entry." };
  }
}
