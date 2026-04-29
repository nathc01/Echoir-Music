import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const title = data.get('title') as string;
    const genre = data.get('genre') as string;
    const description = data.get('description') as string;
    
    // Using a mocked user ID for now
    const artistId = "mock-artist-id"; 

    if (!file) {
      return NextResponse.json({ success: false, error: 'No audio file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const path = join(uploadDir, filename);

    // Write file to local disk
    await writeFile(path, buffer);
    const audioUrl = `/uploads/${filename}`;
    
    // Ensure mock user exists in DB
    let user = await prisma.user.findFirst({ where: { id: artistId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: artistId,
          name: "Indie Guest",
          role: "ARTIST"
        }
      });
    }

    // Save metadata to Database
    const track = await prisma.track.create({
      data: {
        title: title || 'Untitled Track',
        genre: genre || 'Indie',
        audioUrl,
        lyrics: description,
        artistId: user.id
      }
    });

    return NextResponse.json({ success: true, track });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
