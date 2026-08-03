"use server";

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "./auth";
import { revalidatePath } from "next/cache";

export async function drawWinner() {
  if (!(await isAuthenticated())) {
    return { error: "Unauthorized" };
  }

  const existing = await prisma.winner.findFirst({ select: { id: true } });
  if (existing) {
    return { error: "Draw already completed. A winner already exists." };
  }

  try {
    const eligibleEntries = await prisma.entry.findMany({
      where: {
        excluded: false,
        winner: null,
      },
      select: { id: true },
    });

    if (eligibleEntries.length < 1) {
      return { error: "No eligible entries to draw from." };
    }

    const pick =
      eligibleEntries[Math.floor(Math.random() * eligibleEntries.length)];

    try {
      await prisma.winner.create({
        data: {
          entryId: pick.id,
          place: 1,
        },
      });
    } catch (error: unknown) {
      // Unique on place — another concurrent draw won the race
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        return { error: "Draw already completed. A winner already exists." };
      }
      throw error;
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/winners");
    return { success: true };
  } catch (error: unknown) {
    console.error("Draw error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while drawing the winner.",
    };
  }
}
