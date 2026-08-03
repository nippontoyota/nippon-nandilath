import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding data...");

  const modelNames = [
    "Fortuner",
    "Innova Crysta",
    "Innova HyCross",
    "Camry",
    "Hilux",
    "Glanza",
    "Urban Cruiser Taisor",
    "Urban Cruiser HyRyder",
    "Urban Cruiser Ebella",
    "Legender",
    "Land Cruiser 300",
    "Vellfire",
  ];

  for (const name of modelNames) {
    await prisma.model.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✓ ${name}`);
  }

  console.log(`\nSeeding complete! ${modelNames.length} models seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
