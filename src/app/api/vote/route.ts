import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get current month key e.g. "2026-04"
    const month = new Date().toISOString().slice(0, 7);

    const tracks = await prisma.track.findMany({
      include: {
        artist: { select: { name: true } },
        _count: { select: { votes: true } },
        votes: { where: { month }, select: { userId: true } },
      },
      orderBy: { votes: { _count: 'desc' } },
    });

    return NextResponse.json({ success: true, tracks, month });
  } catch (error) {
    console.error('Vote GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { trackId } = body;

    // Allow guest voting with a temp ID for demo
    const userId = (session?.user as any)?.id || body.guestId;
    if (!userId || !trackId) {
      return NextResponse.json({ error: 'User and track required.' }, { status: 400 });
    }

    const month = new Date().toISOString().slice(0, 7);

    // Check if already voted this month
    const existing = await prisma.vote.findUnique({
      where: { userId_month: { userId, month } },
    });
    if (existing) {
      return NextResponse.json({ error: 'You have already voted this month.', alreadyVoted: true }, { status: 409 });
    }

    // Ensure user exists (for guest votes)
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      await prisma.user.create({
        data: {
          id: userId,
          name: `Guest ${userId.slice(0, 4)}`,
        }
      });
    }

    const vote = await prisma.vote.create({ data: { userId, trackId, month } });
    return NextResponse.json({ success: true, vote });
  } catch (error) {
    console.error('Vote POST error:', error);
    return NextResponse.json({ error: 'Failed to record vote.' }, { status: 500 });
  }
}
