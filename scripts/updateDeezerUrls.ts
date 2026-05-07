import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEEZER_MAPPING: Record<string, string> = {
  'ceilings': '1875447247',
  'Evergreen': '1875447257',
  'Best Part': '417767192',
  'Get You': '3255009791',
  'Before': '2982136211',
  'Indigo': '3396401541',
};

async function main() {
  console.log('Fetching real Deezer preview URLs...');
  
  const dbTracks = await prisma.track.findMany();
  
  for (const track of dbTracks) {
    const dzId = DEEZER_MAPPING[track.title];
    if (dzId) {
      try {
        const res = await fetch(`https://api.deezer.com/track/${dzId}`);
        const data = await res.json();
        if (data.preview) {
          await prisma.track.update({
            where: { id: track.id },
            data: { audioUrl: data.preview }
          });
          console.log(`Updated ${track.title} with real Deezer preview.`);
        } else {
          console.log(`No preview found for ${track.title}`);
        }
      } catch (error) {
        console.error(`Failed to fetch for ${track.title}`);
      }
    }
  }

  console.log('Done updating DB audio URLs.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
