import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { join } from 'path';

const prisma = new PrismaClient();

const uploadedTracks = [
  {
    filename: '1778464674369-before_niki.mp3',
    coverFilename: '1778464674380-cover_niki.png',
    title: 'Before',
    genre: 'Indie Pop',
    artistName: 'NIKI',
    artistEmail: 'niki@example.com',
    artistImage: 'https://cdn-images.dzcdn.net/images/artist/324c50c04a5a944117cd3daa0963fc63/500x500-000000-80-0-0.jpg',
  },
  {
    filename: '1778464970744-indigo_niki.mp3',
    coverFilename: '1778464970750-cover_niki.png',
    title: 'Indigo',
    genre: 'Indie Pop',
    artistName: 'NIKI',
    artistEmail: 'niki@example.com',
    artistImage: 'https://cdn-images.dzcdn.net/images/artist/324c50c04a5a944117cd3daa0963fc63/500x500-000000-80-0-0.jpg',
  },
  {
    filename: '1778465024745-get_you_daniel_caesar.mp3',
    coverFilename: '1778465024759-images.jpeg',
    title: 'Get You',
    genre: 'R&B / Neo-Soul',
    artistName: 'Daniel Caesar',
    artistEmail: 'daniel@example.com',
    artistImage: 'https://cdn-images.dzcdn.net/images/artist/973809864ad1c52d8c61238662400089/500x500-000000-80-0-0.jpg',
  },
  {
    filename: '1778465059376-best_part_daniel_caesar.mp3',
    coverFilename: '1778465059383-Daniel_Caesar_Get_You.jpg',
    title: 'Best Part',
    genre: 'R&B / Neo-Soul',
    artistName: 'Daniel Caesar',
    artistEmail: 'daniel@example.com',
    artistImage: 'https://cdn-images.dzcdn.net/images/artist/973809864ad1c52d8c61238662400089/500x500-000000-80-0-0.jpg',
  },
  {
    filename: '1778465085358-evergreen_lizzy.mp3',
    coverFilename: '1778465085369-Give_Me_a_Minute_–_Lizzy_McAlpine.png',
    title: 'Evergreen',
    genre: 'Indie Folk',
    artistName: 'Lizzy McAlpine',
    artistEmail: 'lizzy@example.com',
    artistImage: 'https://cdn-images.dzcdn.net/images/artist/b5c5ce7b4520dd1c6ad07587bf9e17fa/500x500-000000-80-0-0.jpg',
  },
  {
    filename: '1778465114264-ceilings_lizzy.mp3',
    coverFilename: '1778465114273-lizzy_cover.jpg',
    title: 'ceilings',
    genre: 'Indie Folk',
    artistName: 'Lizzy McAlpine',
    artistEmail: 'lizzy@example.com',
    artistImage: 'https://cdn-images.dzcdn.net/images/artist/b5c5ce7b4520dd1c6ad07587bf9e17fa/500x500-000000-80-0-0.jpg',
  },
];

async function getDuration(filePath: string): Promise<number | undefined> {
  try {
    // Dynamic ESM import for music-metadata (ESM-only package)
    const { parseFile } = await import('music-metadata' as any);
    const metadata = await parseFile(filePath);
    return metadata.format.duration;
  } catch (e) {
    console.warn('Could not read duration:', e);
    return undefined;
  }
}

async function main() {
  console.log('Recovering uploaded tracks...\n');

  // Remove all existing seed/default tracks and users
  await prisma.vote.deleteMany();
  await prisma.track.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared old seed data.');

  const artistCache: Record<string, string> = {};

  for (const t of uploadedTracks) {
    // Get or create artist
    if (!artistCache[t.artistEmail]) {
      let user = await prisma.user.findUnique({ where: { email: t.artistEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: t.artistName,
            email: t.artistEmail,
            image: t.artistImage,
            role: 'ARTIST',
          }
        });
      }
      artistCache[t.artistEmail] = user.id;
    }

    const filePath = join(process.cwd(), 'public', 'uploads', t.filename);
    const duration = await getDuration(filePath);

    await prisma.track.create({
      data: {
        title: t.title,
        genre: t.genre,
        audioUrl: `/uploads/${t.filename}`,
        coverUrl: `/uploads/covers/${t.coverFilename}`,
        duration,
        artistId: artistCache[t.artistEmail],
        plays: 0,
      }
    });

    console.log(`  ✓ ${t.title} — ${t.artistName} (${duration ? Math.floor(duration / 60) + ':' + String(Math.floor(duration % 60)).padStart(2, '0') : 'no duration'})`);
  }

  console.log('\n✅ All uploaded tracks restored successfully!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
