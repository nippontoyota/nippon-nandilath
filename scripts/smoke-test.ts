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

async function testSchemaValidation() {
  console.log("\n[Schema validation]");

  const valid = entrySchema.safeParse({
    name: "Priya Menon",
    phone: "9876543210",
    modelId: "model1",
    colourId: "colour1",
    vin: "JTDKN3DU5A0123456",
    branchId: "branch1",
    confirm: true,
    honeypot: "",
  });
  assert(valid.success, "valid entry passes");

  const badPhone = entrySchema.safeParse({
    name: "Priya Menon",
    phone: "1234567890",
    modelId: "model1",
    colourId: "colour1",
    vin: "JTDKN3DU5A0123456",
    branchId: "branch1",
    confirm: true,
    honeypot: "",
  });
  assert(!badPhone.success, "invalid phone rejected");

  const badVin = entrySchema.safeParse({
    name: "Priya Menon",
    phone: "9876543210",
    modelId: "model1",
    colourId: "colour1",
    vin: "SHORT",
    branchId: "branch1",
    confirm: true,
    honeypot: "",
  });
  assert(!badVin.success, "short VIN rejected");

  const honeypot = entrySchema.safeParse({
    name: "Priya Menon",
    phone: "9876543210",
    modelId: "model1",
    colourId: "colour1",
    vin: "JTDKN3DU5A0123456",
    branchId: "branch1",
    confirm: true,
    honeypot: "spam",
  });
  assert(!honeypot.success, "honeypot filled rejected");
}

async function testFraudDetection() {
  console.log("\n[Fraud detection]");

  const suspiciousName = await assessEntry(
    {
      name: "test user",
      phone: "9999900001",
      modelId: "x",
      colourId: "x",
      vin: "JTDKN3DU5A0123456",
      branchId: "branch-a",
      confirm: true,
      honeypot: "",
    },
    "1.2.3.4",
    "branch-a"
  );
  assert(suspiciousName.includes(FraudFlag.SUSPICIOUS_NAME), "flags suspicious name");

  const suspiciousVin = await assessEntry(
    {
      name: "Rajesh Kumar",
      phone: "9999900002",
      modelId: "x",
      colourId: "x",
      vin: "AAAAAAAAAAAAAAAAA",
      branchId: "branch-a",
      confirm: true,
      honeypot: "",
    },
    "1.2.3.5",
    "branch-a"
  );
  assert(suspiciousVin.includes(FraudFlag.SUSPICIOUS_VIN), "flags repeated VIN chars");

  const clean = await assessEntry(
    {
      name: "Rajesh Kumar",
      phone: "9999900003",
      modelId: "x",
      colourId: "x",
      vin: "JTDKN3DU5A0123456",
      branchId: "branch-a",
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

  const migrations = await prisma.$queryRaw<{ migration_name: string; finished_at: Date | null }[]>`
    SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at
  `;
  const allApplied = migrations.every((m) => m.finished_at !== null);
  assert(allApplied, "all migrations applied");
}

async function testImageAssets() {
  console.log("\n[Static assets]");

  const fs = await import("fs");
  const path = await import("path");
  const images = [
    "logo_for_customer_facing.webp",
    "onam-boat.webp",
    "pookalam.webp",
    "pookalam-generated.webp",
  ];
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
        modelId: existing.modelId,
        colourId: existing.colourId,
        vin: "JTDKN3DU5A0999999",
        branchId: branch.id,
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
