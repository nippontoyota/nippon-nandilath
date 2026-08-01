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

  // 2. Full Toyota India Catalogue
  const catalogue = [
    {
      name: "Fortuner",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Phantom Brown", "Pearl White", "Bronze Mica", "Sparkling Black Crystal Shine"],
    },
    {
      name: "Innova Crysta",
      colours: ["Super White", "Silver", "Attitude Black", "Graphite Grey", "Champagne", "Grey Metallic", "White Pearl", "Mica Brown"],
    },
    {
      name: "Innova HyCross",
      colours: ["Platinum White Pearl", "Midnight Black", "Sparkling Black Crystal Shine", "Mystic Bronze", "Golden Bronze", "Avant Garde Bronze", "Carnival Amber", "Tyrol Silver Gray", "Cyan Kyanite"],
    },
    {
      name: "Camry",
      colours: ["Attitude Black", "Silver", "Graphite Grey", "Platinum White Pearl", "Ruby Flare Red", "Precious Metal"],
    },
    {
      name: "Hilux",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Silver", "Orange Metallic"],
    },
    {
      name: "Glanza",
      colours: ["Sportin Red", "Gaming Grey", "Sterling Silver", "Sizzling Yellow", "Cafe White", "Nippon Blue", "Entertainer Orange", "Black"],
    },
    {
      name: "Urban Cruiser Taisor",
      colours: ["Entertainer Orange", "Sportin Red", "Cafe White", "Sterling Silver", "Gaming Grey", "Black"],
    },
    {
      name: "Urban Cruiser HyRyder",
      colours: ["Sportin Red", "Cafe White", "Sterling Silver", "Gaming Grey", "Sprayed Teal", "Blackish Agave", "Black"],
    },
    {
      name: "Urban Cruiser Ebella",
      colours: ["Cafe White", "Entertainer Orange", "Sportin Red", "Sterling Silver", "Gaming Grey", "Black"],
    },
    {
      name: "Legender",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Phantom Brown", "Pearl White", "Bronze Mica"],
    },
    {
      name: "Land Cruiser 300",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Pearl White", "Silky White", "Dark Blue Mica", "Dark Red Mica", "Fine Silver"],
    },
    {
      name: "Vellfire",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Dark Blue Mica", "Precious Bronze", "Platinum White Pearl", "Silver", "Red Mica Metallic"],
    },
    {
      name: "Land Cruiser Prado",
      colours: ["Super White", "Attitude Black", "Graphite Grey", "Pearl White", "Dark Blue Mica", "Dark Red Mica", "Fine Silver", "Silky White"],
    },
  ];

  // Upsert models, then batch-insert all colours for each model
  for (const m of catalogue) {
    const model = await prisma.model.upsert({
      where: { name: m.name },
      update: {},
      create: { name: m.name },
    });

    // Batch create all colours in one query — skipDuplicates handles re-runs
    await prisma.colour.createMany({
      data: m.colours.map((name) => ({ name, modelId: model.id })),
      skipDuplicates: true,
    });

    console.log(`  ✓ ${m.name} (${m.colours.length} colours)`);
  }

  console.log(`\nSeeding complete! ${catalogue.length} models seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
