import { prisma } from "@/lib/prisma";
import type { EntryInput } from "@/schemas/entry";

export enum FraudFlag {
  MULTI_BRANCH_PHONE = "MULTI_BRANCH_PHONE",
  SUSPICIOUS_NAME = "SUSPICIOUS_NAME",
  MULTI_PHONE_DEVICE = "MULTI_PHONE_DEVICE",
  SUSPICIOUS_VIN = "SUSPICIOUS_VIN",
}

const TEST_NAMES = ["test", "asdf", "demo", "dummy", "fake", "unknown"];

/** Sync-only flags — no DB. */
export function assessEntrySync(data: EntryInput): FraudFlag[] {
  const flags: FraudFlag[] = [];
  const lowerName = data.name.toLowerCase();
  if (TEST_NAMES.some((t) => lowerName.includes(t)) || lowerName.length < 3) {
    flags.push(FraudFlag.SUSPICIOUS_NAME);
  }
  if (/(.)\1{4,}/.test(data.vin.toUpperCase())) {
    flags.push(FraudFlag.SUSPICIOUS_VIN);
  }
  return flags;
}

/** DB fraud checks only — run in parallel with other lookups. */
export async function assessEntryDb(
  phone: string,
  ip: string,
  branchId: string
): Promise<FraudFlag[]> {
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);

  const [otherBranchHit, recentIpPhones] = await Promise.all([
    prisma.entry.findFirst({
      where: {
        phone,
        createdAt: { gte: fiveMinsAgo },
        branchId: { not: branchId },
      },
      select: { id: true },
    }),
    prisma.entry.findMany({
      where: { ip, createdAt: { gte: twoMinsAgo } },
      select: { phone: true },
    }),
  ]);

  const flags: FraudFlag[] = [];
  if (otherBranchHit) flags.push(FraudFlag.MULTI_BRANCH_PHONE);

  const uniquePhones = new Set(recentIpPhones.map((e) => e.phone));
  if (uniquePhones.size >= 2 && !uniquePhones.has(phone)) {
    flags.push(FraudFlag.MULTI_PHONE_DEVICE);
  }
  return flags;
}

export async function assessEntry(data: EntryInput, ip: string, branchId: string): Promise<FraudFlag[]> {
  const normalizedPhone = `+91${data.phone}`;
  const dbFlags = await assessEntryDb(normalizedPhone, ip, branchId);
  return [...assessEntrySync(data), ...dbFlags];
}
