import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  // Clean up existing data
  await prisma.vote.deleteMany();
  await prisma.track.deleteMany();
  await prisma.user.deleteMany();

  // Seed Artists
  const lizzy = await prisma.user.create({
    data: {
      name: 'Lizzy McAlpine',
      email: 'lizzy@example.com',
      image: 'https://cdn-images.dzcdn.net/images/artist/b5c5ce7b4520dd1c6ad07587bf9e17fa/500x500-000000-80-0-0.jpg',
      role: 'ARTIST',
    }
  });

  const daniel = await prisma.user.create({
    data: {
      name: 'Daniel Caesar',
      email: 'daniel@example.com',
      image: 'https://cdn-images.dzcdn.net/images/artist/973809864ad1c52d8c61238662400089/500x500-000000-80-0-0.jpg',
      role: 'ARTIST',
    }
  });

  const niki = await prisma.user.create({
    data: {
      name: 'NIKI',
      email: 'niki@example.com',
      image: 'https://cdn-images.dzcdn.net/images/artist/324c50c04a5a944117cd3daa0963fc63/500x500-000000-80-0-0.jpg',
      role: 'ARTIST',
    }
  });

  // Seed Tracks
  // SoundHelix MP3s are free, public domain, and never expire
  const tracks = [
    { title: 'ceilings', genre: 'Indie Folk', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/d0eaf634445f49ad8ee6c9571874e059/500x500-000000-80-0-0.jpg', artistId: lizzy.id, plays: 15400 },
    { title: 'Evergreen', genre: 'Indie Folk', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/d0eaf634445f49ad8ee6c9571874e059/500x500-000000-80-0-0.jpg', artistId: lizzy.id, plays: 12000 },
    { title: 'Best Part', genre: 'R&B / Neo-Soul', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/4dff56488d13d0b5e96d93d895c9624b/500x500-000000-80-0-0.jpg', artistId: daniel.id, plays: 18000 },
    { title: 'Get You', genre: 'R&B / Neo-Soul', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/282e45bef1995c2c6f2901e34c4ab560/500x500-000000-80-0-0.jpg', artistId: daniel.id, plays: 16500 },
    { title: 'Indigo', genre: 'Indie Pop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/28aeea0a18458309de3004f0bb3cda59/500x500-000000-80-0-0.jpg', artistId: niki.id, plays: 14200 },
    { title: 'Before', genre: 'Indie Pop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', coverUrl: 'https://cdn-images.dzcdn.net/images/cover/3f61783ca024dfd8f5cffdf92c55cf19/500x500-000000-80-0-0.jpg', artistId: niki.id, plays: 13800 },
  ];

  for (const t of tracks) {
    await prisma.track.create({ data: t });
  }

  // Add some initial votes for the month
  const month = new Date().toISOString().slice(0, 7);
  const allTracks = await prisma.track.findMany();
  
  // Lizzy: ceilings
  const lizzyTrack = allTracks.find(t => t.title === 'ceilings')!;
  // Daniel: Best Part
  const danielTrack = allTracks.find(t => t.title === 'Best Part')!;
  // NIKI: Indigo
  const nikiTrack = allTracks.find(t => t.title === 'Indigo')!;

  for (let i = 0; i < 18; i++) {
    const user = await prisma.user.create({ data: { name: `Voter ${i}` } });
    await prisma.vote.create({ data: { month, userId: user.id, trackId: lizzyTrack.id } });
  }
  for (let i = 0; i < 15; i++) {
    const user = await prisma.user.create({ data: { name: `Voter D${i}` } });
    await prisma.vote.create({ data: { month, userId: user.id, trackId: danielTrack.id } });
  }
  for (let i = 0; i < 12; i++) {
    const user = await prisma.user.create({ data: { name: `Voter N${i}` } });
    await prisma.vote.create({ data: { month, userId: user.id, trackId: nikiTrack.id } });
  }

  console.log('Database seeded successfully.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
