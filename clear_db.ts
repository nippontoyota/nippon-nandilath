import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Clearing entries and winners...");
  
  // Only clearing user data, keeping models, branches, and colours intact
  await prisma.winner.deleteMany({});
  await prisma.entry.deleteMany({});
  
  // Optionally, if you also want to delete all branches (since testing created a lot):
  // await prisma.branch.deleteMany({}); 

  console.log("Database cleared.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
