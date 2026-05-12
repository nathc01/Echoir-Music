import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Auth check: only ADMIN or the track's own artist can delete
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Find the track first to get file paths and owner
    const track = await prisma.track.findUnique({ where: { id } });
    if (!track) {
      return NextResponse.json({ success: false, error: 'Track not found' }, { status: 404 });
    }

    // Only admin or the artist who owns the track can delete
    if (userRole !== 'ADMIN' && track.artistId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Delete associated votes first (foreign key constraint)
    await prisma.vote.deleteMany({ where: { trackId: id } });

    // Delete the track from DB
    await prisma.track.delete({ where: { id } });

    // Delete local audio file if it's a local upload (starts with /uploads/)
    if (track.audioUrl?.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', track.audioUrl);
      await unlink(filePath).catch(() => {}); // ignore if file doesn't exist
    }

    // Delete local cover file if it's a local upload
    if (track.coverUrl?.startsWith('/uploads/')) {
      const coverPath = join(process.cwd(), 'public', track.coverUrl);
      await unlink(coverPath).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Track Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete track' }, { status: 500 });
  }
}
