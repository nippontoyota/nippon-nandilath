"use server";

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "./auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getModels() {
  return prisma.model.findMany({
    include: { colours: true },
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
    // Delete colours first (no entries reference them at this point)
    await prisma.$transaction([
      prisma.colour.deleteMany({ where: { modelId: id } }),
      prisma.model.delete({ where: { id } }),
    ]);
    revalidatePath("/admin/dashboard/models");
    return { success: true };
  } catch {
    return { error: "Failed to delete model" };
  }
}

// ─── Colour CRUD ──────────────────────────────────────────────────────────────

export async function addColour(formData: FormData) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };

  const modelId = z.string().min(1).safeParse(formData.get("modelId"));
  const name = z.string().min(1).max(100).safeParse(formData.get("name"));

  if (!modelId.success || !name.success) return { error: "Invalid input" };

  try {
    await prisma.colour.create({
      data: {
        name: name.data,
        modelId: modelId.data,
      },
    });
    revalidatePath("/admin/dashboard/models");
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique")) return { error: "Colour already exists for this model" };
    return { error: "Failed to add colour" };
  }
}

export async function editColour(id: string, formData: FormData) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };

  const name = z.string().min(1).max(100).safeParse(formData.get("name"));

  if (!name.success) return { error: "Invalid colour name" };

  try {
    await prisma.colour.update({
      where: { id },
      data: { name: name.data },
    });
    revalidatePath("/admin/dashboard/models");
    return { success: true };
  } catch {
    return { error: "Failed to update colour" };
  }
}

export async function deleteColour(id: string) {
  if (!(await isAuthenticated())) return { error: "Unauthorized" };

  const hasEntries = await prisma.entry.count({ where: { colourId: id } });
  if (hasEntries > 0)
    return { error: "Cannot delete colour — it has existing entries" };

  try {
    await prisma.colour.delete({ where: { id } });
    revalidatePath("/admin/dashboard/models");
    return { success: true };
  } catch {
    return { error: "Failed to delete colour" };
  }
}
