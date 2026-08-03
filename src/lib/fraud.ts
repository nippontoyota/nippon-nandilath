import { prisma } from "@/lib/prisma";
import type { EntryInput } from "@/schemas/entry";

export enum FraudFlag {
  SUSPICIOUS_NAME = "SUSPICIOUS_NAME",
  MULTI_PHONE_DEVICE = "MULTI_PHONE_DEVICE",
}

const TEST_NAMES = ["test", "asdf", "demo", "dummy", "fake", "unknown"];

/** Sync-only flags — no DB. */
export function assessEntrySync(data: EntryInput): FraudFlag[] {
  const flags: FraudFlag[] = [];
  const lowerName = data.name.toLowerCase();
  if (TEST_NAMES.some((t) => lowerName.includes(t)) || lowerName.length < 3) {
    flags.push(FraudFlag.SUSPICIOUS_NAME);
  }
  return flags;
}

/** DB fraud checks only — run in parallel with other lookups. */
export async function assessEntryDb(phone: string, ip: string): Promise<FraudFlag[]> {
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);

  const recentIpPhones = await prisma.entry.findMany({
    where: { ip, createdAt: { gte: twoMinsAgo } },
    select: { phone: true },
  });

  const flags: FraudFlag[] = [];
  const uniquePhones = new Set(recentIpPhones.map((e) => e.phone));
  if (uniquePhones.size >= 2 && !uniquePhones.has(phone)) {
    flags.push(FraudFlag.MULTI_PHONE_DEVICE);
  }
  return flags;
}

export async function assessEntry(data: EntryInput, ip: string): Promise<FraudFlag[]> {
  const normalizedPhone = `+91${data.phone}`;
  const dbFlags = await assessEntryDb(normalizedPhone, ip);
  return [...assessEntrySync(data), ...dbFlags];
}
