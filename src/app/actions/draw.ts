"use server";

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "./auth";
import { revalidatePath } from "next/cache";

function revalidateDrawPaths() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/winners");
}

async function pickAndCreateWinner() {
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

  return { success: true as const };
}

export async function drawWinner() {
  if (!(await isAuthenticated())) {
    return { error: "Unauthorized" };
  }

  const existing = await prisma.winner.findFirst({ select: { id: true } });
  if (existing) {
    return { error: "Draw already completed. A winner already exists." };
  }

  try {
    const result = await pickAndCreateWinner();
    if (result.error) return result;

    revalidateDrawPaths();
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

/** Remove the winner record. The entry stays eligible for a future draw. */
export async function clearWinner() {
  if (!(await isAuthenticated())) {
    return { error: "Unauthorized" };
  }

  try {
    const existing = await prisma.winner.findFirst({ select: { id: true } });
    if (!existing) {
      return { error: "No winner to clear." };
    }

    await prisma.winner.delete({ where: { id: existing.id } });
    revalidateDrawPaths();
    return { success: true };
  } catch (error: unknown) {
    console.error("Clear winner error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while clearing the winner.",
    };
  }
}

/** Clear the current winner (if any) and draw a new one. Previous winner stays eligible. */
export async function redrawWinner() {
  if (!(await isAuthenticated())) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.winner.deleteMany();
    const result = await pickAndCreateWinner();
    if (result.error) return result;

    revalidateDrawPaths();
    return { success: true };
  } catch (error: unknown) {
    console.error("Redraw error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while redrawing the winner.",
    };
  }
}
