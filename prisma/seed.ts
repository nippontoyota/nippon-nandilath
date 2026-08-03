import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding data...");

  // Universal branch for the single entry form (see src/lib/entry-config.ts)
  await prisma.branch.upsert({
    where: { id: "nandilath-universal" },
    update: { name: "Universal", location: "All locations", slug: "universal" },
    create: {
      id: "nandilath-universal",
      name: "Universal",
      location: "All locations",
      slug: "universal",
    },
  });
  console.log("✓ Universal entry branch seeded");

  // 1. Branches — for draw grouping and admin organization
  const branchData = [
    { id: "cms5osbjr0002l804cbo9pd2i", name: "Enjakkal", location: "Enjakkal", slug: "enjakkal" },
    { id: "cms5ot2i80002le046mynnt8w", name: "Irinjalakuda", location: "Irinjalakuda", slug: "irinjalakuda" },
    { id: "cms5oqt3m0000le04jrdhsxm1", name: "Kalamassery", location: "Kalamassery", slug: "kalamassery" },
    { id: "cms5or6q40001jy04nbcfqbuk", name: "Kayamkulam", location: "Kayamkulam", slug: "kayamkulam" },
    { id: "cms5os3um0001l804w9adblzc", name: "Kazhakootam", location: "Kazhakootam", slug: "kazhakootam" },
    { id: "cms5osiqs0003l804im8tnkni", name: "Kollam", location: "Kollam", slug: "kollam" },
    { id: "cms5otini0004le04th2c10zf", name: "Kottayam", location: "Kottayam", slug: "kottayam" },
    { id: "cms5otaur0003le04iict7vgv", name: "Muvattupuzha", location: "Muvattupuzha", slug: "muvattupuzha" },
    { id: "cms5ortwa0000l8040vqzvgwi", name: "Nettoor", location: "Nettoor", slug: "nettoor" },
    { id: "cms5oufp30003jy04q91zb8uo", name: "Pala", location: "Pala", slug: "pala" },
    { id: "cms5ots4l0005le04ydz7yopj", name: "Pathanamthitta", location: "Pathanamthitta", slug: "pathanamthitta" },
    { id: "cms5ou19w0002jy04bafyuh6e", name: "Thiruvalla", location: "Thiruvalla", slug: "thiruvalla" },
    { id: "cms5osq8i0001le04adi0frjt", name: "Trichur", location: "Trichur", slug: "trichur" },
  ];

  for (const b of branchData) {
    await prisma.branch.upsert({
      where: { id: b.id },
      update: { name: b.name, location: b.location, slug: b.slug },
      create: b,
    });
  }
  console.log(`✓ Branches seeded (${branchData.length})`);

  // 2. Toyota model catalogue (names only — colour/VIN fields removed from product)
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
    "Land Cruiser Prado",
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
