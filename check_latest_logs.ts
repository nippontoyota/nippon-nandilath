import { prisma } from './src/lib/prisma';
async function main() {
  const logs = await prisma.whatsAppLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log(logs);
}
main().finally(() => prisma.$disconnect());
