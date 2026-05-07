import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing audio URLs...');
  
  // Use a reliable public domain mp3 for all tracks
  const RELIABLE_MP3 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  await prisma.track.updateMany({
    data: {
      audioUrl: RELIABLE_MP3
    }
  });

  console.log('Fixed audio URLs successfully.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
