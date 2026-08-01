"use server";

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "./auth";

export async function getEligibleEntries(branchId: string) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };

  const entries = await prisma.entry.findMany({
    where: {
      branchId,
      excluded: false,
      winner: null,
    },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return { entries };
}
