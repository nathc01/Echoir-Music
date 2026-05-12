import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const coverFile: File | null = data.get('cover') as unknown as File;
    const title = data.get('title') as string;
    const musicianName = data.get('musicianName') as string;
    const genre = data.get('genre') as string;
    const description = data.get('description') as string;
    const lyricsField = data.get('lyrics') as string;
    
    // Auth: only ARTIST or ADMIN can upload
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in to upload.' }, { status: 401 });
    }
    const userRole = (session.user as any).role as string;
    const userId = (session.user as any).id as string;
    if (userRole !== 'ARTIST' && userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden: Only artists can upload tracks.' }, { status: 403 });
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'No audio file provided' }, { status: 400 });
    }

    // Read audio bytes
    const audioBytes = await file.arrayBuffer();
    const audioBuffer = Buffer.from(audioBytes);

    // Detect audio duration using music-metadata (dynamic ESM import)
    let duration: number | undefined = undefined;
    try {
      const { parseBuffer } = await import('music-metadata' as any);
      const metadata = await parseBuffer(audioBuffer, { mimeType: file.type || 'audio/mpeg' });
      if (metadata.format.duration) {
        duration = metadata.format.duration;
      }
    } catch (metaErr) {
      console.warn('Could not read audio metadata:', metaErr);
    }

    // Save audio file to public/uploads/
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const audioFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    await writeFile(join(uploadDir, audioFilename), audioBuffer);
    const audioUrl = `/uploads/${audioFilename}`;

    // Save cover art if provided
    let coverUrl: string | undefined = undefined;
    if (coverFile && coverFile.size > 0) {
      const coverBytes = await coverFile.arrayBuffer();
      const coverBuffer = Buffer.from(coverBytes);
      const coverDir = join(process.cwd(), 'public', 'uploads', 'covers');
      await mkdir(coverDir, { recursive: true });
      const coverFilename = `${Date.now()}-${coverFile.name.replace(/\s+/g, '_')}`;
      await writeFile(join(coverDir, coverFilename), coverBuffer);
      coverUrl = `/uploads/covers/${coverFilename}`;
    }
    
    // Ensure user exists in DB (should always exist if authenticated)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Save metadata to Database
    const track = await prisma.track.create({
      data: {
        title: title || 'Untitled Track',
        musicianName: musicianName || null,
        genre: genre || 'Indie',
        audioUrl,
        coverUrl,
        duration,
        lyrics: lyricsField || description || null,
        artistId: user.id
      }
    });

    return NextResponse.json({ success: true, track });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
