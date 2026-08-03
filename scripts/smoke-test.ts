// @ts-nocheck
/**
 * Pre-production smoke tests. Run: npx tsx scripts/smoke-test.ts
 */
import { prisma } from "../src/lib/prisma";
import { assessEntry } from "../src/lib/fraud";
import { entrySchema } from "../src/schemas/entry";
import { FraudFlag } from "../src/lib/fraud";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

const validEntry = {
  name: "Priya Menon",
  phone: "9876543210",
  customerLocation: "Kochi",
  interestedInPurchase: "Yes",
  modelId: "model1",
  branchId: "branch1",
  confirm: true,
  honeypot: "",
};

async function testSchemaValidation() {
  console.log("\n[Schema validation]");

  assert(entrySchema.safeParse(validEntry).success, "valid entry passes");

  const badPhone = entrySchema.safeParse({ ...validEntry, phone: "1234567890" });
  assert(!badPhone.success, "invalid phone rejected");

  const missingModel = entrySchema.safeParse({
    ...validEntry,
    interestedInPurchase: "Yes",
    modelId: undefined,
  });
  assert(!missingModel.success, "purchase intent without model rejected");

  const honeypot = entrySchema.safeParse({ ...validEntry, honeypot: "spam" });
  assert(!honeypot.success, "honeypot filled rejected");
}

async function testFraudDetection() {
  console.log("\n[Fraud detection]");

  const suspiciousName = await assessEntry(
    {
      name: "test user",
      phone: "9999900001",
      customerLocation: "Kochi",
      interestedInPurchase: "No",
      confirm: true,
      honeypot: "",
    },
    "1.2.3.4",
    "branch-a"
  );
  assert(suspiciousName.includes(FraudFlag.SUSPICIOUS_NAME), "flags suspicious name");

  const clean = await assessEntry(
    {
      name: "Rajesh Kumar",
      phone: "9999900003",
      customerLocation: "Kochi",
      interestedInPurchase: "No",
      confirm: true,
      honeypot: "",
    },
    "9.9.9.9",
    "branch-a"
  );
  assert(clean.length === 0, "clean entry has no flags");
}

async function testDatabaseConnectivity() {
  console.log("\n[Database]");

  const [branchCount, entryCount, modelCount] = await Promise.all([
    prisma.branch.count(),
    prisma.entry.count(),
    prisma.model.count(),
  ]);

  assert(branchCount > 0, `branches exist (${branchCount})`);
  assert(modelCount > 0, `models exist (${modelCount})`);
  console.log(`  ℹ ${entryCount} entries in database`);
}

async function testImageAssets() {
  console.log("\n[Static assets]");

  const fs = await import("fs");
  const path = await import("path");
  const images = ["nandilath-nippon.png", "gopu-nandilath.png", "maveli.png"];
  for (const img of images) {
    const exists = fs.existsSync(path.join(process.cwd(), "public/images", img));
    assert(exists, `${img} exists`);
  }
}

async function testPhoneNormalization() {
  console.log("\n[Phone normalization in fraud]");

  const branch = await prisma.branch.findFirst();
  if (!branch) {
    console.log("  ⚠ skipped (no branch)");
    return;
  }

  const testPhone = "8888800001";
  const normalizedPhone = `+91${testPhone}`;
  const existing = await prisma.entry.findFirst({ where: { phone: normalizedPhone } });

  if (existing) {
    const flags = await assessEntry(
      {
        name: "Existing User",
        phone: testPhone,
        customerLocation: "Kochi",
        interestedInPurchase: "No",
        confirm: true,
        honeypot: "",
      },
      existing.ip || "127.0.0.1",
      branch.id
    );
    assert(
      flags.includes(FraudFlag.MULTI_BRANCH_PHONE) || existing.branchId === branch.id,
      "phone lookup uses +91 prefix (multi-branch check works)"
    );
  } else {
    console.log("  ℹ skipped multi-branch test (no existing entry with test phone)");
  }
}

async function main() {
  console.log("=== Nandilath Nippon Lucky Draw — Pre-Production Smoke Tests ===");

  await testSchemaValidation();
  await testFraudDetection();
  await testDatabaseConnectivity();
  await testImageAssets();
  await testPhoneNormalization();

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

main()
  .catch((e) => {
    console.error("Smoke test crashed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
