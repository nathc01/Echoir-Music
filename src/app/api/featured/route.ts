import { NextResponse } from 'next/server';

// Fetches fresh 30-second preview URLs from Deezer public API at request time
// so they never expire from client cache

const TRACKS = [
  { id: 't1', title: 'ceilings', artist: 'Lizzy McAlpine', genre: 'Indie Folk', deezerId: '1875447247',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/d0eaf634445f49ad8ee6c9571874e059/500x500-000000-80-0-0.jpg' },
  { id: 't2', title: 'five seconds flat', artist: 'Lizzy McAlpine', genre: 'Indie Folk', deezerId: '1875447257',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/d0eaf634445f49ad8ee6c9571874e059/500x500-000000-80-0-0.jpg' },
  { id: 't3', title: 'Best Part (feat. H.E.R.)', artist: 'Daniel Caesar', genre: 'R&B / Neo-Soul', deezerId: '417767192',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/4dff56488d13d0b5e96d93d895c9624b/500x500-000000-80-0-0.jpg' },
  { id: 't4', title: 'Get You (feat. Kali Uchis)', artist: 'Daniel Caesar', genre: 'R&B / Neo-Soul', deezerId: '3255009791',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/282e45bef1995c2c6f2901e34c4ab560/500x500-000000-80-0-0.jpg' },
  { id: 't5', title: 'Before', artist: 'NIKI', genre: 'Indie Pop', deezerId: '2982136211',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/3f61783ca024dfd8f5cffdf92c55cf19/500x500-000000-80-0-0.jpg' },
  { id: 't6', title: 'Indigo (Live at The Wiltern)', artist: 'NIKI', genre: 'Indie Pop', deezerId: '3396401541',
    coverUrl: 'https://cdn-images.dzcdn.net/images/cover/78b606fcd85601bebe09d1952187f11a/500x500-000000-80-0-0.jpg' },
];

export async function GET() {
  try {
    const results = await Promise.all(
      TRACKS.map(async (track) => {
        try {
          const res = await fetch(`https://api.deezer.com/track/${track.deezerId}`, {
            next: { revalidate: 3600 }, // cache for 1 hour
          });
          const data = await res.json();
          return {
            ...track,
            audioUrl: data.preview || '',
          };
        } catch (error) {
          console.error(`Error fetching Deezer track ${track.deezerId}:`, error);
          return { ...track, audioUrl: '' };
        }
      })
    );

    return NextResponse.json({ success: true, tracks: results });
  } catch (error) {
    console.error('Featured tracks error:', error);
    return NextResponse.json({ success: false, tracks: [] }, { status: 500 });
  }
}
