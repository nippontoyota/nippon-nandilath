import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding data...");

  console.log("Nothing to seed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
