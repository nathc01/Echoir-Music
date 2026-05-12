import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.track.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} tracks from database.`);
  
  // Also delete votes related to tracks (cascade should handle, but just in case)
  const deletedVotes = await prisma.vote.deleteMany({});
  console.log(`✅ Deleted ${deletedVotes.count} votes.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
