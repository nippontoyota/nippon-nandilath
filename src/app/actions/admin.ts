"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBranch(formData: FormData) {
  const name = formData.get("name") as string;
  const location = formData.get("location") as string;

  if (!name) {
    return { error: "Branch name is required" };
  }

  // Auto-generate slug from name (lowercase, replace spaces and special chars with hyphens)
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    await prisma.branch.create({
      data: {
        name,
        location,
        slug,
      },
    });

    revalidatePath("/admin/dashboard/branches");
    return { success: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      const target = error?.meta?.target;
      return { error: `A branch with this name/slug already exists. (Target: ${JSON.stringify(target)} | Generated slug: ${slug})` };
    }
    return { error: `Failed to create branch: ${error?.message || String(error)}` };
  }
}

export async function deleteBranch(branchId: string) {
  try {
    // Delete in a transaction to handle foreign key constraints safely
    await prisma.$transaction(async (tx) => {
      // 1. Delete all winners for this branch
      await tx.winner.deleteMany({
        where: { branchId },
      });

      // 2. Delete all entries for this branch
      await tx.entry.deleteMany({
        where: { branchId },
      });

      // 3. Delete the branch itself
      await tx.branch.delete({
        where: { id: branchId },
      });
    });

    revalidatePath("/admin/dashboard/branches");
    // Also revalidate entries page since we just deleted entries
    revalidatePath("/admin/dashboard/entries");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete branch:", error);
    return { error: `Failed to delete branch: ${error?.message || String(error)}` };
  }
}

export async function deleteBranches(branchIds: string[]) {
  if (!branchIds || branchIds.length === 0) return { success: true };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete all winners for these branches
      await tx.winner.deleteMany({
        where: { branchId: { in: branchIds } },
      });

      // 2. Delete all entries for these branches
      await tx.entry.deleteMany({
        where: { branchId: { in: branchIds } },
      });

      // 3. Delete the branches themselves
      await tx.branch.deleteMany({
        where: { id: { in: branchIds } },
      });
    });

    revalidatePath("/admin/dashboard/branches");
    revalidatePath("/admin/dashboard/entries");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete branches:", error);
    return { error: `Failed to delete branches: ${error?.message || String(error)}` };
  }
}

