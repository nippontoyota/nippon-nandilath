"use server";

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "./auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getModels() {
  return prisma.model.findMany({
    orderBy: { name: "asc" },
  });
}

// ─── Model CRUD ───────────────────────────────────────────────────────────────

export async function addModel(formData: FormData) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };

  const name = z.string().min(1).max(100).safeParse(formData.get("name"));
  if (!name.success) return { error: "Invalid model name" };

  try {
    await prisma.model.create({ data: { name: name.data } });
    revalidatePath("/admin/dashboard/models");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique")) return { error: "Model already exists" };
    return { error: "Failed to add model" };
  }
}

export async function deleteModel(id: string) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };

  const hasEntries = await prisma.entry.count({ where: { modelId: id } });
  if (hasEntries > 0)
    return { error: "Cannot delete model — it has existing entries" };

  try {
    await prisma.model.delete({ where: { id } });
    revalidatePath("/admin/dashboard/models");
    return { success: true };
  } catch {
    return { error: "Failed to delete model" };
  }
}

