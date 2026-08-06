"use server";

import { after } from "next/server";
import { entrySchema, type EntryInput } from "@/schemas/entry";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { assessEntrySync, assessEntryDb } from "@/lib/fraud";
import { isAuthenticated } from "./auth";
import { sendWhatsAppMessage, DOUBLETICK_CONFIRM_TEMPLATE } from "@/lib/doubletick";

export async function submitEntry(data: EntryInput) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
  const userAgent = reqHeaders.get("user-agent") || "unknown";

  const deadline = new Date("2026-09-30T23:59:59+05:30");
  if (new Date() > deadline) {
    return { error: "The lucky draw entry period has officially closed." };
  }

  const validated = entrySchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid data provided." };
  }

  const { name, phone, email, address, honeypot } = validated.data;
  const normalizedPhone = `+91${phone}`;
  
  const combinedAddress = address ? address.trim() : "Not provided";

  if (honeypot) {
    return { error: "Spam detected." };
  }

  const syncFlags = assessEntrySync(validated.data);

  try {
    const [existingEntry, dbFlags] = await Promise.all([
      prisma.entry.findFirst({
        where: { OR: [{ phone: normalizedPhone }] },
        select: { phone: true },
      }),
      assessEntryDb(normalizedPhone, ip),
    ]);

    if (existingEntry) {
      if (existingEntry.phone === normalizedPhone) {
        return { error: "This mobile number has already been registered." };
      }
    }

    const fraudFlags = [...syncFlags, ...dbFlags];

    const entry = await prisma.entry.create({
      data: {
        name,
        phone: normalizedPhone,
        phoneRaw: phone,
        email: email || null,
        customerLocation: combinedAddress,

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
        // Template placeholders: {{1}} name, {{2}} confirmation URL
        await sendWhatsAppMessage(normalizedPhone, DOUBLETICK_CONFIRM_TEMPLATE, {
          name,
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
  if (!(await isAuthenticated())) return { error: "Unauthorized" };

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
  if (!(await isAuthenticated())) return { error: "Unauthorized" };

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

export async function updateCallStatus(entryId: string, callStatus: string | null, callOutcome: string | null) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };

  try {
    await prisma.entry.update({
      where: { id: entryId },
      data: { callStatus, callOutcome },
    });
    revalidatePath("/admin/dashboard/entries");
    return { success: true };
  } catch (error) {
    console.error("Failed to update call status:", error);
    return { error: "Failed to update entry." };
  }
}
